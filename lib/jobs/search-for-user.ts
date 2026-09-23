import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { Job, JobFilters } from '@/types/job';
import type { MatchResult } from '@/types/match';
import { syncJobs } from './sync';
import { getJobsFromDb } from '@/lib/data/jobs';
import { getCandidateProfileForMatching } from '@/lib/data/profile';
import { getFavoriteJobIds } from '@/lib/data/favorites';
import { recordSearchHistory } from '@/lib/data/history';
import { filterJobs, paginate } from './filters';
import { calculateMatch } from '@/lib/matching/calculate-match';

export interface JobWithMatch {
  job: Job;
  match: MatchResult;
  isFavorite: boolean;
}

export interface JobSearchResponse {
  items: JobWithMatch[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sourceErrors: { source: string; message: string }[];
}

/**
 * Busca vagas para um usuário: sincroniza fontes externas (melhor esforço),
 * aplica filtros, calcula compatibilidade com o perfil do candidato e
 * pagina o resultado. Usado tanto pela página /jobs (SSR) quanto pela rota
 * /api/jobs/search (fetch client-side, ex.: busca com debounce).
 */
export async function searchJobsForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  filters: JobFilters,
  options: { skipSync?: boolean; recordHistory?: boolean } = {},
): Promise<JobSearchResponse> {
  let sourceErrors: JobSearchResponse['sourceErrors'] = [];

  if (!options.skipSync) {
    try {
      const result = await syncJobs({
        query: filters.query ?? filters.area,
        technologies: filters.technologies,
        location: filters.location,
        limit: 60,
      });
      sourceErrors = result.errors;
    } catch (error) {
      sourceErrors = [{ source: 'sync', message: error instanceof Error ? error.message : String(error) }];
    }
  }

  const [allJobs, candidateProfile, favoriteIds] = await Promise.all([
    getJobsFromDb(supabase, 300),
    getCandidateProfileForMatching(supabase, userId),
    getFavoriteJobIds(supabase, userId),
  ]);

  const filtered = filterJobs(allJobs, filters);

  const withMatch: JobWithMatch[] = filtered
    .map((job) => ({
      job,
      match: calculateMatch(candidateProfile, job),
      isFavorite: favoriteIds.has(job.id),
    }))
    .filter((entry) => (filters.minCompatibility ? entry.match.score >= filters.minCompatibility : true))
    .sort((a, b) => b.match.score - a.match.score);

  const paginated = paginate(withMatch, filters.page, filters.pageSize);

  if (options.recordHistory !== false) {
    await recordSearchHistory(supabase, userId, filters, paginated.total);
  }

  return {
    items: paginated.items,
    total: paginated.total,
    page: paginated.page,
    pageSize: paginated.pageSize,
    totalPages: paginated.totalPages,
    sourceErrors,
  };
}
