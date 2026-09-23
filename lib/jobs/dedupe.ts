import type { NormalizedJob } from '@/types/job';
import { normalizeToken } from '@/lib/shared/skills-catalog';

/**
 * Gera uma chave de deduplicação estável para uma vaga, combinando URL
 * normalizada (quando disponível) com título + empresa + localização.
 * Duas vagas de fontes diferentes que descrevem a mesma oportunidade
 * tendem a colidir nessa chave mesmo com URLs distintas.
 */
export function computeDedupeHash(job: Pick<NormalizedJob, 'title' | 'company' | 'location' | 'url'>): string {
  const normalizedUrl = normalizeUrl(job.url);
  const fuzzyKey = [normalizeToken(job.title), normalizeToken(job.company), normalizeToken(job.location ?? '')]
    .filter(Boolean)
    .join('|');

  return normalizedUrl ? `${normalizedUrl}::${fuzzyKey}` : fuzzyKey;
}

function normalizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`.replace(/\/$/, '').toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Remove vagas duplicadas de uma lista agregada de múltiplas fontes.
 * O critério de igualdade considera: mesma fonte + sourceJobId, mesma URL
 * normalizada, ou combinação de título + empresa + localização.
 * Quando há duplicidade, mantém a vaga com descrição/requisitos mais
 * completos.
 */
export function dedupeJobs(jobs: NormalizedJob[]): NormalizedJob[] {
  const bestByFuzzyKey = new Map<string, NormalizedJob>();
  const bestBySourceId = new Map<string, NormalizedJob>();

  for (const job of jobs) {
    const sourceKey = `${job.source}::${job.sourceJobId}`;
    if (bestBySourceId.has(sourceKey)) continue;

    const fuzzyKey = [normalizeToken(job.title), normalizeToken(job.company), normalizeToken(job.location ?? '')]
      .filter(Boolean)
      .join('|');

    const existing = bestByFuzzyKey.get(fuzzyKey);
    const winner = existing ? pickMoreComplete(existing, job) : job;

    bestByFuzzyKey.set(fuzzyKey, winner);
    bestBySourceId.set(`${winner.source}::${winner.sourceJobId}`, winner);
  }

  return Array.from(bestByFuzzyKey.values());
}

function pickMoreComplete(a: NormalizedJob, b: NormalizedJob): NormalizedJob {
  const scoreOf = (job: NormalizedJob) =>
    job.description.length + job.requirements.length * 20 + job.technologies.length * 10;
  return scoreOf(b) > scoreOf(a) ? b : a;
}
