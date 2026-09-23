import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeDate(iso: string | null): string {
  if (!iso) return 'Data não informada';
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 30) return `Há ${diffDays} dias`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `Há ${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'}`;
  const diffYears = Math.floor(diffMonths / 12);
  return `Há ${diffYears} ${diffYears === 1 ? 'ano' : 'anos'}`;
}
