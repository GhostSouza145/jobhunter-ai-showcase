import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { Job } from '@/types/job';
import { mapRowToJob } from '@/lib/jobs/sync';

type Client = SupabaseClient<Database>;

export async function getJobsFromDb(supabase: Client, limit = 200): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(mapRowToJob);
}

export async function getJobByIdFromDb(supabase: Client, id: string): Promise<Job | null> {
  const { data, error } = await supabase.from('jobs').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapRowToJob(data) : null;
}
