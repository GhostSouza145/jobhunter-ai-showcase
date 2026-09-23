import type { JobSource, JobSourceSearchParams, NormalizedJob, RawSourceJob } from './source-interface';
import { guessEmploymentType, guessRemoteModality } from '@/lib/shared/labels';
import { findSkillsInText } from '@/lib/shared/skills-catalog';

/**
 * Arbeitnow (https://www.arbeitnow.com/api/job-board-api) é uma API pública,
 * gratuita e documentada para consumo automatizado do board de vagas —
 * não requer autenticação. Documentação:
 * https://documenter.getpostman.com/view/12683521/TzXvAzao
 */
const ARBEITNOW_API_URL = 'https://www.arbeitnow.com/api/job-board-api';

interface ArbeitnowJob {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags: string[];
  job_types: string[];
  location: string;
  created_at: number;
}

export const arbeitnowSource: JobSource = {
  key: 'arbeitnow',
  name: 'Arbeitnow (API pública)',

  isConfigured() {
    return true;
  },

  async searchJobs(params: JobSourceSearchParams): Promise<RawSourceJob[]> {
    const response = await fetch(ARBEITNOW_API_URL, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      throw new Error(`Arbeitnow respondeu com status ${response.status}`);
    }

    const data = (await response.json()) as { data: ArbeitnowJob[] };
    let jobs = data.data;

    if (params.query) {
      const query = params.query.toLowerCase();
      jobs = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query) ||
          job.tags?.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    if (params.limit) jobs = jobs.slice(0, params.limit);

    return jobs as unknown as RawSourceJob[];
  },

  async getJob(sourceJobId: string): Promise<RawSourceJob | null> {
    const jobs = await this.searchJobs({});
    return jobs.find((raw) => (raw as unknown as ArbeitnowJob).slug === sourceJobId) ?? null;
  },

  normalizeJob(raw: RawSourceJob): NormalizedJob {
    const job = raw as unknown as ArbeitnowJob;
    const description = stripHtml(job.description ?? '');
    const technologies = Array.from(
      new Set([
        ...findSkillsInText([job.title, ...(job.tags ?? [])].join(' ')).map((s) => s.name),
        ...findSkillsInText(description)
          .map((s) => s.name)
          .slice(0, 8),
      ]),
    );

    return {
      source: 'arbeitnow',
      sourceJobId: job.slug,
      title: job.title,
      company: job.company_name,
      description,
      location: job.location || null,
      remote: job.remote ? 'remote' : guessRemoteModality(job.location),
      employmentType: guessEmploymentType(job.job_types?.[0]),
      level: null,
      salary: null,
      url: job.url,
      publishedAt: job.created_at ? new Date(job.created_at * 1000).toISOString() : null,
      requirements: extractRequirementLines(description),
      technologies,
      isDemo: false,
    };
  },
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractRequirementLines(description: string): string[] {
  return description
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line.length < 240)
    .slice(0, 30);
}
