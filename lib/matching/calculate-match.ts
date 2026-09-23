import type { CandidateProfile } from '@/types/candidate';
import type { NormalizedJob } from '@/types/job';
import type { MatchResult } from '@/types/match';
import { findSkillsInText, normalizeToken, resolveSkill } from '@/lib/shared/skills-catalog';
import { MATCH_WEIGHTS } from './weights';

const DESIRED_MARKERS = ['desejável', 'desejavel', 'nice to have', 'plus', 'bônus', 'bonus'];
const DIFFERENTIAL_MARKERS = ['diferencial', 'diferenciais'];

interface TechTiers {
  required: string[];
  desired: string[];
  differential: string[];
}

/** Classifica as tecnologias da vaga em obrigatórias/desejáveis/diferenciais. */
function classifyJobTechnologies(job: NormalizedJob): TechTiers {
  const required = dedupeCanonical(job.technologies);
  const requiredSet = new Set(required.map(normalizeToken));

  const desired = new Set<string>();
  const differential = new Set<string>();

  for (const line of job.requirements) {
    const lower = line.toLowerCase();
    const isDifferential = DIFFERENTIAL_MARKERS.some((marker) => lower.includes(marker));
    const isDesired = DESIRED_MARKERS.some((marker) => lower.includes(marker));

    const skillsInLine = findSkillsInText(line).map((s) => s.name);
    for (const skillName of skillsInLine) {
      if (requiredSet.has(normalizeToken(skillName))) continue;
      if (isDifferential) {
        differential.add(skillName);
      } else if (isDesired) {
        desired.add(skillName);
      } else {
        desired.add(skillName);
      }
    }
  }

  return {
    required,
    desired: Array.from(desired),
    differential: Array.from(differential),
  };
}

function dedupeCanonical(names: string[]): string[] {
  const seen = new Map<string, string>();
  for (const name of names) {
    const canonical = resolveSkill(name)?.name ?? name.trim();
    if (canonical) seen.set(normalizeToken(canonical), canonical);
  }
  return Array.from(seen.values());
}

function candidateHasSkill(candidateTokens: Set<string>, skillName: string): boolean {
  const canonical = resolveSkill(skillName);
  if (canonical) {
    if (candidateTokens.has(normalizeToken(canonical.name))) return true;
    for (const alias of canonical.aliases ?? []) {
      if (candidateTokens.has(normalizeToken(alias))) return true;
    }
    return false;
  }
  return candidateTokens.has(normalizeToken(skillName));
}

function computeLocationMatch(candidate: CandidateProfile, job: NormalizedJob): boolean | null {
  if (job.remote === 'remote') return null;
  if (!candidate.location || !job.location) return null;
  const candidateLoc = normalizeToken(candidate.location);
  const jobLoc = normalizeToken(job.location);
  return candidateLoc.length > 0 && (jobLoc.includes(candidateLoc) || candidateLoc.includes(jobLoc));
}

function computeRemoteMatch(candidate: CandidateProfile, job: NormalizedJob): boolean | null {
  if (candidate.modality.length === 0 || !job.remote) return null;
  return candidate.modality.includes(job.remote);
}

function computeEmploymentTypeMatch(candidate: CandidateProfile, job: NormalizedJob): boolean | null {
  if (candidate.employmentTypes.length === 0 || !job.employmentType) return null;
  return candidate.employmentTypes.includes(job.employmentType);
}

function computeLevelMatch(candidate: CandidateProfile, job: NormalizedJob): boolean | null {
  if (!candidate.level || !job.level) return null;
  return candidate.level === job.level;
}

function computeEducationMatch(candidate: CandidateProfile, job: NormalizedJob): boolean | null {
  const mentionsEducation = job.requirements.some((line) =>
    /(gradua|bacharel|superior completo|superior cursando|t[ée]cnico|p[óo]s-gradua)/i.test(line),
  );
  if (!mentionsEducation) return null;
  return Boolean(candidate.education && candidate.education.trim().length > 0);
}

function computeExperienceMatch(candidate: CandidateProfile, job: NormalizedJob): boolean | null {
  if (!job.level) return null;
  if (!candidate.level) return null;
  const order = ['estagio', 'trainee', 'junior', 'pleno', 'senior'];
  const candidateRank = order.indexOf(candidate.level);
  const jobRank = order.indexOf(job.level);
  if (candidateRank === -1 || jobRank === -1) return null;
  return candidateRank >= jobRank;
}

