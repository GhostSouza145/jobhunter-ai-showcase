'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      toast({ title: 'Conta criada com sucesso', variant: 'success' });
      router.push('/dashboard');
      router.refresh();
      return;
    }

    toast({
      title: 'Confirme seu e-mail',
      description: 'Enviamos um link de confirmação para o seu e-mail.',
      variant: 'success',
    });
    router.push('/login');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome completo"
        required
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Seu nome"
      />
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
        autoComplete="new-password"
        required
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mínimo de 6 caracteres"
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" className="w-full" isLoading={loading}>
        Criar conta
      </Button>
    </form>
  );
}
