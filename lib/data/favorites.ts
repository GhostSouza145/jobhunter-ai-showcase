import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { Job } from '@/types/job';
import { mapRowToJob } from '@/lib/jobs/sync';

type Client = SupabaseClient<Database>;

export async function getFavoriteJobIds(supabase: Client, userId: string): Promise<Set<string>> {
  const { data } = await supabase.from('favorites').select('job_id').eq('user_id', userId);
  return new Set((data ?? []).map((row) => row.job_id));
}

export async function getFavoriteJobs(supabase: Client, userId: string): Promise<Job[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('created_at, jobs(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? [])
    .map((row) => (row as unknown as { jobs: Database['public']['Tables']['jobs']['Row'] | null }).jobs)
    .filter((job): job is Database['public']['Tables']['jobs']['Row'] => Boolean(job))
    .map(mapRowToJob);
}
