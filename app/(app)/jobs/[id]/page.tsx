import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Building2, Calendar, ExternalLink, MapPin, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getJobByIdFromDb } from '@/lib/data/jobs';
import { getCandidateProfileForMatching } from '@/lib/data/profile';
import { getFavoriteJobIds } from '@/lib/data/favorites';
import { recordJobView } from '@/lib/data/history';
import { calculateMatch } from '@/lib/matching/calculate-match';
import { getAIProvider } from '@/lib/ai';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CompatibilityBadge, CompatibilityBar } from '@/components/jobs/compatibility-badge';
import { FavoriteButton } from '@/components/jobs/favorite-button';
import { RequirementsList } from '@/components/jobs/requirements-list';
import { MODALITY_LABELS, EMPLOYMENT_TYPE_LABELS, LEVEL_LABELS } from '@/lib/shared/labels';
import { formatRelativeDate } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const job = await getJobByIdFromDb(supabase, id);
  return { title: job ? `${job.title} — ${job.company} | JobHunter AI` : 'Vaga não encontrada' };
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const job = await getJobByIdFromDb(supabase, id);
  if (!job) notFound();

  const [candidateProfile, favoriteIds] = await Promise.all([
    getCandidateProfileForMatching(supabase, user.id),
    getFavoriteJobIds(supabase, user.id),
  ]);

  const match = calculateMatch(candidateProfile, job);
  void recordJobView(supabase, user.id, job.id);

  const aiProvider = getAIProvider();
  const aiExplanation = aiProvider ? await aiProvider.explainMatch(job, match) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-white sm:text-2xl">{job.title}</h1>
                {job.isDemo && <Badge variant="outline">DEMO</Badge>}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                <Building2 className="h-4 w-4" /> {job.company}
              </div>
            </div>
            <CompatibilityBadge score={match.score} className="self-start" />
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            {job.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {job.location}
              </span>
            )}
            {job.remote && <span>{MODALITY_LABELS[job.remote]}</span>}
            {job.employmentType && <span>{EMPLOYMENT_TYPE_LABELS[job.employmentType]}</span>}
            {job.level && <span>{LEVEL_LABELS[job.level]}</span>}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> {formatRelativeDate(job.publishedAt)}
            </span>
            <Badge variant="outline" className="capitalize">
              {job.source}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            {job.technologies.map((tech) => (
              <Badge key={tech} variant="primary">
                {tech}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a href={job.url} target="_blank" rel="noopener noreferrer">
              <Button variant="primary" className="gap-2">
                Ver vaga original <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
            <FavoriteButton jobId={job.id} initialFavorited={favoriteIds.has(job.id)} size="md" />
          </div>
          <p className="text-xs text-muted">
            Ao clicar em &quot;Ver vaga original&quot; você será direcionado ao site da fonte para se candidatar.
            O JobHunter AI não realiza candidaturas automáticas.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-base font-semibold text-white">Compatibilidade com seus requisitos</h2>
          <CompatibilityBar score={match.score} />
          <p className="text-sm text-muted">{match.explanation}</p>
          {aiExplanation && (
            <div className="flex gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm text-white/90">
              <Sparkles className="h-4 w-4 shrink-0 text-primary-hover mt-0.5" />
              <p>{aiExplanation}</p>
            </div>
          )}
          <p className="text-xs text-muted">
            Este percentual representa aderência aos requisitos identificados nesta vaga — não é uma
            previsão de chance de contratação.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="mb-4 text-base font-semibold text-white">Requisitos</h2>
          <RequirementsList matched={match.matchedSkills} missing={match.missingSkills} />
        </CardContent>
      </Card>

      {job.description && (
        <Card>
          <CardContent>
            <h2 className="mb-3 text-base font-semibold text-white">Descrição da vaga</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted">{job.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
