'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AuthCard } from '@/components/auth/auth-card';
import { Button } from '@/components/ui/button';

/**
 * Processa o retorno dos links de e-mail (confirmação de cadastro e
 * recuperação de senha) enviados pelo Supabase.
 *
 * O Supabase Auth entrega a sessão de duas formas possíveis dependendo do
 * fluxo negociado:
 *  - implícito: tokens no fragmento da URL (#access_token=...&refresh_token=...),
 *    que só o navegador consegue ler — por isso este componente roda no
 *    cliente em vez de um Route Handler de servidor.
 *  - PKCE: um parâmetro ?code= na query string, trocável por uma sessão.
 * Tratamos os dois casos para cobrir ambos os cenários.
 */
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function handle() {
      const next = searchParams.get('next') || '/dashboard';
      const supabase = createClient();

      const rawHash = window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash;
      const hashParams = new URLSearchParams(rawHash);
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!sessionError) {
          window.location.href = next;
          return;
        }
      }

      const code = searchParams.get('code');
      if (code) {
        const { error: codeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!codeError) {
          window.location.href = next;
          return;
        }
      }

      if (!cancelled) {
        setError(
          'Não foi possível confirmar seu link. Ele pode ter expirado ou já ter sido usado — tente fazer login normalmente ou solicite um novo link.',
        );
      }
    }

    handle();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <AuthCard title="Não foi possível confirmar" description="">
        <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
        <Button className="mt-4 w-full" onClick={() => router.push('/login')}>
          Ir para o login
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Confirmando..." description="Estamos validando seu link, um instante.">
      <div className="flex justify-center py-4">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    </AuthCard>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackContent />
    </Suspense>
  );
}
