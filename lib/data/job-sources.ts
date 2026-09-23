import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type Client = SupabaseClient<Database>;

export async function getJobSourcesStatus(supabase: Client) {
  const { data } = await supabase.from('job_sources').select('*').order('key');
  return data ?? [];
}
