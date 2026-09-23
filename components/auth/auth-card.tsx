import type { ReactNode } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-semibold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">
            JH
          </span>
          JOBHUNTER<span className="text-gradient">&nbsp;AI</span>
        </Link>
        <Card className="animate-fade-in">
          <CardContent className="pt-6">
            <h1 className="text-xl font-semibold text-white">{title}</h1>
            <p className="mt-1 text-sm text-muted">{description}</p>
            <div className="mt-6">{children}</div>
          </CardContent>
        </Card>
        {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
      </div>
    </div>
  );
}
