import Link from 'next/link';
import { Briefcase, Building2, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CompatibilityBadge } from '@/components/jobs/compatibility-badge';
import { FavoriteButton } from '@/components/jobs/favorite-button';
import { MODALITY_LABELS, EMPLOYMENT_TYPE_LABELS } from '@/lib/shared/labels';
import { formatRelativeDate } from '@/lib/utils';
import type { JobWithMatch } from '@/lib/jobs/search-for-user';

export function JobCard({ job, match, isFavorite }: JobWithMatch) {
  return (
    <Card className="animate-fade-in flex flex-col">
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-white truncate">{job.title}</h3>
              {job.isDemo && (
                <Badge variant="outline" className="shrink-0">
                  DEMO
                </Badge>
              )}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{job.company}</span>
            </div>
          </div>
          <CompatibilityBadge score={match.score} className="shrink-0" />
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {job.location}
            </span>
          )}
          {job.remote && (
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" /> {MODALITY_LABELS[job.remote]}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {formatRelativeDate(job.publishedAt)}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {job.employmentType && <Badge variant="primary">{EMPLOYMENT_TYPE_LABELS[job.employmentType]}</Badge>}
          <Badge variant="outline" className="capitalize">
            {job.source}
          </Badge>
          {job.technologies.slice(0, 4).map((tech) => (
            <Badge key={tech}>{tech}</Badge>
          ))}
          {job.technologies.length > 4 && <Badge variant="outline">+{job.technologies.length - 4}</Badge>}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-2">
          <Link href={`/jobs/${job.id}`} className="flex-1">
            <Button variant="primary" size="sm" className="w-full">
              Ver vaga
            </Button>
          </Link>
          <FavoriteButton jobId={job.id} initialFavorited={isFavorite} />
        </div>
      </CardContent>
    </Card>
  );
}
