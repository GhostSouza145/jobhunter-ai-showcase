import type { EmploymentType, Level, RemoteModality } from '@/types/database';

export const MODALITY_LABELS: Record<RemoteModality, string> = {
  remote: 'Remoto',
  hybrid: 'Híbrido',
  onsite: 'Presencial',
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  estagio: 'Estágio',
  clt: 'CLT',
  pj: 'PJ',
  temporario: 'Temporário',
  trainee: 'Trainee',
};

export const LEVEL_LABELS: Record<Level, string> = {
  estagio: 'Estágio',
  trainee: 'Trainee',
  junior: 'Júnior',
  pleno: 'Pleno',
  senior: 'Sênior',
};

export const MODALITY_OPTIONS = Object.entries(MODALITY_LABELS) as [RemoteModality, string][];
export const EMPLOYMENT_TYPE_OPTIONS = Object.entries(EMPLOYMENT_TYPE_LABELS) as [
  EmploymentType,
  string,
][];
export const LEVEL_OPTIONS = Object.entries(LEVEL_LABELS) as [Level, string][];

/** Tenta mapear um texto livre (vindo de uma fonte externa) para nosso enum interno. */
export function guessEmploymentType(raw: string | null | undefined): EmploymentType | null {
  if (!raw) return null;
  const value = raw.toLowerCase();
  if (value.includes('intern') || value.includes('estágio') || value.includes('estagio')) return 'estagio';
  if (value.includes('contract') || value.includes('freelance') || value.includes('pj')) return 'pj';
  if (value.includes('temporary') || value.includes('temporário') || value.includes('temporario')) return 'temporario';
  if (value.includes('trainee')) return 'trainee';
  if (value.includes('full_time') || value.includes('full-time') || value.includes('clt') || value.includes('permanent'))
    return 'clt';
  return null;
}

export function guessRemoteModality(raw: string | null | undefined): RemoteModality | null {
  if (!raw) return null;
  const value = raw.toLowerCase();
  if (value.includes('remot')) return 'remote';
  if (value.includes('híbrid') || value.includes('hibrid') || value.includes('hybrid')) return 'hybrid';
  if (value.includes('presencial') || value.includes('on-site') || value.includes('onsite') || value.includes('on site'))
    return 'onsite';
  return null;
}
