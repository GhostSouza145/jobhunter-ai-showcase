import Link from 'next/link';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AlertTriangle } from 'lucide-react';
import { AuthCard } from '@/components/auth/auth-card';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = { title: 'Entrar — JobHunter AI' };

const ERROR_MESSAGES: Record<string, string> = {
  auth_callback_failed:
    'Não foi possível confirmar seu link. Ele pode ter expirado ou já ter sido usado — tente fazer login normalmente ou solicite um novo link.',
  confirmation_failed:
    'Não foi possível confirmar seu link. Ele pode ter expirado ou já ter sido usado — tente fazer login normalmente ou solicite um novo link.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const errorParam = typeof resolvedParams.error === 'string' ? resolvedParams.error : null;
  const errorMessage = errorParam ? ERROR_MESSAGES[errorParam] : null;

  return (
    <AuthCard
      title="Bem-vindo de volta"
      description="Entre com sua conta para continuar sua busca."
      footer={
        <p>
          Ainda não tem conta?{' '}
          <Link href="/register" className="text-primary-hover hover:underline">
            Criar conta
          </Link>
        </p>
      }
    >
      {errorMessage && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
