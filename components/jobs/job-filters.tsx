'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';
import { EMPLOYMENT_TYPE_OPTIONS, LEVEL_OPTIONS, MODALITY_OPTIONS } from '@/lib/shared/labels';

const SOURCE_OPTIONS = [
  { value: 'demo', label: 'Demonstração' },
  { value: 'remotive', label: 'Remotive' },
  { value: 'arbeitnow', label: 'Arbeitnow' },
];

const COMPATIBILITY_OPTIONS = [
  { value: '', label: 'Qualquer compatibilidade' },
  { value: '85', label: 'Alta (85%+)' },
  { value: '70', label: 'Boa (70%+)' },
  { value: '50', label: 'A partir de 50%' },
];

export function JobFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('query') ?? '');
  const [location, setLocation] = useState(searchParams.get('location') ?? '');
  const debouncedQuery = useDebounce(query, 400);
  const debouncedLocation = useDebounce(location, 400);

  useEffect(() => {
    updateParams({ query: debouncedQuery || null, location: debouncedLocation || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, debouncedLocation]);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="rounded-2xl border border-border bg-surface/60 p-4">
      <div className="flex items-center gap-2 mb-3 text-sm font-medium text-white">
        <SlidersHorizontal className="h-4 w-4" /> Filtros
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Input
            placeholder="Buscar por cargo, empresa ou palavra-chave"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar vagas"
          />
        </div>
        <Input
          placeholder="Localização"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <Select
          defaultValue={searchParams.get('modality') ?? ''}
          onChange={(e) => updateParams({ modality: e.target.value || null })}
        >
          <option value="">Qualquer modalidade</option>
          {MODALITY_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          defaultValue={searchParams.get('employmentType') ?? ''}
          onChange={(e) => updateParams({ employmentType: e.target.value || null })}
        >
          <option value="">Qualquer contratação</option>
          {EMPLOYMENT_TYPE_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          defaultValue={searchParams.get('level') ?? ''}
          onChange={(e) => updateParams({ level: e.target.value || null })}
        >
          <option value="">Qualquer nível</option>
          {LEVEL_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          defaultValue={searchParams.get('source') ?? ''}
          onChange={(e) => updateParams({ source: e.target.value || null })}
        >
          <option value="">Qualquer fonte</option>
          {SOURCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Select
          defaultValue={searchParams.get('minCompatibility') ?? ''}
          onChange={(e) => updateParams({ minCompatibility: e.target.value || null })}
        >
          {COMPATIBILITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      {searchParams.toString() && (
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
