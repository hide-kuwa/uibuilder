import { layoutTextNode } from '../text/layoutNode';
import type { TextNode, TextStyle } from '@/types/editor';
import { splitGraphemes, measureWidth, computeLetterSpacing, calcLineHeight } from '../text/measure';

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function applyStyle(base: TextStyle, run: Partial<TextStyle> & { link?: string }) {
  return { ...base, ...run } as TextStyle & { link?: string };
}

export function renderTextToCanvas(node: TextNode, opts?: { dpr?: number }): HTMLCanvasElement {
  const layout = layoutTextNode(node, opts);
  const dpr = opts?.dpr ?? 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(layout.box.w * dpr);
  canvas.height = Math.ceil(layout.box.h * dpr);
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);
  ctx.textBaseline = 'alphabetic';
  layout.lines.forEach((line) => {
    let penX = line.x;
    line.runs.forEach((run) => {
      const { link, ...stylePart } = run.style as any;
      const style = applyStyle(node.style, stylePart);
      const ls = computeLetterSpacing(style);
      ctx.font = `${style.italic ? 'italic ' : ''}${style.fontWeight || 400} ${style.fontSize}px ${style.fontFamily}`;
      ctx.fillStyle = style.color || '#000';
      const chars = splitGraphemes(style.uppercase ? run.text.toUpperCase() : run.text);
      const startX = penX;
      chars.forEach((ch, i) => {
        ctx.fillText(ch, penX, line.y);
        const w = measureWidth(ch, style);
        penX += w;
        if (i < chars.length - 1) penX += ls;
      });
      const runWidth = penX - startX;
      const decoThickness = style.fontSize * 0.06;
      const underline = style.underline || link;
      if (underline) {
        ctx.fillRect(startX, line.y + decoThickness, runWidth, decoThickness);
      }
      if (style.strike) {
        ctx.fillRect(startX, line.y - style.fontSize / 3, runWidth, decoThickness);
      }
    });
  });
  return canvas;
}

function runStyleToCss(style: TextStyle, isSvg = false) {
  const ls = computeLetterSpacing(style);
  const deco: string[] = [];
  if (style.underline) deco.push('underline');
  if (style.strike) deco.push('line-through');
  const props: string[] = [];
  props.push(`font-family:${style.fontFamily}`);
  props.push(`font-size:${style.fontSize}px`);
  if (style.fontWeight) props.push(`font-weight:${style.fontWeight}`);
  if (style.italic) props.push('font-style:italic');
  if (style.color) props.push(`${isSvg ? 'fill' : 'color'}:${style.color}`);
  if (ls) props.push(`letter-spacing:${ls}px`);
  if (deco.length) props.push(`text-decoration:${deco.join(' ')}`);
  return props.join(';');
}

export function renderTextToSVG(node: TextNode, opts?: { dpr?: number }): string {
  const layout = layoutTextNode(node, opts);
  const lines = layout.lines
    .map((line) => {
      const runs = line.runs
        .map((run) => {
          const { link, ...stylePart } = run.style as any;
          const style = applyStyle(node.style, stylePart);
          const css = runStyleToCss(style, true);
          const content = escapeHtml(style.uppercase ? run.text.toUpperCase() : run.text);
          const tspan = `<tspan style="${css}">${content}</tspan>`;
          return link
            ? `<a href="${link}" target="_blank" rel="noopener">${tspan}</a>`
            : tspan;
        })
        .join('');
      return `<tspan x="${line.x}" y="${line.y}">${runs}</tspan>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.box.w}" height="${layout.box.h}"><text>${lines}</text></svg>`;
}

export function renderTextToHTML(node: TextNode, opts?: { dpr?: number }): string {
  const layout = layoutTextNode(node, opts);
  const lineHeight = calcLineHeight(node.style);
  const lines = layout.lines
    .map((line) => {
      const runs = line.runs
        .map((run) => {
          const { link, ...stylePart } = run.style as any;
          const style = applyStyle(node.style, stylePart);
          const css = runStyleToCss(style);
          const content = escapeHtml(style.uppercase ? run.text.toUpperCase() : run.text);
          const span = `<span style="${css};white-space:pre">${content}</span>`;
          return link
            ? `<a href="${link}" target="_blank" rel="noopener">${span}</a>`
            : span;
        })
        .join('');
      const top = line.y - lineHeight + (lineHeight - node.style.fontSize);
      return `<div class="line" style="position:absolute;left:${line.x}px;top:${top}px">${runs}</div>`;
    })
    .join('');
  return `<div style="position:relative;width:${layout.box.w}px;height:${layout.box.h}px;overflow:hidden">${lines}</div>`;
}

function objToJsx(style: Record<string, any>) {
  const entries = Object.entries(style).filter(([, v]) => v !== undefined);
  return `{${entries
    .map(([k, v]) => `${k}:${typeof v === 'number' ? v : `'${v}'`}`)
    .join(',')}}`;
}

export function renderTextToReact(node: TextNode, opts?: { dpr?: number }): string {
  const layout = layoutTextNode(node, opts);
  const lineHeight = calcLineHeight(node.style);
  const lines = layout.lines
    .map((line) => {
      const runs = line.runs
        .map((run) => {
          const { link, ...stylePart } = run.style as any;
          const style = applyStyle(node.style, stylePart);
          const ls = computeLetterSpacing(style);
          const deco: string[] = [];
          if (style.underline) deco.push('underline');
          if (style.strike) deco.push('line-through');
          const styleObj: Record<string, any> = {
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            fontStyle: style.italic ? 'italic' : undefined,
            color: style.color,
            letterSpacing: ls ? `${ls}px` : undefined,
            textDecoration: deco.length ? deco.join(' ') : undefined,
            whiteSpace: 'pre',
          };
          const content = escapeHtml(style.uppercase ? run.text.toUpperCase() : run.text);
          const span = `<span style=${objToJsx(styleObj)}>${content}</span>`;
          return link
            ? `<a href="${link}" target="_blank" rel="noopener">${span}</a>`
            : span;
        })
        .join('');
      const top = line.y - lineHeight + (lineHeight - node.style.fontSize);
      const styleObj = {
        position: 'absolute',
        left: line.x,
        top,
      } as Record<string, any>;
      return `<div style=${objToJsx(styleObj)}>${runs}</div>`;
    })
    .join('');
  const containerStyle = objToJsx({
    position: 'relative',
    width: layout.box.w,
    height: layout.box.h,
    overflow: 'hidden',
  });
  return `<div style=${containerStyle}>${lines}</div>`;
}
