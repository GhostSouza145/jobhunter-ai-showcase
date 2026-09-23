'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/components/ui/tag-input';
import { CheckboxGroup } from '@/components/ui/checkbox-group';
import { Button } from '@/components/ui/button';
import { updateProfile } from '@/lib/actions/profile';
import { toast } from '@/hooks/use-toast';
import { EMPLOYMENT_TYPE_OPTIONS, LEVEL_OPTIONS, MODALITY_OPTIONS } from '@/lib/shared/labels';
import type { EmploymentType, Level, RemoteModality } from '@/types/database';
import type { ProfileRow } from '@/lib/data/profile';

export function ProfileForm({ profile }: { profile: ProfileRow | null }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [professionalArea, setProfessionalArea] = useState(profile?.professional_area ?? '');
  const [level, setLevel] = useState<Level | ''>(profile?.level ?? '');
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>(
    (profile?.employment_types as EmploymentType[]) ?? [],
  );
  const [modality, setModality] = useState<RemoteModality[]>((profile?.modality as RemoteModality[]) ?? []);
  const [location, setLocation] = useState(profile?.location ?? '');
  const [technologies, setTechnologies] = useState<string[]>(profile?.technologies ?? []);
  const [interests, setInterests] = useState<string[]>(profile?.interests ?? []);
  const [experience, setExperience] = useState(profile?.experience ?? '');
  const [education, setEducation] = useState(profile?.education ?? '');
  const [githubUrl, setGithubUrl] = useState(profile?.github_url ?? '');
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url ?? '');
  const [portfolioUrl, setPortfolioUrl] = useState(profile?.portfolio_url ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await updateProfile({
      fullName,
      professionalArea,
      level: level || undefined,
      employmentTypes,
      modality,
      location,
      technologies,
      interests,
      experience,
      education,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      toast({ title: 'Não foi possível salvar', description: result.error, variant: 'error' });
      return;
    }

    toast({ title: 'Perfil atualizado com sucesso', variant: 'success' });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Nome" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Input
          label="Área profissional"
          value={professionalArea}
          onChange={(e) => setProfessionalArea(e.target.value)}
          placeholder="Ex.: Desenvolvimento Front-end"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select label="Nível" value={level} onChange={(e) => setLevel(e.target.value as Level | '')}>
          <option value="">Selecione</option>
          {LEVEL_OPTIONS.map(([value, optionLabel]) => (
            <option key={value} value={value}>
              {optionLabel}
            </option>
          ))}
        </Select>
        <Input
          label="Localização"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Cidade, Estado"
        />
      </div>

      <CheckboxGroup
        label="Tipo de contratação desejado"
        options={EMPLOYMENT_TYPE_OPTIONS}
        value={employmentTypes}
        onChange={setEmploymentTypes}
      />

      <CheckboxGroup label="Modalidade" options={MODALITY_OPTIONS} value={modality} onChange={setModality} />

      <TagInput
        label="Tecnologias"
        value={technologies}
        onChange={setTechnologies}
        placeholder="Ex.: React, TypeScript, Node.js"
      />

      <TagInput
        label="Interesses profissionais"
        value={interests}
        onChange={setInterests}
        placeholder="Ex.: Back-end, Dados, Produto"
      />

      <Textarea
        label="Experiência"
        rows={4}
        value={experience}
        onChange={(e) => setExperience(e.target.value)}
        placeholder="Resumo da sua experiência profissional"
      />

      <Textarea
        label="Formação acadêmica"
        rows={3}
        value={education}
        onChange={(e) => setEducation(e.target.value)}
        placeholder="Ex.: Bacharelado em Ciência da Computação — Cursando"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          label="GitHub"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          placeholder="https://github.com/seu-usuario"
        />
        <Input
          label="LinkedIn"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          placeholder="https://linkedin.com/in/seu-usuario"
        />
        <Input
          label="Portfólio"
          value={portfolioUrl}
          onChange={(e) => setPortfolioUrl(e.target.value)}
          placeholder="https://seu-portfolio.com"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" isLoading={loading}>
        Salvar perfil
      </Button>
    </form>
  );
}
