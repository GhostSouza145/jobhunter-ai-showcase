import type { Metadata } from 'next';
import { Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getSearchPreferences } from '@/lib/data/preferences';
import { getJobSourcesStatus } from '@/lib/data/job-sources';
import { isAIEnabled } from '@/lib/ai';
import { PreferencesForm } from '@/components/settings/preferences-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Configurações — JobHunter AI' };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [preferences, sources] = await Promise.all([
    getSearchPreferences(supabase, user.id),
    getJobSourcesStatus(supabase),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-sm text-muted">Ajuste suas preferências de busca e veja o status das integrações.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Preferências de busca</CardTitle>
          <CardDescription>Usadas para refinar quais vagas buscamos e priorizamos para você.</CardDescription>
        </CardHeader>
        <CardContent>
          <PreferencesForm preferences={preferences} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fontes de vagas</CardTitle>
          <CardDescription>Status das integrações que alimentam a busca de vagas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {sources.map((source) => (
            <div key={source.key} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium text-white">{source.name}</p>
                {source.last_synced_at && (
                  <p className="text-xs text-muted">
                    Última sincronização: {new Date(source.last_synced_at).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
              <Badge variant={source.status === 'active' ? 'success' : source.status === 'error' ? 'danger' : 'default'}>
                {source.status === 'active' ? 'Ativa' : source.status === 'error' ? 'Com erro' : 'Não configurada'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary-hover" /> Inteligência Artificial
          </CardTitle>
          <CardDescription>
            Recurso opcional para explicações e resumos mais ricos. O sistema funciona normalmente sem ele.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant={isAIEnabled() ? 'success' : 'default'}>
            {isAIEnabled() ? 'Configurada' : 'Não configurada'}
          </Badge>
          {!isAIEnabled() && (
            <p className="mt-2 text-xs text-muted">
              Para habilitar, configure a variável ANTHROPIC_API_KEY no ambiente do servidor.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
