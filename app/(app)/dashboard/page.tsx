import type { Metadata } from 'next';
import Link from 'next/link';
import { Briefcase, Heart, Sparkles, TrendingUp, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getProfile, getCandidateProfileForMatching } from '@/lib/data/profile';
import { getFavoriteJobIds } from '@/lib/data/favorites';
import { getLatestResume } from '@/lib/data/resume';
import { searchJobsForUser } from '@/lib/jobs/search-for-user';
import { compatibilityTier } from '@/types/match';
import { StatsCard } from '@/components/dashboard/stats-card';
import { CompatibilityChart } from '@/components/dashboard/compatibility-chart';
import { JobCard } from '@/components/jobs/job-card';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

export const metadata: Metadata = { title: 'Dashboard — JobHunter AI' };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [profile, candidateProfile, favoriteIds, resume, jobsResult] = await Promise.all([
    getProfile(supabase, user.id),
    getCandidateProfileForMatching(supabase, user.id),
    getFavoriteJobIds(supabase, user.id),
    getLatestResume(supabase, user.id),
    searchJobsForUser(supabase, user.id, { page: 1, pageSize: 200 }, { recordHistory: false }),
  ]);

  const distribution = jobsResult.items.reduce(
    (acc, item) => {
      const tier = compatibilityTier(item.match.score);
      acc[tier] += 1;
      return acc;
    },
    { high: 0, good: 0, low: 0 },
  );

  const highMatches = jobsResult.items.filter((item) => item.match.score >= 85).slice(0, 3);
  const recentJobs = [...jobsResult.items]
    .sort((a, b) => new Date(b.job.publishedAt ?? 0).getTime() - new Date(a.job.publishedAt ?? 0).getTime())
    .slice(0, 3);

  const firstName = profile?.full_name?.split(' ')[0] || 'por aqui';
  const hasProfileInfo = Boolean(profile?.professional_area || candidateProfile.technologies.length > 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Olá, {firstName}</h1>
        <p className="text-sm text-muted">Aqui está um resumo da sua busca por vagas.</p>
      </div>

      {!resume && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <Upload className="h-5 w-5 text-primary-hover shrink-0" />
              <div>
                <p className="font-medium text-white">Envie seu currículo para começar</p>
                <p className="text-sm text-muted">
                  Sem um currículo, ainda podemos mostrar vagas, mas a compatibilidade será limitada às
                  preferências do seu perfil.
                </p>
              </div>
            </div>
            <Link href="/resume">
              <Button size="sm">Enviar currículo</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={Briefcase} label="Vagas encontradas" value={jobsResult.total} />
        <StatsCard icon={TrendingUp} label="Alta compatibilidade" value={distribution.high} accent="success" />
        <StatsCard icon={Heart} label="Vagas favoritas" value={favoriteIds.size} accent="accent" />
        <StatsCard
          icon={Sparkles}
          label="Tecnologias no perfil"
          value={candidateProfile.technologies.length}
          accent="warning"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent>
            <h2 className="mb-4 text-base font-semibold text-white">Distribuição de compatibilidade</h2>
            <CompatibilityChart distribution={distribution} />
            <p className="mt-3 text-xs text-muted">
              Indicadores de aderência técnica aos requisitos das vagas — não representam previsão de
              contratação.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="mb-4 text-base font-semibold text-white">Perfil profissional</h2>
            {hasProfileInfo ? (
              <div className="space-y-3 text-sm">
                {profile?.professional_area && (
                  <p className="text-white/90">
                    <span className="text-muted">Área: </span>
                    {profile.professional_area}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {candidateProfile.technologies.slice(0, 10).map((tech) => (
                    <Badge key={tech} variant="primary">
                      {tech}
                    </Badge>
                  ))}
                  {candidateProfile.technologies.length === 0 && (
                    <p className="text-muted">Nenhuma tecnologia cadastrada ainda.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">Complete seu perfil para melhorar a precisão do match.</p>
            )}
            <Link href="/profile" className="mt-4 inline-block">
              <Button variant="outline" size="sm">
                Editar perfil
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Vagas com alta compatibilidade</h2>
          <Link href="/jobs?minCompatibility=85" className="text-sm text-primary-hover hover:underline">
            Ver todas
          </Link>
        </div>
        {highMatches.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="Nenhuma vaga de alta compatibilidade ainda"
            description="Atualize seu currículo ou tecnologias no perfil para melhorar seus resultados."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {highMatches.map((item) => (
              <JobCard key={item.job.id} {...item} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Últimas vagas</h2>
          <Link href="/jobs" className="text-sm text-primary-hover hover:underline">
            Ver todas
          </Link>
        </div>
        {recentJobs.length === 0 ? (
          <EmptyState icon={Briefcase} title="Nenhuma vaga disponível no momento" />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {recentJobs.map((item) => (
              <JobCard key={item.job.id} {...item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
