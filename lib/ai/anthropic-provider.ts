import type { AIProvider } from './provider';
import type { ParsedResumeData } from '@/types/candidate';
import type { MatchResult } from '@/types/match';
import type { NormalizedJob } from '@/types/job';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

const SAFETY_SYSTEM_PROMPT =
  'Você ajuda um candidato a entender vagas e seu currículo. Nunca invente ' +
  'experiências, habilidades, certificações ou formações que não estejam ' +
  'explicitamente presentes no texto fornecido. Seja objetivo e conciso.';

/**
 * Provedor opcional baseado na API da Anthropic. Só é usado quando
 * ANTHROPIC_API_KEY está configurada; caso contrário lib/ai/index.ts nem
 * instancia esta classe.
 */
export class AnthropicProvider implements AIProvider {
  readonly name = 'anthropic';

  isConfigured(): boolean {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  }

  async summarizeResume(parsed: ParsedResumeData, rawText: string): Promise<string | null> {
    return this.complete(
      `Resuma o seguinte currículo em até 3 frases, destacando apenas informações ` +
        `presentes no texto. Dados extraídos: ${JSON.stringify(parsed)}\n\nTexto original:\n${rawText.slice(0, 6000)}`,
    );
  }

  async explainMatch(job: NormalizedJob, match: MatchResult): Promise<string | null> {
    return this.complete(
      `Explique em até 3 frases, de forma amigável, por que esta vaga tem ${match.score}% de ` +
        `compatibilidade com o candidato. Requisitos atendidos: ${match.matchedSkills.join(', ') || 'nenhum'}. ` +
        `Requisitos ausentes: ${match.missingSkills.join(', ') || 'nenhum'}. Vaga: ${job.title} na ${job.company}. ` +
        `Nunca afirme que isso é uma previsão de contratação — fale apenas em termos de compatibilidade com requisitos.`,
    );
  }

  async suggestResumeImprovements(
    parsed: ParsedResumeData,
    job: NormalizedJob,
    match: MatchResult,
  ): Promise<string[] | null> {
    const text = await this.complete(
      `Com base no currículo (dados extraídos: ${JSON.stringify(parsed)}) e nesta vaga ` +
        `(${job.title}, requisitos ausentes: ${match.missingSkills.join(', ') || 'nenhum'}), liste até 3 ` +
        `sugestões objetivas do que o candidato poderia estudar ou destacar. Responda apenas com uma lista, ` +
        `uma sugestão por linha, sem numeração.`,
    );
    if (!text) return null;
    return text
      .split('\n')
      .map((line) => line.replace(/^[-*•\d.]+\s*/, '').trim())
      .filter(Boolean)
      .slice(0, 3);
  }

  private async complete(userMessage: string): Promise<string | null> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return null;

    try {
      const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 400,
          system: SAFETY_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userMessage }],
        }),
      });

      if (!response.ok) {
        // eslint-disable-next-line no-console
        console.error('[ai:anthropic] resposta não-ok', response.status);
        return null;
      }

      const data = (await response.json()) as { content?: { type: string; text?: string }[] };
      const text = data.content?.find((block) => block.type === 'text')?.text;
      return text ?? null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[ai:anthropic] falhou:', error);
      return null;
    }
  }
}
