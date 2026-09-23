'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, User, FileText, Briefcase, Heart, Settings, Menu, X, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/hooks/use-toast';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs', label: 'Vagas', icon: Briefcase },
  { href: '/favorites', label: 'Favoritas', icon: Heart },
  { href: '/resume', label: 'Currículo', icon: FileText },
  { href: '/profile', label: 'Perfil', icon: User },
  { href: '/settings', label: 'Configurações', icon: Settings },
];

export function Navbar({ userName }: { userName: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast({ title: 'Sessão encerrada', variant: 'default' });
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">
            JH
          </span>
          <span className="hidden sm:inline">
            JOBHUNTER<span className="text-gradient"> AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active ? 'bg-surface-2 text-white' : 'text-muted hover:text-white hover:bg-surface-2',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {userName && <span className="text-sm text-muted">Olá, {userName.split(' ')[0]}</span>}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:text-white hover:bg-surface-2 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-background px-4 py-3 space-y-1 animate-fade-in">
          {NAV_ITEMS.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active ? 'bg-surface-2 text-white' : 'text-muted hover:text-white hover:bg-surface-2',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:text-white hover:bg-surface-2"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </nav>
      )}
    </header>
  );
}
