import { describe, expect, it } from 'vitest';
import { filterJobs, matchesFilters, paginate } from '@/lib/jobs/filters';
import type { Job } from '@/types/job';

function job(overrides: Partial<Job>): Job {
  return {
    id: overrides.id ?? '1',
    source: 'demo',
    sourceJobId: '1',
    title: 'Desenvolvedor React Jr.',
    company: 'Acme',
    description: 'Vaga para desenvolvedor front-end com React',
    location: 'São Paulo, SP',
    remote: 'hybrid',
    employmentType: 'clt',
    level: 'junior',
    salary: null,
    url: 'https://example.com/1',
    publishedAt: '2024-01-01T00:00:00.000Z',
    requirements: [],
    technologies: ['React', 'JavaScript'],
    isDemo: true,
    dedupeHash: 'hash-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('matchesFilters', () => {
  it('filters by technology', () => {
    const j = job({});
    expect(matchesFilters(j, { technologies: ['React'] })).toBe(true);
    expect(matchesFilters(j, { technologies: ['Python'] })).toBe(false);
  });

  it('filters by modality', () => {
    const j = job({ remote: 'remote' });
    expect(matchesFilters(j, { modality: 'remote' })).toBe(true);
    expect(matchesFilters(j, { modality: 'onsite' })).toBe(false);
  });

  it('filters by employment type', () => {
    const j = job({ employmentType: 'pj' });
    expect(matchesFilters(j, { employmentType: 'pj' })).toBe(true);
    expect(matchesFilters(j, { employmentType: 'clt' })).toBe(false);
  });

  it('filters by free text query across title, company and description', () => {
    const j = job({ title: 'Engenheiro de Dados' });
    expect(matchesFilters(j, { query: 'dados' })).toBe(true);
    expect(matchesFilters(j, { query: 'inexistente' })).toBe(false);
  });

  it('filters by location', () => {
    const j = job({ location: 'Rio de Janeiro, RJ' });
    expect(matchesFilters(j, { location: 'Rio de Janeiro' })).toBe(true);
    expect(matchesFilters(j, { location: 'Curitiba' })).toBe(false);
  });

  it('returns true when no filters are provided', () => {
    expect(matchesFilters(job({}), {})).toBe(true);
  });
});

describe('filterJobs', () => {
  it('returns only jobs matching every provided filter', () => {
    const jobs = [
      job({ id: '1', technologies: ['React'], remote: 'remote' }),
      job({ id: '2', technologies: ['React'], remote: 'onsite' }),
      job({ id: '3', technologies: ['Python'], remote: 'remote' }),
    ];

    const result = filterJobs(jobs, { technologies: ['React'], modality: 'remote' });

    expect(result.map((j) => j.id)).toEqual(['1']);
  });
});

describe('paginate', () => {
  it('slices items according to page and pageSize', () => {
    const items = Array.from({ length: 45 }, (_, i) => i);
    const page1 = paginate(items, 1, 20);
    const page3 = paginate(items, 3, 20);

    expect(page1.items).toHaveLength(20);
    expect(page1.totalPages).toBe(3);
    expect(page3.items).toHaveLength(5);
  });

  it('clamps invalid page numbers', () => {
    const items = [1, 2, 3];
    const result = paginate(items, 0, 20);
    expect(result.page).toBe(1);
  });
});
