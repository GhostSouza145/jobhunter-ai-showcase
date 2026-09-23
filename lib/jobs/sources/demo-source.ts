import type { JobSource, JobSourceSearchParams, NormalizedJob, RawSourceJob } from './source-interface';
import { guessEmploymentType, guessRemoteModality } from '@/lib/shared/labels';

/**
 * Fonte de demonstração. Sempre ativa, mesmo sem nenhuma credencial
 * configurada, para permitir testar o fluxo completo do produto. Todas as
 * vagas são fictícias e marcadas com isDemo: true — nunca apresentadas como
 * vagas reais na interface.
 */
const DEMO_JOBS: RawSourceJob[] = [
  {
    id: 'demo-1',
    title: 'Desenvolvedor(a) Front-end React Jr.',
    company: 'Nimbus Tech (DEMO)',
    description:
      'Vaga fictícia de demonstração. Buscamos pessoa desenvolvedora front-end para atuar com React e TypeScript em um time ágil, construindo interfaces para um SaaS B2B.',
    location: 'São Paulo, SP',
    remote: 'Híbrido',
    employmentType: 'CLT',
    level: 'junior',
    salary: 'R$ 4.500 - R$ 6.000',
    url: 'https://example.com/demo/vagas/1',
    publishedAt: daysAgo(2),
    requirements: [
      'React',
      'JavaScript',
      'HTML',
      'CSS',
      'Git',
      'TypeScript é desejável',
      'Next.js é um diferencial',
    ],
    technologies: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
  },
  {
    id: 'demo-2',
    title: 'Estágio em Desenvolvimento Back-end',
    company: 'Aurora Labs (DEMO)',
    description:
      'Vaga fictícia de demonstração. Estágio para atuar com Node.js e PostgreSQL no time de plataforma, com mentoria de desenvolvedores seniores.',
    location: 'Remoto',
    remote: 'Remoto',
    employmentType: 'Estágio',
    level: 'estagio',
    salary: 'R$ 1.800',
    url: 'https://example.com/demo/vagas/2',
    publishedAt: daysAgo(5),
    requirements: ['Node.js', 'JavaScript', 'Git', 'Cursando Superior', 'SQL é desejável'],
    technologies: ['Node.js', 'JavaScript', 'Git'],
  },
  {
    id: 'demo-3',
    title: 'Engenheiro(a) de Software Pleno (Full-stack)',
    company: 'Cascade Systems (DEMO)',
    description:
      'Vaga fictícia de demonstração. Atuação full-stack com Next.js, TypeScript, PostgreSQL e Supabase em produto de missão crítica.',
    location: 'Remoto',
    remote: 'Remoto',
    employmentType: 'PJ',
    level: 'pleno',
    salary: 'R$ 9.000 - R$ 12.000',
    url: 'https://example.com/demo/vagas/3',
    publishedAt: daysAgo(1),
    requirements: [
      'Next.js',
      'TypeScript',
      'React',
      'PostgreSQL',
      'Supabase',
      'Docker é diferencial',
      'Graduação em andamento ou completa',
    ],
    technologies: ['Next.js', 'TypeScript', 'React', 'PostgreSQL', 'Supabase'],
  },
  {
    id: 'demo-4',
    title: 'Desenvolvedor(a) Python Sênior',
    company: 'Vortex Data (DEMO)',
    description:
      'Vaga fictícia de demonstração. Time de dados busca profissional sênior com Python, Django e AWS para evoluir pipelines de dados.',
    location: 'Belo Horizonte, MG',
    remote: 'Híbrido',
    employmentType: 'CLT',
    level: 'senior',
    salary: 'R$ 14.000 - R$ 18.000',
    url: 'https://example.com/demo/vagas/4',
    publishedAt: daysAgo(7),
    requirements: ['Python', 'Django', 'AWS', 'PostgreSQL', 'Docker', 'Kubernetes é diferencial'],
    technologies: ['Python', 'Django', 'AWS', 'PostgreSQL', 'Docker'],
  },
  {
    id: 'demo-5',
    title: 'Trainee em Desenvolvimento de Software',
    company: 'Lumen Digital (DEMO)',
    description:
      'Vaga fictícia de demonstração. Programa trainee de 12 meses com trilha em desenvolvimento web usando JavaScript, React e Node.js.',
    location: 'Curitiba, PR',
    remote: 'Presencial',
    employmentType: 'Trainee',
    level: 'trainee',
    salary: 'R$ 3.200',
    url: 'https://example.com/demo/vagas/5',
    publishedAt: daysAgo(3),
    requirements: ['JavaScript', 'Git', 'HTML', 'CSS', 'React é desejável'],
    technologies: ['JavaScript', 'Git', 'HTML', 'CSS'],
  },
];

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export const demoSource: JobSource = {
  key: 'demo',
  name: 'Vagas de demonstração',

  isConfigured() {
    return true;
  },

  async searchJobs(params: JobSourceSearchParams): Promise<RawSourceJob[]> {
    const query = params.query?.toLowerCase().trim();
    if (!query) return DEMO_JOBS;

    return DEMO_JOBS.filter((raw) => {
      const job = raw as { title: string; description: string; company: string };
      return (
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query)
      );
    });
  },

  async getJob(sourceJobId: string): Promise<RawSourceJob | null> {
    return DEMO_JOBS.find((raw) => (raw as { id: string }).id === sourceJobId) ?? null;
  },

  normalizeJob(raw: RawSourceJob): NormalizedJob {
    const job = raw as {
      id: string;
      title: string;
      company: string;
      description: string;
      location: string;
      remote: string;
      employmentType: string;
      level: NormalizedJob['level'];
      salary: string;
      url: string;
      publishedAt: string;
      requirements: string[];
      technologies: string[];
    };

    return {
      source: 'demo',
      sourceJobId: job.id,
      title: job.title,
      company: job.company,
      description: job.description,
      location: job.location,
      remote: guessRemoteModality(job.remote),
      employmentType: guessEmploymentType(job.employmentType),
      level: job.level,
      salary: job.salary,
      url: job.url,
      publishedAt: job.publishedAt,
      requirements: job.requirements,
      technologies: job.technologies,
      isDemo: true,
    };
  },
};
