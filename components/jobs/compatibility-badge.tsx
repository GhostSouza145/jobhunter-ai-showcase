import { compatibilityTier } from '@/types/match';
import { cn } from '@/lib/utils';

const TIER_CLASSES = {
  high: 'bg-success/15 text-success border-success/30',
  good: 'bg-primary/15 text-primary-hover border-primary/30',
  low: 'bg-warning/10 text-warning border-warning/30',
};

const TIER_LABELS = {
  high: 'Alta compatibilidade',
  good: 'Boa compatibilidade',
  low: 'Baixa compatibilidade',
};

export function CompatibilityBadge({ score, className }: { score: number; className?: string }) {
  const tier = compatibilityTier(score);
  return (
    <div
      title={TIER_LABELS[tier]}
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border px-3 py-1.5 leading-none',
        TIER_CLASSES[tier],
        className,
      )}
    >
      <span className="text-lg font-bold">{score}%</span>
      <span className="text-[10px] font-medium uppercase tracking-wide opacity-80">match</span>
    </div>
  );
}

export function CompatibilityBar({ score }: { score: number }) {
  const tier = compatibilityTier(score);
  const barColor = tier === 'high' ? 'bg-success' : tier === 'good' ? 'bg-primary' : 'bg-warning';
  return (
    <div className="h-1.5 w-full rounded-full bg-surface-2">
      <div
        className={cn('h-full rounded-full transition-all', barColor)}
        style={{ width: `${Math.max(4, score)}%` }}
      />
    </div>
  );
}
