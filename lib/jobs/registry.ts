import type { JobSource } from '@/types/job';
import { demoSource } from './sources/demo-source';
import { remotiveSource } from './sources/remotive';
import { arbeitnowSource } from './sources/arbeitnow';
import { indeedSource } from './sources/indeed';

/**
 * Registro central de fontes de vagas. Para adicionar uma nova fonte,
 * implemente a interface JobSource em lib/jobs/sources/<nome>.ts e adicione
 * a instância aqui — nenhum outro arquivo da aplicação precisa mudar.
 */
export const JOB_SOURCES: JobSource[] = [demoSource, remotiveSource, arbeitnowSource, indeedSource];

export function getConfiguredSources(): JobSource[] {
  return JOB_SOURCES.filter((source) => source.isConfigured());
}

export function getSourceByKey(key: string): JobSource | undefined {
  return JOB_SOURCES.find((source) => source.key === key);
}
