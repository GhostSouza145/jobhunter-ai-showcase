import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted sm:flex-row sm:px-6">
        <p>&copy; {new Date().getFullYear()} JobHunter AI. Todos os direitos reservados.</p>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hover:text-white transition-colors">
            Entrar
          </Link>
          <Link href="/register" className="hover:text-white transition-colors">
            Criar conta
          </Link>
        </div>
      </div>
    </footer>
  );
}
