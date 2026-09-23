import type { Job, JobFilters } from '@/types/job';
import { normalizeToken } from '@/lib/shared/skills-catalog';

/** Aplica os filtros de busca a uma lista de vagas já carregada em memória. */
export function matchesFilters(job: Job, filters: JobFilters): boolean {
  if (filters.query) {
    const query = normalizeToken(filters.query);
    const haystack = normalizeToken(`${job.title} ${job.company} ${job.description}`);
    if (!haystack.includes(query)) return false;
  }

  if (filters.area) {
    const area = normalizeToken(filters.area);
    if (!normalizeToken(job.title).includes(area) && !normalizeToken(job.description).includes(area)) {
      return false;
    }
  }

  if (filters.technologies && filters.technologies.length > 0) {
    const jobTechTokens = new Set(job.technologies.map(normalizeToken));
    const hasAny = filters.technologies.some((tech) => jobTechTokens.has(normalizeToken(tech)));
    if (!hasAny) return false;
  }

  if (filters.employmentType && job.employmentType !== filters.employmentType) {
    return false;
  }

  if (filters.modality && job.remote !== filters.modality) {
    return false;
  }

  if (filters.location) {
    const location = normalizeToken(filters.location);
    if (!job.location || !normalizeToken(job.location).includes(location)) return false;
  }

  if (filters.company) {
    const company = normalizeToken(filters.company);
    if (!normalizeToken(job.company).includes(company)) return false;
  }

  if (filters.level && job.level !== filters.level) {
    return false;
  }

  if (filters.source && job.source !== filters.source) {
    return false;
  }

  if (filters.publishedAfter && job.publishedAt) {
    if (new Date(job.publishedAt).getTime() < new Date(filters.publishedAfter).getTime()) return false;
  }

  return true;
}

export function filterJobs(jobs: Job[], filters: JobFilters): Job[] {
  return jobs.filter((job) => matchesFilters(job, filters));
}

export function paginate<T>(items: T[], page = 1, pageSize = 20): { items: T[]; total: number; page: number; pageSize: number; totalPages: number } {
  const safePage = Math.max(1, page);
  const safePageSize = Math.min(100, Math.max(1, pageSize));
  const start = (safePage - 1) * safePageSize;
  const items_ = items.slice(start, start + safePageSize);
  return {
    items: items_,
    total: items.length,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.max(1, Math.ceil(items.length / safePageSize)),
  };
}
