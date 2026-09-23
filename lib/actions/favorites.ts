'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function toggleFavorite(jobId: string): Promise<{ favorited: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { favorited: false, error: 'Não autenticado.' };

  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('job_id', jobId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('favorites').delete().eq('id', existing.id);
    if (error) return { favorited: true, error: error.message };
    revalidatePath('/favorites');
    revalidatePath('/jobs');
    revalidatePath('/dashboard');
    return { favorited: false };
  }

  const { error } = await supabase.from('favorites').insert({ user_id: user.id, job_id: jobId });
  if (error) return { favorited: false, error: error.message };

  revalidatePath('/favorites');
  revalidatePath('/jobs');
  revalidatePath('/dashboard');
  return { favorited: true };
}
