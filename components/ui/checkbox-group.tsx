'use client';

import { cn } from '@/lib/utils';

export function CheckboxGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: [T, string][];
  value: T[];
  onChange: (value: T[]) => void;
}) {
  function toggle(option: T) {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-white/90">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {options.map(([optionValue, optionLabel]) => {
          const active = value.includes(optionValue);
          return (
            <button
              key={optionValue}
              type="button"
              onClick={() => toggle(optionValue)}
              aria-pressed={active}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                active
                  ? 'border-primary/50 bg-primary/15 text-primary-hover'
                  : 'border-border bg-surface-2 text-muted hover:text-white',
              )}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
