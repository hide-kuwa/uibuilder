'use client';
import { useState } from 'react';
import { PREF_PATHS } from './data/prefPaths';
import { PREF_LABELS, CAPITAL_LABELS } from './data/labels';
import { PrefShape } from './components/PrefShape';
import { colorOf } from './utils/color';
import type { PrefCode, VisitStatus, JapanMapProps } from './types';

const CYCLE: VisitStatus[] = ['none','passed','visited','lived'];

export function JapanMap(props: JapanMapProps) {
  const { values, showLabels, palette, strokeWidth, labelKind, onChange, onHover, getFill, onPrefClick, className, svgProps } = props
  const [hover, setHover] = useState<PrefCode | null>(null);
  const nextOf = (v?: VisitStatus) => CYCLE[(CYCLE.indexOf(v ?? 'none') + 1) % CYCLE.length];

  const handleClick = (code: PrefCode) => {
    if (!onChange) return;
    const next = { ...values, [code]: nextOf(values[code]) };
    onChange(next);
  };

  const labels = labelKind === 'capital' ? CAPITAL_LABELS : PREF_LABELS;

  return (
    <svg
      viewBox="0 0 480 480"
      className={["w-full h-auto select-none", className].filter(Boolean).join(' ')}
      {...svgProps}
    >
      <g>
        {(Object.keys(PREF_PATHS) as PrefCode[]).map((code) => {
          const d = PREF_PATHS[code];
          const fill = getFill ? getFill(code) : colorOf(values[code], palette)
          return (
            <PrefShape
              key={code}
              code={code}
              d={d}
              fill={fill}
              stroke={palette.stroke}
              strokeWidth={strokeWidth}
              onClick={onPrefClick ?? handleClick}
              onEnter={(c) => { setHover(c); onHover?.(c); }}
              onLeave={() => { setHover(null); onHover?.(null); }}
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
