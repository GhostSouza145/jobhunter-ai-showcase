import type { Metadata } from 'next';
import { Briefcase } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { searchJobsForUser } from '@/lib/jobs/search-for-user';
import { parseJobFiltersFromSearchParams } from '@/lib/jobs/parse-filters';
import { JobFilters } from '@/components/jobs/job-filters';
import { JobCard } from '@/components/jobs/job-card';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Vagas — JobHunter AI' };

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const urlSearchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(resolvedParams)) {
    if (typeof value === 'string') urlSearchParams.set(key, value);
  }

  const filters = parseJobFiltersFromSearchParams(urlSearchParams);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const result = await searchJobsForUser(supabase, user.id, filters);

  function buildHref(page: number) {
    const params = new URLSearchParams(urlSearchParams);
    params.set('page', String(page));
    return `/jobs?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white">Vagas</h1>
        <p className="text-sm text-muted">
          {result.total} vaga{result.total === 1 ? '' : 's'} encontrada{result.total === 1 ? '' : 's'} com base no
          seu perfil.
        </p>
      </div>

      <JobFilters />

      {result.sourceErrors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {result.sourceErrors.map((err) => (
            <Badge key={err.source} variant="warning">
              Fonte &quot;{err.source}&quot; indisponível no momento
            </Badge>
          ))}
        </div>
      )}

      {result.items.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Nenhuma vaga encontrada"
          description="Tente ajustar os filtros ou atualizar suas preferências de busca em Configurações."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {result.items.map((item) => (
            <JobCard key={item.job.id} {...item} />
          ))}
        </div>
      )}

      <Pagination page={result.page} totalPages={result.totalPages} buildHref={buildHref} />
    </div>
  );
}
