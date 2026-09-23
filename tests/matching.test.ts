import { describe, expect, it } from 'vitest';
import { calculateMatch } from '@/lib/matching/calculate-match';
import type { CandidateProfile } from '@/types/candidate';
import type { NormalizedJob } from '@/types/job';

function baseCandidate(overrides: Partial<CandidateProfile> = {}): CandidateProfile {
  return {
    professionalArea: 'Desenvolvimento',
    level: null,
    employmentTypes: [],
    modality: [],
    location: null,
    technologies: [],
    interests: [],
    experience: null,
    education: null,
    ...overrides,
  };
}

function baseJob(overrides: Partial<NormalizedJob> = {}): NormalizedJob {
  return {
    source: 'demo',
    sourceJobId: '1',
    title: 'Dev',
    company: 'Acme',
    description: '',
    location: null,
    remote: null,
    employmentType: null,
    level: null,
    salary: null,
    url: 'https://example.com/1',
    publishedAt: null,
    requirements: [],
    technologies: [],
    isDemo: true,
    ...overrides,
  };
}

describe('calculateMatch', () => {
  it('matches the example from the product spec: 5/6 required techs -> 83%', () => {
    const candidate = baseCandidate({ technologies: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'] });
    const job = baseJob({
      technologies: ['React', 'JavaScript', 'HTML', 'CSS', 'TypeScript', 'Git'],
    });

    const result = calculateMatch(candidate, job);

    expect(result.score).toBe(83);
    expect(result.matchedSkills).toEqual(expect.arrayContaining(['React', 'JavaScript', 'HTML', 'CSS', 'Git']));
    expect(result.missingSkills).toEqual(['TypeScript']);
  });

  it('returns 100% when the candidate has every required technology', () => {
    const candidate = baseCandidate({ technologies: ['Python', 'Django'] });
    const job = baseJob({ technologies: ['Python', 'Django'] });

    const result = calculateMatch(candidate, job);

    expect(result.score).toBe(100);
    expect(result.missingSkills).toHaveLength(0);
  });

  it('returns 0% when the candidate has none of the required technologies', () => {
    const candidate = baseCandidate({ technologies: ['Ruby'] });
    const job = baseJob({ technologies: ['Python', 'Django'] });

    const result = calculateMatch(candidate, job);

    expect(result.score).toBe(0);
  });

  it('does not penalize dimensions with no data on either side', () => {
    const candidate = baseCandidate({ technologies: ['React'] });
    const job = baseJob({ technologies: ['React'] });

    const result = calculateMatch(candidate, job);

    expect(result.score).toBe(100);
    expect(result.locationMatch).toBe(true);
    expect(result.remoteMatch).toBe(true);
  });

  it('classifies technologies mentioned as "diferencial" with lower weight than required ones', () => {
    const candidateWithDifferential = baseCandidate({ technologies: ['React', 'Docker'] });
    const candidateWithoutDifferential = baseCandidate({ technologies: ['React'] });
    const job = baseJob({
      technologies: ['React'],
      requirements: ['Docker é um diferencial'],
    });

    const withDiff = calculateMatch(candidateWithDifferential, job);
    const withoutDiff = calculateMatch(candidateWithoutDifferential, job);

    expect(withDiff.score).toBeGreaterThan(withoutDiff.score);
    expect(withDiff.score).toBeLessThanOrEqual(100);
  });

  it('flags a location mismatch when both candidate and on-site job specify different locations', () => {
    const candidate = baseCandidate({ technologies: ['React'], location: 'São Paulo' });
    const job = baseJob({ technologies: ['React'], remote: 'onsite', location: 'Curitiba' });

    const result = calculateMatch(candidate, job);

    expect(result.locationMatch).toBe(false);
  });

  it('treats remote jobs as location-agnostic', () => {
    const candidate = baseCandidate({ technologies: ['React'], location: 'São Paulo' });
    const job = baseJob({ technologies: ['React'], remote: 'remote', location: 'Anywhere' });

    const result = calculateMatch(candidate, job);

    expect(result.locationMatch).toBe(true);
  });

  it('returns a score of 0 and a helpful explanation when the job has no identifiable technologies', () => {
    const candidate = baseCandidate({ technologies: ['React'] });
    const job = baseJob({ technologies: [] });

    const result = calculateMatch(candidate, job);

    expect(result.score).toBe(0);
    expect(result.explanation).toContain('não especifica');
  });

  it('never reports a high score from location/modality/employment alone when the job has no technologies', () => {
    // Regression test: a translation/support job with no tech requirements
    // but matching remote modality + employment type must not show 100%.
    const candidate = baseCandidate({
      technologies: ['React', 'TypeScript'],
      modality: ['remote'],
      employmentTypes: ['pj'],
    });
    const job = baseJob({
      technologies: [],
      requirements: [],
      remote: 'remote',
      employmentType: 'pj',
    });

    const result = calculateMatch(candidate, job);

    expect(result.score).toBe(0);
  });
});
