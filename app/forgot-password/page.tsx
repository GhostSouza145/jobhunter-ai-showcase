import Link from 'next/link';
import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/auth-card';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata: Metadata = { title: 'Recuperar senha — JobHunter AI' };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Recuperar senha"
      description="Informe seu e-mail para receber um link de redefinição de senha."
      footer={
        <p>
          Lembrou a senha?{' '}
          <Link href="/login" className="text-primary-hover hover:underline">
            Entrar
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
