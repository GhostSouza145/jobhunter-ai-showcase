import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

/**
 * Endpoint de confirmação de e-mail (cadastro e recuperação de senha).
 *
 * Usa verifyOtp com token_hash em vez de exchangeCodeForSession, porque o
 * link é aberto a partir do cliente de e-mail — geralmente em um navegador/
 * aba diferente daquele que iniciou o cadastro. O fluxo por código (PKCE)
 * depende de um cookie salvo no navegador de origem e falha nesse cenário;
 * verifyOtp com token_hash não depende desse cookie.
 *
 * Os templates de e-mail no Supabase (Authentication > Email Templates)
 * precisam apontar para esta rota, ex.:
 * {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/dashboard
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? (type === 'recovery' ? '/reset-password' : '/dashboard');

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
}
