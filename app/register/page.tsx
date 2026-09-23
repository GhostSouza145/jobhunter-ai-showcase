import Link from 'next/link';
import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/auth-card';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = { title: 'Criar conta — JobHunter AI' };

export default function RegisterPage() {
  return (
    <AuthCard
      title="Crie sua conta"
      description="Leva menos de um minuto para começar a encontrar vagas compatíveis."
      footer={
        <p>
          Já tem conta?{' '}
          <Link href="/login" className="text-primary-hover hover:underline">
            Entrar
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
