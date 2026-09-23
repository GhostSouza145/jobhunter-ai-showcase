import { describe, expect, it } from 'vitest';
import { dedupeJobs } from '@/lib/jobs/dedupe';
import type { NormalizedJob } from '@/types/job';

function job(overrides: Partial<NormalizedJob>): NormalizedJob {
  return {
    source: 'demo',
    sourceJobId: '1',
    title: 'Desenvolvedor Front-end',
    company: 'Acme',
    description: '',
    location: 'São Paulo',
    remote: null,
    employmentType: null,
    level: null,
    salary: null,
    url: 'https://example.com/vaga/1',
    publishedAt: null,
    requirements: [],
    technologies: [],
    isDemo: false,
    ...overrides,
  };
}

describe('dedupeJobs', () => {
  it('removes exact duplicates from the same source', () => {
    const jobs = [job({ source: 'remotive', sourceJobId: '1' }), job({ source: 'remotive', sourceJobId: '1' })];
    expect(dedupeJobs(jobs)).toHaveLength(1);
  });

  it('removes duplicates across different sources with the same title/company/location', () => {
    const jobs = [
      job({ source: 'remotive', sourceJobId: '1', url: 'https://remotive.com/a' }),
      job({ source: 'arbeitnow', sourceJobId: 'abc', url: 'https://arbeitnow.com/b' }),
    ];
    expect(dedupeJobs(jobs)).toHaveLength(1);
  });

  it('keeps jobs that are genuinely different', () => {
    const jobs = [
      job({ source: 'remotive', sourceJobId: '1', title: 'Front-end' }),
      job({ source: 'remotive', sourceJobId: '2', title: 'Back-end' }),
    ];
    expect(dedupeJobs(jobs)).toHaveLength(2);
  });

  it('keeps the more complete version when two duplicates differ in content', () => {
    const sparse = job({
      source: 'remotive',
      sourceJobId: '1',
      description: 'short',
      technologies: [],
      requirements: [],
    });
    const complete = job({
      source: 'arbeitnow',
      sourceJobId: '2',
      description: 'a much longer and more detailed description of the role',
      technologies: ['React', 'TypeScript'],
      requirements: ['React', 'TypeScript'],
    });

    const result = dedupeJobs([sparse, complete]);

    expect(result).toHaveLength(1);
    expect(result[0]?.technologies).toContain('React');
  });
});
