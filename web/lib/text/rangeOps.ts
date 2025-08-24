import type { TextRun, TextStyle } from '@/types/editor';

function cleanStyle(style: Partial<TextStyle> & { link?: string }): Partial<TextStyle> & { link?: string } {
  const s: any = { ...style };
  Object.keys(s).forEach((k) => {
    const v = (s as any)[k];
    if (v === undefined || v === false) delete (s as any)[k];
  });
  return s;
}

function stylesEqual(a: Partial<TextStyle> & { link?: string }, b: Partial<TextStyle> & { link?: string }) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function removeRun(
  runs: TextRun[] | undefined,
  from: number,
  to: number,
  keys: (keyof TextStyle | 'link')[],
): TextRun[] {
  if (!runs || runs.length === 0) return [];
  const res: TextRun[] = [];
  for (const r of runs) {
    if (r.to <= from || r.from >= to) {
      res.push({ ...r });
      continue;
    }
    if (r.from < from) {
      res.push({ from: r.from, to: from, style: { ...r.style } });
    }
    const midFrom = Math.max(r.from, from);
    const midTo = Math.min(r.to, to);
    const newStyle = { ...r.style } as any;
    for (const k of keys) delete newStyle[k];
    const cleaned = cleanStyle(newStyle);
    if (Object.keys(cleaned).length) {
      res.push({ from: midFrom, to: midTo, style: cleaned });
    }
    if (r.to > to) {
      res.push({ from: to, to: r.to, style: { ...r.style } });
    }
  }
  res.sort((a, b) => a.from - b.from);
  const merged: TextRun[] = [];
  for (const r of res) {
    const last = merged[merged.length - 1];
    if (last && last.to === r.from && stylesEqual(last.style, r.style)) {
      last.to = r.to;
    } else {
      merged.push({ ...r });
    }
  }
  return merged;
}

export function applyRun(
  runs: TextRun[] | undefined,
  from: number,
  to: number,
  style: Partial<TextStyle> & { link?: string },
): TextRun[] {
  const keys = Object.keys(style) as (keyof TextStyle | 'link')[];
  let res = removeRun(runs, from, to, keys);
  res.push({ from, to, style: cleanStyle(style) });
  res.sort((a, b) => a.from - b.from);
  const merged: TextRun[] = [];
  for (const r of res) {
    const last = merged[merged.length - 1];
    if (last && last.to === r.from && stylesEqual(last.style, r.style)) {
      last.to = r.to;
    } else {
      merged.push({ ...r });
    }
  }
  return merged;
}
