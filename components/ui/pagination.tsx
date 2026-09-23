import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted hover:text-white hover:bg-surface-2',
          page <= 1 && 'pointer-events-none opacity-40',
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      <span className="text-sm text-muted px-2">
        Página {page} de {totalPages}
      </span>
      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted hover:text-white hover:bg-surface-2',
          page >= totalPages && 'pointer-events-none opacity-40',
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
