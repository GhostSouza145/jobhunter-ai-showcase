import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/auth-card';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata: Metadata = { title: 'Redefinir senha — JobHunter AI' };

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Defina uma nova senha" description="Escolha uma nova senha para sua conta.">
      <ResetPasswordForm />
    </AuthCard>
  );
}