/**
 * Calcula a compatibilidade entre o perfil do candidato e uma vaga.
 * O score representa aderência aos requisitos identificados, não uma
 * previsão de chance de contratação.
 */
export function calculateMatch(candidate: CandidateProfile, job: NormalizedJob): MatchResult {
  const { required, desired, differential } = classifyJobTechnologies(job);
  const candidateTokens = new Set(
    [...candidate.technologies, ...candidate.interests].map(normalizeToken),
  );

  const matchedRequired = required.filter((skill) => candidateHasSkill(candidateTokens, skill));
  const missingRequired = required.filter((skill) => !candidateHasSkill(candidateTokens, skill));
  const matchedDesired = desired.filter((skill) => candidateHasSkill(candidateTokens, skill));
  const missingDesired = desired.filter((skill) => !candidateHasSkill(candidateTokens, skill));
  const matchedDifferential = differential.filter((skill) => candidateHasSkill(candidateTokens, skill));
  const missingDifferential = differential.filter((skill) => !candidateHasSkill(candidateTokens, skill));

  let possible = 0;
  let earned = 0;

  possible += required.length * MATCH_WEIGHTS.requiredTechnology;
  earned += matchedRequired.length * MATCH_WEIGHTS.requiredTechnology;

  possible += desired.length * MATCH_WEIGHTS.desiredTechnology;
  earned += matchedDesired.length * MATCH_WEIGHTS.desiredTechnology;

  possible += differential.length * MATCH_WEIGHTS.differentialTechnology;
  earned += matchedDifferential.length * MATCH_WEIGHTS.differentialTechnology;

  const locationMatch = computeLocationMatch(candidate, job);
  const remoteMatch = computeRemoteMatch(candidate, job);
  const employmentTypeMatch = computeEmploymentTypeMatch(candidate, job);
  const levelMatch = computeLevelMatch(candidate, job);
  const educationMatch = computeEducationMatch(candidate, job);
  const experienceMatch = computeExperienceMatch(candidate, job);

  const bonusDimensions: Array<[boolean | null, number]> = [
    [locationMatch, MATCH_WEIGHTS.location],
    [remoteMatch, MATCH_WEIGHTS.remoteModality],
    [employmentTypeMatch, MATCH_WEIGHTS.employmentType],
    [levelMatch, MATCH_WEIGHTS.level],
    [educationMatch, MATCH_WEIGHTS.education],
  ];

  for (const [applicable, weight] of bonusDimensions) {
    if (applicable === null) continue;
    possible += weight;
    if (applicable) earned += weight;
  }

  const score = possible === 0 ? 0 : Math.round((earned / possible) * 100);

  const matchedSkills = [...matchedRequired, ...matchedDesired, ...matchedDifferential];
  const missingSkills = [...missingRequired, ...missingDesired, ...missingDifferential];

  const explanation = buildExplanation({
    score,
    required,
    matchedRequired,
    missingRequired,
    locationMatch,
    remoteMatch,
    levelMatch,
  });

  return {
    score: clamp(score, 0, 100),
    matchedSkills,
    missingSkills,
    experienceMatch: experienceMatch ?? true,
    educationMatch: educationMatch ?? true,
    locationMatch: locationMatch ?? true,
    remoteMatch: remoteMatch ?? true,
    employmentTypeMatch: employmentTypeMatch ?? true,
    explanation,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function buildExplanation(params: {
  score: number;
  required: string[];
  matchedRequired: string[];
  missingRequired: string[];
  locationMatch: boolean | null;
  remoteMatch: boolean | null;
  levelMatch: boolean | null;
}): string {
  const { required, matchedRequired, missingRequired } = params;

  if (required.length === 0) {
    return 'Esta vaga não especifica tecnologias claras para comparar com seu currículo. Confira a descrição completa para mais detalhes.';
  }

  const parts: string[] = [
    `Você possui ${matchedRequired.length} de ${required.length} requisitos técnicos identificados nesta vaga.`,
  ];

  if (missingRequired.length > 0) {
    parts.push(`Ainda não identificamos ${missingRequired.join(', ')} no seu currículo.`);
  }

  if (params.remoteMatch === false) {
    parts.push('A modalidade de trabalho é diferente da sua preferência atual.');
  }
  if (params.locationMatch === false) {
    parts.push('A localização da vaga é diferente da sua localização informada.');
  }
  if (params.levelMatch === false) {
    parts.push('O nível de experiência da vaga difere do seu nível informado no perfil.');
  }

  return parts.join(' ');
}
