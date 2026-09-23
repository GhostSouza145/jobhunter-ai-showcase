import type { EmploymentType, Level, RemoteModality } from '@/types/database';
import type { JobFilters } from '@/types/job';

/** Lê os filtros de busca de vagas a partir de query params (URLSearchParams). */
export function parseJobFiltersFromSearchParams(params: URLSearchParams): JobFilters {
  return {
    query: params.get('query') || undefined,
    area: params.get('area') || undefined,
    technologies: params.get('technologies')?.split(',').filter(Boolean),
    employmentType: (params.get('employmentType') as EmploymentType) || undefined,
    modality: (params.get('modality') as RemoteModality) || undefined,
    location: params.get('location') || undefined,
    company: params.get('company') || undefined,
    level: (params.get('level') as Level) || undefined,
    source: params.get('source') || undefined,
    publishedAfter: params.get('publishedAfter') || undefined,
    minCompatibility: params.get('minCompatibility') ? Number(params.get('minCompatibility')) : undefined,
    page: params.get('page') ? Number(params.get('page')) : 1,
    pageSize: params.get('pageSize') ? Number(params.get('pageSize')) : 20,
  };
}
