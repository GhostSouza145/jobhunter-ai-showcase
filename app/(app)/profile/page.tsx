import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/data/profile';
import { ProfileForm } from '@/components/profile/profile-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Perfil — JobHunter AI' };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await getProfile(supabase, user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Perfil profissional</h1>
        <p className="text-sm text-muted">
          Essas informações são usadas para calcular sua compatibilidade com as vagas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seus dados</CardTitle>
          <CardDescription>Mantenha essas informações atualizadas para resultados mais precisos.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
