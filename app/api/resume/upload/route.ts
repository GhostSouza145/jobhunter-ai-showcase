import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateResumeFile } from '@/lib/resume/validate';
import { extractTextFromPdf } from '@/lib/resume/parse-pdf';
import { extractResumeData } from '@/lib/resume/extract-fields';
import { resolveSkill } from '@/lib/shared/skills-catalog';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
  }

  const validation = validateResumeFile({ type: file.type, size: file.size, name: file.name });
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 422 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const storagePath = `${user.id}/${Date.now()}-${sanitizeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage.from('resumes').upload(storagePath, buffer, {
    contentType: 'application/pdf',
    upsert: false,
  });

  if (uploadError) {
    return NextResponse.json({ error: `Falha ao salvar o arquivo: ${uploadError.message}` }, { status: 500 });
  }

  let rawText = '';
  let status: 'parsed' | 'failed' = 'parsed';
  let errorMessage: string | null = null;

  try {
    rawText = await extractTextFromPdf(buffer);
    if (!rawText.trim()) {
      status = 'failed';
      errorMessage = 'Não foi possível extrair texto deste PDF. Ele pode ser uma imagem escaneada.';
    }
  } catch (error) {
    status = 'failed';
    errorMessage = error instanceof Error ? error.message : 'Falha ao processar o PDF.';
  }

  const parsed = status === 'parsed' ? extractResumeData(rawText) : null;

  const { data: resume, error: insertError } = await supabase
    .from('resumes')
    .insert({
      user_id: user.id,
      file_path: storagePath,
      file_name: file.name,
      file_size: file.size,
      raw_text: rawText || null,
      parsed: (parsed ?? {}) as unknown as Record<string, unknown>,
      status,
      error_message: errorMessage,
    })
    .select()
    .single();

  if (insertError || !resume) {
    return NextResponse.json({ error: insertError?.message ?? 'Falha ao salvar currículo.' }, { status: 500 });
  }

  if (parsed && parsed.skills.length > 0) {
    const slugs = Array.from(
      new Set(parsed.skills.map((name) => resolveSkill(name)?.slug).filter((s): s is string => Boolean(s))),
    );
    const { data: skillRows } = await supabase.from('skills').select('id, slug').in('slug', slugs);
    if (skillRows && skillRows.length > 0) {
      await supabase.from('candidate_skills').delete().eq('user_id', user.id).eq('source', 'resume');
      await supabase.from('candidate_skills').upsert(
        skillRows.map((skill) => ({ user_id: user.id, skill_id: skill.id, source: 'resume' as const })),
        { onConflict: 'user_id,skill_id' },
      );
    }
  }

  return NextResponse.json({ resume, parsed }, { status: 201 });
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]/g, '_');
}
