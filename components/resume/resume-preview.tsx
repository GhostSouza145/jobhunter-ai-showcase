'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TagInput } from '@/components/ui/tag-input';
import { confirmResumeData } from '@/lib/actions/resume';
import { toast } from '@/hooks/use-toast';
import type { ParsedResumeData } from '@/types/candidate';

export function ResumePreview({ resumeId, parsed }: { resumeId: string; parsed: ParsedResumeData }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<ParsedResumeData>(parsed);

  async function handleSave() {
    setSaving(true);
    try {
      await confirmResumeData(resumeId, {
        ...draft,
        skills: Array.from(
          new Set([...draft.technologies, ...draft.frameworks, ...draft.databases, ...draft.tools]),
        ),
      });
      toast({ title: 'Currículo atualizado', variant: 'success' });
      setEditing(false);
      router.refresh();
    } catch (error) {
      toast({
        title: 'Não foi possível salvar',
        description: error instanceof Error ? error.message : undefined,
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Dados extraídos do currículo</CardTitle>
          <CardDescription>Confira e edite se algo não estiver correto.</CardDescription>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setDraft(parsed); setEditing(false); }}>
              <X className="h-4 w-4" /> Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} isLoading={saving}>
              <Save className="h-4 w-4" /> Salvar
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" /> Editar
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <Field label="Nome identificado">
          {editing ? (
            <Input
              value={draft.name ?? ''}
              onChange={(e) => setDraft({ ...draft, name: e.target.value || null })}
              placeholder="Não identificado"
            />
          ) : (
            <p className="text-sm text-white/90">{parsed.name || 'Não identificado'}</p>
          )}
        </Field>

        <Field label="Tecnologias / Linguagens">
          {editing ? (
            <TagInput value={draft.technologies} onChange={(v) => setDraft({ ...draft, technologies: v })} />
          ) : (
            <TagList items={parsed.technologies} />
          )}
        </Field>

        <Field label="Frameworks">
          {editing ? (
            <TagInput value={draft.frameworks} onChange={(v) => setDraft({ ...draft, frameworks: v })} />
          ) : (
            <TagList items={parsed.frameworks} />
          )}
        </Field>

        <Field label="Bancos de dados">
          {editing ? (
            <TagInput value={draft.databases} onChange={(v) => setDraft({ ...draft, databases: v })} />
          ) : (
            <TagList items={parsed.databases} />
          )}
        </Field>

        <Field label="Ferramentas / Plataformas">
          {editing ? (
            <TagInput value={draft.tools} onChange={(v) => setDraft({ ...draft, tools: v })} />
          ) : (
            <TagList items={parsed.tools} />
          )}
        </Field>

        <Field label="Certificações">
          {editing ? (
            <TagInput value={draft.certifications} onChange={(v) => setDraft({ ...draft, certifications: v })} />
          ) : (
            <TagList items={parsed.certifications} empty="Nenhuma certificação identificada." />
          )}
        </Field>

        <Field label="Idiomas">
          {editing ? (
            <TagInput value={draft.spokenLanguages} onChange={(v) => setDraft({ ...draft, spokenLanguages: v })} />
          ) : (
            <TagList items={parsed.spokenLanguages} empty="Nenhum idioma identificado." />
          )}
        </Field>

        <Field label="Formação">
          {parsed.education.length === 0 ? (
            <p className="text-sm text-muted">Nenhuma formação identificada.</p>
          ) : (
            <ul className="list-disc space-y-1 pl-5 text-sm text-white/90">
              {parsed.education.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </Field>

        <Field label="Experiências">
          {parsed.experiences.length === 0 ? (
            <p className="text-sm text-muted">Nenhuma experiência identificada.</p>
          ) : (
            <div className="space-y-3">
              {parsed.experiences.map((exp, i) => (
                <div key={i} className="rounded-lg border border-border p-3 text-sm">
                  <p className="font-medium text-white">{exp.role || 'Cargo não identificado'}</p>
                  <p className="text-muted">
                    {[exp.company, exp.period].filter(Boolean).join(' • ') || 'Detalhes não identificados'}
                  </p>
                  {exp.description && <p className="mt-1 text-muted">{exp.description}</p>}
                </div>
              ))}
            </div>
          )}
        </Field>

        <Field label="Projetos">
          {parsed.projects.length === 0 ? (
            <p className="text-sm text-muted">Nenhum projeto identificado.</p>
          ) : (
            <ul className="list-disc space-y-1 pl-5 text-sm text-white/90">
              {parsed.projects.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </Field>

        <Field label="Links">
          {parsed.links.length === 0 ? (
            <p className="text-sm text-muted">Nenhum link identificado.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {parsed.links.map((link) => (
                <li key={link}>
                  <a
                    href={link.startsWith('http') ? link : `https://${link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-hover hover:underline break-all"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Field>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-white">{label}</h4>
      {children}
    </div>
  );
}

function TagList({ items, empty }: { items: string[]; empty?: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">{empty ?? 'Nenhum item identificado.'}</p>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge key={item} variant="primary">
          {item}
        </Badge>
      ))}
    </div>
  );
}
