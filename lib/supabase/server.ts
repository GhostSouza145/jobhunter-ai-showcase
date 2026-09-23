import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

/**
 * Cliente Supabase para uso em Server Components, Server Actions e Route
 * Handlers. Usa a chave anon + RLS — nunca a service_role key.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // chamado a partir de um Server Component sem permissão de escrita;
            // a sessão será atualizada pelo middleware na próxima navegação.
          }
        },
      },
    },
  );
}

/**
 * Cliente administrativo com service_role key. Usado apenas em Route
 * Handlers de servidor que precisam ignorar RLS (ex.: gravar vagas
 * agregadas de fontes externas). NUNCA importar este módulo em código
 * que roda no browser.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada.');
  }
  return createSupabaseClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false },
  });
}
