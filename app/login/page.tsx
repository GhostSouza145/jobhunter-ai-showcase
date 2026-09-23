import Link from 'next/link';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/auth-card';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = { title: 'Entrar — JobHunter AI' };

export default function LoginPage() {
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
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
