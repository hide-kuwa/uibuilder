import type { TextStyle } from '@/types/editor';

const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : ({} as any);
const ctx = canvas.getContext ? canvas.getContext('2d')! : null as any;

export function measure(text: string, style: TextStyle, opts?: { maxWidth?: number }) {
  if (!ctx) return { width: 0, height: 0, lineHeight: style.fontSize };
  ctx.font = `${style.fontWeight || 400} ${style.fontSize}px ${style.fontFamily}`;
  const lineHeight = style.lineHeight === 'AUTO'
    ? style.fontSize * 1.3
    : style.lineHeight?.px || style.fontSize * 1.3;
  const maxWidth = opts?.maxWidth;
  const lines: string[] = [];
  if (maxWidth) {
    let current = '';
    for (const ch of text) {
      const test = current + ch;
      if (ctx.measureText(test).width > maxWidth && current !== '') {
        lines.push(current);
        current = ch;
      } else {
        current = test;
      }
      if (ch === '\n') {
        lines.push(current.slice(0, -1));
        current = '';
      }
    }
    if (current) lines.push(current);
  } else {
    lines.push(...text.split('\n'));
  }
  let width = 0;
  for (const l of lines) {
    width = Math.max(width, ctx.measureText(l).width);
  }
  const height = lines.length * lineHeight;
  return { width, height, lineHeight };
}
