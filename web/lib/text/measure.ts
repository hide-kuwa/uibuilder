import type { TextStyle } from '@/types/editor';

const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : ({} as any);
const ctx = canvas.getContext ? canvas.getContext('2d')! : null as any;

let segmenter: Intl.Segmenter | null = null;
if (typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
  segmenter = new (Intl as any).Segmenter(undefined, { granularity: 'grapheme' });
}

export function splitGraphemes(text: string): string[] {
  if (segmenter) {
    return Array.from(segmenter.segment(text), (s: any) => s.segment);
  }
  return Array.from(text);
}

export function computeLetterSpacing(style: TextStyle): number {
  const ls = style.letterSpacing;
  if (!ls) return 0;
  return ls.unit === 'PX' ? ls.value : style.fontSize * (ls.value / 100);
}

export function calcLineHeight(style: TextStyle): number {
  return style.lineHeight === 'AUTO'
    ? style.fontSize * 1.3
    : style.lineHeight?.px || style.fontSize * 1.3;
}

export function measureWidth(text: string, style: TextStyle): number {
  if (!ctx) return text.length * style.fontSize;
  ctx.font = `${style.italic ? 'italic ' : ''}${style.fontWeight || 400} ${style.fontSize}px ${style.fontFamily}`;
  return ctx.measureText(text).width;
}
