export interface MatchResult {
  /** Percentual de 0 a 100. Representa compatibilidade com os requisitos, não chance de contratação. */
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceMatch: boolean;
  educationMatch: boolean;
  locationMatch: boolean;
  remoteMatch: boolean;
  employmentTypeMatch: boolean;
  explanation: string;
}

export type CompatibilityTier = 'high' | 'good' | 'low';

export function compatibilityTier(score: number): CompatibilityTier {
  if (score >= 85) return 'high';
  if (score >= 70) return 'good';
  return 'low';
}
