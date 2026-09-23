import type { Metadata } from 'next';
import { AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getLatestResume } from '@/lib/data/resume';
import { ResumeUpload } from '@/components/resume/resume-upload';
import { ResumePreview } from '@/components/resume/resume-preview';
import { Card, CardContent } from '@/components/ui/card';
import type { ParsedResumeData } from '@/types/candidate';

export const metadata: Metadata = { title: 'Currículo — JobHunter AI' };

export default async function ResumePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const resume = await getLatestResume(supabase, user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Currículo</h1>
        <p className="text-sm text-muted">
          Envie seu currículo em PDF para que possamos calcular sua compatibilidade com as vagas. Você pode
          enviar um novo arquivo a qualquer momento para atualizar seus dados.
        </p>
      </div>

      <ResumeUpload />

      {resume?.status === 'failed' && (
        <Card className="border-danger/30 bg-danger/5">
          <CardContent className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-danger" />
            <div>
              <p className="font-medium text-white">Não foi possível processar o último currículo enviado</p>
              <p className="text-sm text-muted">{resume.error_message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {resume?.status === 'parsed' && (
        <ResumePreview resumeId={resume.id} parsed={resume.parsed as unknown as ParsedResumeData} />
      )}
    </div>
  );
}
