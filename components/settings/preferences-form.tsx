'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { TagInput } from '@/components/ui/tag-input';
import { CheckboxGroup } from '@/components/ui/checkbox-group';
import { Button } from '@/components/ui/button';
import { updateSearchPreferences } from '@/lib/actions/preferences';
import { toast } from '@/hooks/use-toast';
import { EMPLOYMENT_TYPE_OPTIONS, MODALITY_OPTIONS } from '@/lib/shared/labels';
import type { EmploymentType, RemoteModality } from '@/types/database';
import type { SearchPreferencesRow } from '@/lib/data/preferences';

export function PreferencesForm({ preferences }: { preferences: SearchPreferencesRow | null }) {
  const router = useRouter();
  const [professionalArea, setProfessionalArea] = useState(preferences?.professional_area ?? '');
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>(
    (preferences?.employment_types as EmploymentType[]) ?? [],
  );
  const [modality, setModality] = useState<RemoteModality[]>((preferences?.modality as RemoteModality[]) ?? []);
  const [technologies, setTechnologies] = useState<string[]>(preferences?.technologies ?? []);
  const [location, setLocation] = useState(preferences?.location ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await updateSearchPreferences({
      professionalArea,
      employmentTypes,
      modality,
      technologies,
      location,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      toast({ title: 'Não foi possível salvar', description: result.error, variant: 'error' });
      return;
    }

    toast({ title: 'Preferências de busca atualizadas', variant: 'success' });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Área profissional buscada"
        value={professionalArea}
        onChange={(e) => setProfessionalArea(e.target.value)}
        placeholder="Ex.: Desenvolvimento de Software"
      />

      <CheckboxGroup
        label="Tipo de contratação"
        options={EMPLOYMENT_TYPE_OPTIONS}
        value={employmentTypes}
        onChange={setEmploymentTypes}
      />

      <CheckboxGroup label="Modalidade" options={MODALITY_OPTIONS} value={modality} onChange={setModality} />

      <TagInput
        label="Tecnologias de interesse"
        value={technologies}
        onChange={setTechnologies}
        placeholder="Ex.: React, Python, AWS"
      />

      <Input
        label="Localização preferida"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Cidade, Estado"
      />

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" isLoading={loading}>
        Salvar preferências
      </Button>
    </form>
  );
}
