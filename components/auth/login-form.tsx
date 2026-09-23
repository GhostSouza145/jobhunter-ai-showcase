'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError('E-mail ou senha inválidos.');
      return;
    }

    toast({ title: 'Login realizado com sucesso', variant: 'success' });
    const redirectTo = searchParams.get('redirectTo') || '/dashboard';
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="E-mail"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="voce@email.com"
      />
      <Input
        label="Senha"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-xs text-muted hover:text-white">
          Esqueceu sua senha?
        </Link>
      </div>
      <Button type="submit" className="w-full" isLoading={loading}>
        Entrar
      </Button>
    </form>
  );
}
