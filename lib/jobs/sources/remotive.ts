import type { JobSource, JobSourceSearchParams, NormalizedJob, RawSourceJob } from './source-interface';
import { guessEmploymentType } from '@/lib/shared/labels';
import { findSkillsInText } from '@/lib/shared/skills-catalog';

/**
 * Remotive (https://remotive.com/api/remote-jobs) é uma API pública,
 * gratuita e documentada para consumo automatizado de vagas remotas — não
 * requer autenticação nem viola termos de uso. Documentação:
 * https://remotive.com/api/remote-jobs
 */
const REMOTIVE_API_URL = 'https://remotive.com/api/remote-jobs';

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  category: string;
  tags: string[];
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  salary: string;
  description: string;
}

export const remotiveSource: JobSource = {
  key: 'remotive',
  name: 'Remotive (API pública)',

  isConfigured() {
    return true;
  },

  async searchJobs(params: JobSourceSearchParams): Promise<RawSourceJob[]> {
    const url = new URL(REMOTIVE_API_URL);
    url.searchParams.set('category', 'software-dev');
    if (params.query) url.searchParams.set('search', params.query);
    if (params.limit) url.searchParams.set('limit', String(params.limit));

    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      throw new Error(`Remotive respondeu com status ${response.status}`);
    }

    const data = (await response.json()) as { jobs: RemotiveJob[] };
    return data.jobs as unknown as RawSourceJob[];
  },

  async getJob(sourceJobId: string): Promise<RawSourceJob | null> {
    const jobs = await this.searchJobs({});
    return jobs.find((raw) => String((raw as unknown as RemotiveJob).id) === sourceJobId) ?? null;
  },

  normalizeJob(raw: RawSourceJob): NormalizedJob {
    const job = raw as unknown as RemotiveJob;
    const description = stripHtml(job.description ?? '');
    const technologies = Array.from(
      new Set([
        ...findSkillsInText([job.title, ...(job.tags ?? [])].join(' ')).map((s) => s.name),
        ...findSkillsInText(description)
          .map((s) => s.name)
          .slice(0, 8),
      ]),
    );

    return {
      source: 'remotive',
      sourceJobId: String(job.id),
      title: job.title,
      company: job.company_name,
      description,
      location: job.candidate_required_location || null,
      remote: 'remote',
      employmentType: guessEmploymentType(job.job_type),
      level: null,
      salary: job.salary || null,
      url: job.url,
      publishedAt: job.publication_date ?? null,
      requirements: extractRequirementLines(description),
      technologies,
      isDemo: false,
    };
  },
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractRequirementLines(description: string): string[] {
  return description
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line.length < 240)
    .slice(0, 30);
}
