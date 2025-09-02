'use client';
import type { PrefCode } from '../types';
export function PrefShape({
  code, d, fill, stroke, strokeWidth, onClick, onEnter, onLeave,
}: {
  code: PrefCode; d: string; fill: string; stroke: string; strokeWidth: number;
  onClick?: (c: PrefCode)=>void; onEnter?: (c: PrefCode)=>void; onLeave?: ()=>void;
}) {
  if (!d) return null;
  return (
    <path
      d={d}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      onClick={() => onClick?.(code)}
      onMouseEnter={() => onEnter?.(code)}
      onMouseLeave={() => onLeave?.()}
      className="transition-colors duration-100"
    />
  );
}
