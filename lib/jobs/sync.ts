import { createAdminClient } from '@/lib/supabase/server';
import type { Job, JobSourceSearchParams, NormalizedJob } from '@/types/job';
import { getConfiguredSources } from './registry';
import { dedupeJobs, computeDedupeHash } from './dedupe';
import type { Database, EmploymentType } from '@/types/database';

export interface SyncResult {
  jobs: Job[];
  errors: { source: string; message: string }[];
}

/**
 * Busca vagas em todas as fontes configuradas, normaliza, remove
 * duplicadas e persiste no banco (upsert). Se uma fonte falhar, o erro é
 * registrado e as demais fontes continuam normalmente — a aplicação nunca
 * quebra por causa de uma fonte externa indisponível.
 */
export async function syncJobs(params: JobSourceSearchParams): Promise<SyncResult> {
  const sources = getConfiguredSources();
  const errors: SyncResult['errors'] = [];
  const admin = createAdminClient();

  const outcomes = await Promise.all(
    sources.map(async (source) => {
      try {
        const raw = await source.searchJobs(params);
        const normalized = raw.map((item) => source.normalizeJob(item));
        await admin
          .from('job_sources')
          .update({ status: 'active', last_synced_at: new Date().toISOString(), last_error: null })
          .eq('key', source.key);
        return { key: source.key, ok: true as const, jobs: normalized };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await admin.from('job_sources').update({ status: 'error', last_error: message }).eq('key', source.key);
        // eslint-disable-next-line no-console
        console.error(`[jobs:sync] fonte "${source.key}" falhou:`, message);
        return { key: source.key, ok: false as const, message };
      }
    }),
  );

  const allJobs: NormalizedJob[] = [];
  for (const outcome of outcomes) {
    if (outcome.ok) {
      allJobs.push(...outcome.jobs);
    } else {
      errors.push({ source: outcome.key, message: outcome.message });
    }
  }

  const deduped = dedupeJobs(allJobs);

  if (deduped.length === 0) {
    return { jobs: [], errors };
  }

  const rows: Database['public']['Tables']['jobs']['Insert'][] = deduped.map((job) => ({
    source: job.source,
    source_job_id: job.sourceJobId,
    title: job.title,
    company: job.company,
    description: job.description,
    location: job.location,
    remote: job.remote,
    employment_type: job.employmentType,
    level: job.level,
    salary: job.salary,
    url: job.url,
    published_at: job.publishedAt,
    requirements: job.requirements,
    technologies: job.technologies,
    is_demo: job.isDemo,
    dedupe_hash: computeDedupeHash(job),
  }));

  const { data, error } = await admin
    .from('jobs')
    .upsert(rows, { onConflict: 'source,source_job_id' })
    .select();

  if (error) {
    errors.push({ source: 'database', message: error.message });
    return { jobs: [], errors };
  }

  return { jobs: (data ?? []).map(mapRowToJob), errors };
}

export function mapRowToJob(row: Database['public']['Tables']['jobs']['Row']): Job {
  return {
    id: row.id,
    source: row.source,
    sourceJobId: row.source_job_id,
    title: row.title,
    company: row.company,
    description: row.description,
    location: row.location,
    remote: row.remote,
    employmentType: row.employment_type as EmploymentType | null,
    level: row.level,
    salary: row.salary,
    url: row.url,
    publishedAt: row.published_at,
    requirements: row.requirements,
    technologies: row.technologies,
    isDemo: row.is_demo,
    dedupeHash: row.dedupe_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
