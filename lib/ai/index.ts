import type { AIProvider } from './provider';
import { AnthropicProvider } from './anthropic-provider';

export type { AIProvider } from './provider';

const anthropicProvider = new AnthropicProvider();

/** Retorna o provedor de IA configurado, ou null se nenhum estiver disponível. */
export function getAIProvider(): AIProvider | null {
  if (anthropicProvider.isConfigured()) return anthropicProvider;
  return null;
}

export function isAIEnabled(): boolean {
  return getAIProvider() !== null;
}
