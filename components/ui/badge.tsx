import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline';

const VARIANT_CLASSES: Record<Variant, string> = {
  default: 'bg-surface-2 text-muted border border-border',
  primary: 'bg-primary/15 text-primary-hover border border-primary/30',
  success: 'bg-success/10 text-success border border-success/30',
  warning: 'bg-warning/10 text-warning border border-warning/30',
  danger: 'bg-danger/10 text-danger border border-danger/30',
  outline: 'bg-transparent text-muted border border-border',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  );
}
