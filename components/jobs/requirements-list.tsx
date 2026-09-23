import { Check, X } from 'lucide-react';

export function RequirementsList({ matched, missing }: { matched: string[]; missing: string[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-success">
          <Check className="h-4 w-4" /> Você possui
        </h4>
        {matched.length === 0 ? (
          <p className="text-sm text-muted">Nenhum requisito identificado em comum ainda.</p>
        ) : (
          <ul className="space-y-1.5">
            {matched.map((skill) => (
              <li key={skill} className="flex items-center gap-2 text-sm text-white/90">
                <Check className="h-3.5 w-3.5 text-success shrink-0" /> {skill}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-warning">
          <X className="h-4 w-4" /> Você não possui no currículo
        </h4>
        {missing.length === 0 ? (
          <p className="text-sm text-muted">Nenhum requisito identificado está ausente.</p>
        ) : (
          <ul className="space-y-1.5">
            {missing.map((skill) => (
              <li key={skill} className="flex items-center gap-2 text-sm text-white/90">
                <X className="h-3.5 w-3.5 text-warning shrink-0" /> {skill}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
