import type { JobSource, JobSourceSearchParams, NormalizedJob, RawSourceJob } from './source-interface';

/**
 * Indeed NÃO possui uma API pública de busca de vagas de uso livre — o
 * acesso programático oficial exige um acordo de parceria (XML Feed /
 * Indeed Apply) com credenciais próprias, e o site não permite scraping por
 * seus Termos de Serviço. Por isso este adaptador fica propositalmente
 * "não configurado": ele implementa a interface JobSource para que a
 * aplicação já esteja pronta para essa fonte, mas nunca inventa dados nem
 * tenta contornar autenticação/CAPTCHA/bloqueios.
 *
 * Para ativar no futuro: obtenha um acordo de parceria com a Indeed,
 * preencha INDEED_PARTNER_FEED_URL e INDEED_PARTNER_API_KEY no .env, e
 * implemente searchJobs/getJob/normalizeJob usando o feed autorizado.
 */
export const indeedSource: JobSource = {
  key: 'indeed',
  name: 'Indeed',

  isConfigured() {
    return Boolean(process.env.INDEED_PARTNER_FEED_URL && process.env.INDEED_PARTNER_API_KEY);
  },

  async searchJobs(_params: JobSourceSearchParams): Promise<RawSourceJob[]> {
    if (!this.isConfigured()) {
      return [];
    }
    // Implementação pendente de acordo de parceria com a Indeed. Nenhum
    // dado é simulado: enquanto não configurada, a fonte retorna vazio.
    return [];
  },

  async getJob(_sourceJobId: string): Promise<RawSourceJob | null> {
    return null;
  },

  normalizeJob(_raw: RawSourceJob): NormalizedJob {
    throw new Error(
      'Fonte Indeed não configurada. Configure INDEED_PARTNER_FEED_URL e INDEED_PARTNER_API_KEY após formalizar um acordo de parceria.',
    );
  },
};
