import Link from 'next/link';
import {
  ArrowRight,
  FileSearch,
  Gauge,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Upload,
} from 'lucide-react';
import { PublicHeader } from '@/components/layout/public-header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const STEPS = [
  {
    icon: Upload,
    title: 'Envie seu currículo',
    description: 'Faça upload do seu currículo em PDF. Extraímos suas tecnologias, experiências e formação automaticamente.',
  },
  {
    icon: Target,
    title: 'Defina suas preferências',
    description: 'Escolha área, tipo de contratação, modalidade e localização para refinar a busca.',
  },
  {
    icon: FileSearch,
    title: 'Encontre vagas compatíveis',
    description: 'Buscamos vagas em fontes públicas e calculamos sua compatibilidade com cada requisito.',
  },
];

const FEATURES = [
  {
    icon: Gauge,
    title: 'Compatibilidade explicada',
    description: 'Veja exatamente quais requisitos você atende e quais ainda faltam, com pesos por relevância.',
  },
  {
    icon: ShieldCheck,
    title: 'Você no controle',
    description: 'Nunca automatizamos candidaturas. Você sempre se candidata direto no site original da vaga.',
  },
  {
    icon: Sparkles,
    title: 'Funciona sem IA paga',
    description: 'O algoritmo de match é 100% próprio. IA é opcional, apenas para explicações extras.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 pt-20 pb-16 text-center sm:px-6">
          <Badge variant="primary" className="mb-6">
            <Star className="h-3 w-3" /> Modo demonstração disponível sem cadastro de API
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            JOBHUNTER<span className="text-gradient"> AI</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            Encontre vagas que combinam com você.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
            Envie seu currículo, defina suas preferências e veja sua compatibilidade real com
            vagas de tecnologia — com transparência total sobre requisitos atendidos e ausentes.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Começar agora <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <Card key={step.title} className="relative overflow-hidden">
                <CardContent className="flex flex-col gap-3">
                  <span className="text-xs font-semibold text-primary-hover">PASSO {i + 1}</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                    <step.icon className="h-5 w-5 text-primary-hover" />
                  </div>
                  <h3 className="font-semibold text-white">{step.title}</h3>
                  <p className="text-sm text-muted">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-surface/40 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Compatibilidade com requisitos, não promessas de emprego
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-muted">
                Mostramos o percentual de aderência técnica entre seu perfil e cada vaga —
                nunca uma previsão de chance de contratação.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {FEATURES.map((feature) => (
                <Card key={feature.title}>
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15">
                      <feature.icon className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-muted">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Pronto para encontrar sua próxima vaga?</h2>
          <p className="mt-3 text-sm text-muted">
            Crie sua conta gratuitamente e veja sua compatibilidade com vagas reais em minutos.
          </p>
          <Link href="/register" className="mt-8 inline-block">
            <Button size="lg" className="gap-2">
              Criar conta gratuita <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
