import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { JobFilters } from '@/types/job';

type Client = SupabaseClient<Database>;

/** Registra uma busca realizada pelo usuário (filtros aplicados + total de resultados). */
export async function recordSearchHistory(
  supabase: Client,
  userId: string,
  filters: JobFilters,
  resultsCount: number,
) {
  await supabase.from('job_search_history').insert({
    user_id: userId,
    filters: { kind: 'search', ...filters } as unknown as Record<string, unknown>,
    results_count: resultsCount,
  });
}

/** Registra a visualização de uma vaga específica pelo usuário. */
export async function recordJobView(supabase: Client, userId: string, jobId: string) {
  await supabase.from('job_search_history').insert({
    user_id: userId,
    filters: { kind: 'view', jobId } as unknown as Record<string, unknown>,
    results_count: 1,
  });
}

export async function getRecentlyViewedJobIds(
  supabase: Client,
  userId: string,
  limit = 10,
): Promise<string[]> {
  const { data } = await supabase
    .from('job_search_history')
    .select('filters')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  const jobIds: string[] = [];
  for (const row of data ?? []) {
    const filters = row.filters as { kind?: string; jobId?: string };
    if (filters?.kind === 'view' && filters.jobId && !jobIds.includes(filters.jobId)) {
      jobIds.push(filters.jobId);
    }
    if (jobIds.length >= limit) break;
  }
  return jobIds;
}
