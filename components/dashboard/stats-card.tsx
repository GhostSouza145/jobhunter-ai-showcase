import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function StatsCard({
  icon: Icon,
  label,
  value,
  accent = 'primary',
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: 'primary' | 'success' | 'warning' | 'accent';
}) {
  const accentClasses = {
    primary: 'bg-primary/15 text-primary-hover',
    success: 'bg-success/15 text-success',
    warning: 'bg-warning/15 text-warning',
    accent: 'bg-accent/15 text-accent',
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', accentClasses[accent])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white leading-none">{value}</p>
          <p className="mt-1 text-xs text-muted">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
