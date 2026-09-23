/**
 * Pesos usados pelo algoritmo de compatibilidade (lib/matching/calculate-match.ts).
 * Requisitos técnicos obrigatórios pesam mais que desejáveis, que pesam mais
 * que diferenciais. Localização, modalidade, formação e nível têm peso médio;
 * tipo de contratação tem peso baixo por ser um filtro geralmente já aplicado
 * antes da busca chegar ao usuário.
 */
export const MATCH_WEIGHTS = {
  requiredTechnology: 10,
  desiredTechnology: 5,
  differentialTechnology: 2,
  location: 8,
  remoteModality: 8,
  education: 7,
  level: 7,
  employmentType: 4,
} as const;
