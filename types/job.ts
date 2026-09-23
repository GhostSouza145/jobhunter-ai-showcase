import type { EmploymentType, Level, RemoteModality } from './database';

/**
 * Estrutura unificada de vaga, independente da fonte de origem.
 * Toda fonte (lib/jobs/sources/*) deve produzir objetos nesse formato
 * através de normalizeJob().
 */
export interface NormalizedJob {
  source: string;
  sourceJobId: string;
  title: string;
  company: string;
  description: string;
  location: string | null;
  remote: RemoteModality | null;
  employmentType: EmploymentType | null;
  level: Level | null;
  salary: string | null;
  url: string;
  publishedAt: string | null;
  requirements: string[];
  technologies: string[];
  isDemo: boolean;
}

/** Vaga já persistida no banco, com id e timestamps. */
export interface Job extends NormalizedJob {
  id: string;
  dedupeHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobFilters {
  area?: string;
  technologies?: string[];
  employmentType?: EmploymentType;
  modality?: RemoteModality;
  location?: string;
  company?: string;
  level?: Level;
  minCompatibility?: number;
  source?: string;
  publishedAfter?: string;
  query?: string;
  page?: number;
  pageSize?: number;
}

/** Payload cru retornado por uma fonte externa, antes da normalização. */
export type RawSourceJob = Record<string, unknown>;

export interface JobSourceSearchParams {
  query?: string;
  technologies?: string[];
  location?: string;
  limit?: number;
}

/**
 * Interface que toda fonte de vagas (lib/jobs/sources/*) deve implementar.
 * Fontes sem acesso público/permitido devem retornar `configured: false` e
 * nunca simular dados como se fossem reais.
 */
export interface JobSource {
  key: string;
  name: string;
  /** Indica se a fonte está pronta para uso (credenciais presentes, API pública etc). */
  isConfigured(): boolean;
  searchJobs(params: JobSourceSearchParams): Promise<RawSourceJob[]>;
  getJob(sourceJobId: string): Promise<RawSourceJob | null>;
  normalizeJob(raw: RawSourceJob): NormalizedJob;
}
