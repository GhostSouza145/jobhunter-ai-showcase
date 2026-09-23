'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { resolveSkill } from '@/lib/shared/skills-catalog';
import type { ParsedResumeData } from '@/types/candidate';
import { assertOwner } from '@/lib/auth/guards';

/**
 * Confirma/edita os dados extraídos do currículo e sincroniza as
 * tecnologias reconhecidas com candidate_skills, para alimentar o
 * algoritmo de match. Skills manuais (adicionadas fora do currículo) não
 * são afetadas.
 */
export async function confirmResumeData(resumeId: string, parsed: ParsedResumeData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autenticado.');

  const { data: resume, error: resumeError } = await supabase
    .from('resumes')
    .select('id, user_id')
    .eq('id', resumeId)
    .single();

  if (resumeError || !resume) throw new Error('Currículo não encontrado.');
  assertOwner(user.id, { userId: resume.user_id });

  const { error: updateError } = await supabase
    .from('resumes')
    .update({ parsed: parsed as unknown as Record<string, unknown>, status: 'parsed' })
    .eq('id', resumeId);

  if (updateError) throw updateError;

  const slugs = Array.from(
    new Set(
      parsed.skills
        .map((name) => resolveSkill(name)?.slug)
        .filter((slug): slug is string => Boolean(slug)),
    ),
  );

  if (slugs.length > 0) {
    const { data: skillRows } = await supabase.from('skills').select('id, slug').in('slug', slugs);

    await supabase.from('candidate_skills').delete().eq('user_id', user.id).eq('source', 'resume');

    if (skillRows && skillRows.length > 0) {
      await supabase.from('candidate_skills').upsert(
        skillRows.map((skill) => ({ user_id: user.id, skill_id: skill.id, source: 'resume' as const })),
        { onConflict: 'user_id,skill_id' },
      );
    }
  }

  revalidatePath('/resume');
  revalidatePath('/profile');
  revalidatePath('/dashboard');
  revalidatePath('/jobs');
}
