'use client';

import { CheckCircle2, X, XCircle, Info } from 'lucide-react';
import { dismissToast, useToasts, type Toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ICONS: Record<Toast['variant'], typeof Info> = {
  default: Info,
  success: CheckCircle2,
  error: XCircle,
};

const VARIANT_CLASSES: Record<Toast['variant'], string> = {
  default: 'border-border',
  success: 'border-success/40',
  error: 'border-danger/40',
};

const ICON_CLASSES: Record<Toast['variant'], string> = {
  default: 'text-primary',
  success: 'text-success',
  error: 'text-danger',
};

export function Toaster() {
  const toasts = useToasts();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const Icon = ICONS[t.variant];
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              'animate-fade-in flex items-start gap-3 rounded-xl border bg-surface p-4 shadow-2xl shadow-black/30',
              VARIANT_CLASSES[t.variant],
            )}
          >
            <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', ICON_CLASSES[t.variant])} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{t.title}</p>
              {t.description && <p className="text-xs text-muted mt-0.5">{t.description}</p>}
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-muted hover:text-white"
              aria-label="Fechar notificação"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
