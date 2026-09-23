import type { Metadata } from 'next';
import { Heart } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getFavoriteJobs } from '@/lib/data/favorites';
import { getCandidateProfileForMatching } from '@/lib/data/profile';
import { calculateMatch } from '@/lib/matching/calculate-match';
import { JobCard } from '@/components/jobs/job-card';
import { EmptyState } from '@/components/ui/empty-state';

export const metadata: Metadata = { title: 'Favoritas — JobHunter AI' };

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [jobs, candidateProfile] = await Promise.all([
    getFavoriteJobs(supabase, user.id),
    getCandidateProfileForMatching(supabase, user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Vagas favoritas</h1>
        <p className="text-sm text-muted">Vagas que você salvou para revisar depois.</p>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nenhuma vaga favoritada ainda"
          description="Salve vagas na página de busca para encontrá-las facilmente aqui."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              match={calculateMatch(candidateProfile, job)}
              isFavorite
            />
          ))}
        </div>
      )}
    </div>
  );
}
