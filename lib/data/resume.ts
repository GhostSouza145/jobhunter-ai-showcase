import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type Client = SupabaseClient<Database>;
export type ResumeRow = Database['public']['Tables']['resumes']['Row'];

export async function getLatestResume(supabase: Client, userId: string): Promise<ResumeRow | null> {
  const { data } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}
