'use client';

import { PONTOS_FORTES, type PontoForteKey } from '@/types/briefing';

interface PontosFortesBadgesProps {
  selected: string[];
  editable?: boolean;
  onChange?: (selected: string[]) => void;
  size?: 'sm' | 'md';
}

export function PontosFortesBadges({ selected, editable = false, onChange, size = 'md' }: PontosFortesBadgesProps) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  function toggle(key: string) {
    if (!editable || !onChange) return;
    const next = selected.includes(key)
      ? selected.filter(k => k !== key)
      : [...selected, key];
    onChange(next);
  }

  if (editable) {
    return (
      <div className="flex flex-wrap gap-2">
        {Object.entries(PONTOS_FORTES).map(([key, pf]) => {
          const isSelected = selected.includes(key);
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`${sizeClass} rounded-full font-semibold transition-all ${
                isSelected
                  ? 'text-white shadow-sm'
                  : 'text-gray-500 bg-gray-100 hover:bg-gray-200 opacity-50'
              }`}
              style={isSelected ? { backgroundColor: pf.color } : undefined}
              title={`${pf.name}: ${pf.description}`}
            >
              {key}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {selected.map(key => {
        const pf = PONTOS_FORTES[key as PontoForteKey];
        if (!pf) return null;
        return (
          <span
            key={key}
            className={`${sizeClass} rounded-full font-semibold text-white`}
            style={{ backgroundColor: pf.color }}
            title={`${pf.name}: ${pf.description}`}
          >
            {key}
          </span>
        );
      })}
    </div>
  );
}
