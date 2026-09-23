import type { ParsedResumeData } from '@/types/candidate';
import type { MatchResult } from '@/types/match';
import type { NormalizedJob } from '@/types/job';

/**
 * Camada opcional de IA. A aplicação inteira funciona sem nenhum provedor
 * configurado — quando não há AIProvider disponível, as funções que o
 * chamam usam apenas o resultado do algoritmo local (lib/matching) e do
 * parser de currículo (lib/resume), sem nenhuma chamada externa.
 */
export interface AIProvider {
  readonly name: string;
  isConfigured(): boolean;
  summarizeResume(parsed: ParsedResumeData, rawText: string): Promise<string | null>;
  explainMatch(job: NormalizedJob, match: MatchResult): Promise<string | null>;
  suggestResumeImprovements(parsed: ParsedResumeData, job: NormalizedJob, match: MatchResult): Promise<string[] | null>;
}
