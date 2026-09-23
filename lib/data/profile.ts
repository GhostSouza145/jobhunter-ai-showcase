import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { CandidateProfile } from '@/types/candidate';

type Client = SupabaseClient<Database>;
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export async function getProfile(supabase: Client, userId: string): Promise<ProfileRow | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return data;
}

/**
 * Monta o perfil do candidato usado pelo algoritmo de match, combinando os
 * dados do formulário de perfil com as skills extraídas do currículo
 * (candidate_skills), sem duplicar.
 */
export async function getCandidateProfileForMatching(
  supabase: Client,
  userId: string,
): Promise<CandidateProfile> {
  const [{ data: profile }, { data: candidateSkills }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('candidate_skills').select('skills(name)').eq('user_id', userId),
  ]);

  const skillNames = (candidateSkills ?? [])
    .map((row) => (row as unknown as { skills: { name: string } | null }).skills?.name)
    .filter((name): name is string => Boolean(name));

  const technologies = Array.from(new Set([...(profile?.technologies ?? []), ...skillNames]));

  return {
    professionalArea: profile?.professional_area ?? null,
    level: profile?.level ?? null,
    employmentTypes: (profile?.employment_types ?? []) as CandidateProfile['employmentTypes'],
    modality: (profile?.modality ?? []) as CandidateProfile['modality'],
    location: profile?.location ?? null,
    technologies,
    interests: profile?.interests ?? [],
    experience: profile?.experience ?? null,
    education: profile?.education ?? null,
  };
}
