import { describe, expect, it } from 'vitest';
import { demoSource } from '@/lib/jobs/sources/demo-source';
import { arbeitnowSource } from '@/lib/jobs/sources/arbeitnow';
import { remotiveSource } from '@/lib/jobs/sources/remotive';

describe('normalizeJob', () => {
  it('produces the unified NormalizedJob shape for the demo source', async () => {
    const raw = await demoSource.getJob('demo-1');
    expect(raw).not.toBeNull();
    const job = demoSource.normalizeJob(raw!);

    expect(job.source).toBe('demo');
    expect(job.isDemo).toBe(true);
    expect(typeof job.title).toBe('string');
    expect(typeof job.company).toBe('string');
    expect(Array.isArray(job.technologies)).toBe(true);
    expect(Array.isArray(job.requirements)).toBe(true);
  });

  it('normalizes an Arbeitnow-shaped payload into the unified structure', () => {
    const job = arbeitnowSource.normalizeJob({
      slug: 'vaga-exemplo',
      company_name: 'Example Co',
      title: 'Backend Engineer',
      description: '<p>We need someone with Python and Django experience.</p>',
      remote: true,
      url: 'https://arbeitnow.com/view/vaga-exemplo',
      tags: ['python', 'django'],
      job_types: ['full_time'],
      location: 'Berlin',
      created_at: 1700000000,
    });

    expect(job.source).toBe('arbeitnow');
    expect(job.sourceJobId).toBe('vaga-exemplo');
    expect(job.remote).toBe('remote');
    expect(job.isDemo).toBe(false);
    expect(job.technologies).toEqual(expect.arrayContaining(['Python', 'Django']));
    expect(job.description).not.toContain('<p>');
  });

  it('normalizes a Remotive-shaped payload into the unified structure', () => {
    const job = remotiveSource.normalizeJob({
      id: 123,
      url: 'https://remotive.com/remote-jobs/123',
      title: 'Frontend Developer',
      company_name: 'Remote Inc',
      category: 'software-dev',
      tags: ['react', 'typescript'],
      job_type: 'full_time',
      publication_date: '2024-05-01T00:00:00.000Z',
      candidate_required_location: 'Worldwide',
      salary: '',
      description: '<p>React and TypeScript required.</p>',
    });

    expect(job.source).toBe('remotive');
    expect(job.sourceJobId).toBe('123');
    expect(job.remote).toBe('remote');
    expect(job.technologies).toEqual(expect.arrayContaining(['React', 'TypeScript']));
  });

  it('keeps every source producing the same set of fields', () => {
    const requiredKeys = [
      'source',
      'sourceJobId',
      'title',
      'company',
      'description',
      'location',
      'remote',
      'employmentType',
      'level',
      'salary',
      'url',
      'publishedAt',
      'requirements',
      'technologies',
      'isDemo',
    ];

    const arbeitnowJob = arbeitnowSource.normalizeJob({
      slug: 'x',
      company_name: 'Co',
      title: 'Role',
      description: 'desc',
      remote: false,
      url: 'https://arbeitnow.com/view/x',
      tags: [],
      job_types: [],
      location: 'Remote',
      created_at: 1700000000,
    });

    for (const key of requiredKeys) {
      expect(arbeitnowJob).toHaveProperty(key);
    }
  });
});
