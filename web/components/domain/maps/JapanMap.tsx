'use client';
import { useState } from 'react';
import type { PrefCode } from './types';
import { PREF_PATHS } from './data/prefPaths';
import { PREF_LABELS, CAPITAL_LABELS } from './data/labels';

export type Visit = 'none'|'passed'|'visited'|'lived';

export type JapanMapProps = {
  values: Partial<Record<PrefCode, Visit>>;
  showLabels: boolean;
  labelKind: 'pref'|'capital'|'none';
  colors: { visited: string; lived: string; passed: string; none: string; stroke: string };
  strokeWidth: number;
  interactive: boolean;
  onChange?: (next: Partial<Record<PrefCode, Visit>>) => void;
  onHover?: (code: PrefCode | null) => void;
};

const CYCLE: Visit[] = ['none','passed','visited','lived'];

export default function JapanMap({
  values, showLabels, labelKind, colors, strokeWidth, interactive, onChange, onHover
}: JapanMapProps) {
  const [hover, setHover] = useState<PrefCode|null>(null);
  const nextOf = (v?: Visit) => CYCLE[(CYCLE.indexOf(v ?? 'none') + 1) % CYCLE.length];

  const handleClick = (code: PrefCode) => {
    if (!interactive || !onChange) return;
    const next = { ...values, [code]: nextOf(values[code]) };
    onChange(next);
  };

  const labels = labelKind === 'capital' ? CAPITAL_LABELS : PREF_LABELS;

  return (
    <svg viewBox="0 0 480 480" className="w-full h-auto select-none" aria-label="Japan map">
      <g>
        {(Object.keys(PREF_PATHS) as PrefCode[]).map((code) => {
          const d = PREF_PATHS[code];
          const st = values[code] ?? 'none';
          const fill = st === 'visited' ? colors.visited :
                       st === 'lived'   ? colors.lived   :
                       st === 'passed'  ? colors.passed  : colors.none;
          return (
            <path
              key={code}
              d={d}
              fill={fill}
              stroke={colors.stroke}
              strokeWidth={strokeWidth}
              role="button"
              aria-label={`${code}:${st}`}
              tabIndex={interactive ? 0 : -1}
              onClick={() => handleClick(code)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick(code)}
              onMouseEnter={() => { setHover(code); onHover?.(code); }}
              onMouseLeave={() => { setHover(null); onHover?.(null); }}
              className="transition-colors duration-100"
            />
          );
        })}
      </g>
      {showLabels && (
        <g fontSize="10" className="text-muted fill-current">
          {(Object.keys(labels) as PrefCode[]).map((code) => {
            const L = labels[code]; if (!L) return null;
            return <text key={code} x={L.x} y={L.y}>{L.name}</text>;
          })}
        </g>
      )}
    </svg>
  );
}
