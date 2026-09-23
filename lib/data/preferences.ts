import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type Client = SupabaseClient<Database>;
export type SearchPreferencesRow = Database['public']['Tables']['search_preferences']['Row'];

export async function getSearchPreferences(
  supabase: Client,
  userId: string,
): Promise<SearchPreferencesRow | null> {
  const { data } = await supabase
    .from('search_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  return data;
}
