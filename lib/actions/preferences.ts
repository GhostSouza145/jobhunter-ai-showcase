'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const PreferencesSchema = z.object({
  professionalArea: z.string().trim().max(120).optional().or(z.literal('')),
  employmentTypes: z.array(z.enum(['estagio', 'clt', 'pj', 'temporario', 'trainee'])),
  modality: z.array(z.enum(['remote', 'hybrid', 'onsite'])),
  technologies: z.array(z.string().trim().min(1)).max(50),
  location: z.string().trim().max(120).optional().or(z.literal('')),
});

export type PreferencesFormState = { error?: string; success?: boolean };

export async function updateSearchPreferences(
  input: z.infer<typeof PreferencesSchema>,
): Promise<PreferencesFormState> {
  const parsed = PreferencesSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Não autenticado.' };

  const data = parsed.data;

  const { error } = await supabase.from('search_preferences').upsert(
    {
      user_id: user.id,
      professional_area: data.professionalArea || null,
      employment_types: data.employmentTypes,
      modality: data.modality,
      technologies: data.technologies,
      location: data.location || null,
    },
    { onConflict: 'user_id' },
  );

  if (error) return { error: error.message };

  revalidatePath('/settings');
  revalidatePath('/jobs');
  revalidatePath('/dashboard');
  return { success: true };
}
