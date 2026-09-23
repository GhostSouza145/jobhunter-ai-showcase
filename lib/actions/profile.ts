'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const ProfileSchema = z.object({
  fullName: z.string().trim().min(1, 'Informe seu nome.').max(120),
  professionalArea: z.string().trim().max(120).optional().or(z.literal('')),
  level: z.enum(['estagio', 'trainee', 'junior', 'pleno', 'senior']).optional().or(z.literal('')),
  employmentTypes: z.array(z.enum(['estagio', 'clt', 'pj', 'temporario', 'trainee'])),
  modality: z.array(z.enum(['remote', 'hybrid', 'onsite'])),
  location: z.string().trim().max(120).optional().or(z.literal('')),
  technologies: z.array(z.string().trim().min(1)).max(50),
  interests: z.array(z.string().trim().min(1)).max(50),
  experience: z.string().trim().max(2000).optional().or(z.literal('')),
  education: z.string().trim().max(2000).optional().or(z.literal('')),
  githubUrl: z.string().trim().max(300).optional().or(z.literal('')),
  linkedinUrl: z.string().trim().max(300).optional().or(z.literal('')),
  portfolioUrl: z.string().trim().max(300).optional().or(z.literal('')),
});

export type ProfileFormState = {
  error?: string;
  success?: boolean;
};

export async function updateProfile(input: z.infer<typeof ProfileSchema>): Promise<ProfileFormState> {
  const parsed = ProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Não autenticado.' };

  const data = parsed.data;

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.fullName,
      professional_area: data.professionalArea || null,
      level: (data.level || null) as never,
      employment_types: data.employmentTypes,
      modality: data.modality,
      location: data.location || null,
      technologies: data.technologies,
      interests: data.interests,
      experience: data.experience || null,
      education: data.education || null,
      github_url: data.githubUrl || null,
      linkedin_url: data.linkedinUrl || null,
      portfolio_url: data.portfolioUrl || null,
    })
    .eq('id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/profile');
  revalidatePath('/dashboard');
  revalidatePath('/jobs');
  return { success: true };
}
