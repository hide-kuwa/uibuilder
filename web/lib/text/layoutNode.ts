import type { TextNode, TextStyle } from '@/types/editor';
import { splitGraphemes, measureWidth, computeLetterSpacing, calcLineHeight } from './measure';

export interface LaidOutRun {
  text: string;
  style: Partial<TextStyle> & { link?: string };
}
export interface LaidOutLine {
  x: number;
  y: number;
  width: number;
  runs: LaidOutRun[];
}
export interface TextLayout {
  lines: LaidOutLine[];
  box: { w: number; h: number };
}

interface Token {
  char: string;
  width: number;
  spacing: number;
  runStyle: Partial<TextStyle> & { link?: string };
}

export function layoutTextNode(node: TextNode, opts?: { dpr?: number }): TextLayout {
  const base = node.style;
  const lineHeight = calcLineHeight(base);
  const chars = splitGraphemes(node.text);
  const runs = (node.runs ?? []).slice().sort((a, b) => a.from - b.from);
  const tokens: Token[] = [];
  const emptyStyle: Partial<TextStyle> = {};
  let runIdx = 0;
  for (let i = 0; i < chars.length; i++) {
    while (runIdx < runs.length && i >= runs[runIdx].to) runIdx++;
    const run = runIdx < runs.length && i >= runs[runIdx].from ? runs[runIdx] : null;
    const runStyle = run ? run.style : emptyStyle;
    const merged: TextStyle = { ...base, ...runStyle } as TextStyle;
    const width = measureWidth(chars[i], merged);
    const spacing = computeLetterSpacing(merged);
    tokens.push({ char: chars[i], width, spacing, runStyle });
  }
  const maxWidth =
    node.resizeMode === 'AUTO_HEIGHT' || node.resizeMode === 'FIXED'
      ? node.props?.w ?? Infinity
      : Infinity;

  const lines: { tokens: Token[]; width: number }[] = [];
  let lineStart = 0;
  let lineWidth = 0;
  let lastBreak = -1;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.char === '\n') {
      finalize(lineStart, i);
      lineStart = i + 1;
      lineWidth = 0;
      lastBreak = -1;
      continue;
    }
    const adv = t.width + t.spacing;
    if (maxWidth !== Infinity && lineWidth + adv > maxWidth && i > lineStart) {
      const breakIdx = lastBreak >= lineStart ? lastBreak + 1 : i;
      finalize(lineStart, breakIdx);
      i = breakIdx - 1;
      lineStart = breakIdx;
      lineWidth = 0;
      lastBreak = -1;
      continue;
    }
    lineWidth += adv;
    if (/\s/.test(t.char)) lastBreak = i;
  }
  finalize(lineStart, tokens.length);

  function finalize(start: number, end: number) {
    const slice = tokens.slice(start, end);
    let width = 0;
    slice.forEach((tok, idx) => {
      width += tok.width;
      if (idx < slice.length - 1) width += tok.spacing;
    });
    lines.push({ tokens: slice, width });
  }

  const laidLines: LaidOutLine[] = [];
  lines.forEach((l, idx) => {
    const runsArr: LaidOutRun[] = [];
    if (l.tokens.length) {
      let current = l.tokens[0].runStyle;
      let txt = '';
      for (const tok of l.tokens) {
        if (tok.runStyle !== current) {
          runsArr.push({ text: txt, style: current });
          current = tok.runStyle;
          txt = tok.char;
        } else {
          txt += tok.char;
        }
      }
      runsArr.push({ text: txt, style: current });
    }
    laidLines.push({ x: 0, y: (idx + 1) * lineHeight, width: l.width, runs: runsArr });
  });

  let boxW: number;
  let boxH: number;
  if (node.resizeMode === 'AUTO_WIDTH') {
    boxW = lines[0]?.width ?? 0;
    boxH = lineHeight;
  } else if (node.resizeMode === 'AUTO_HEIGHT') {
    boxW = node.props?.w ?? Math.max(0, ...lines.map((l) => l.width));
    boxH = lines.length * lineHeight;
  } else if (node.resizeMode === 'FIXED') {
    boxW = node.props?.w ?? Math.max(0, ...lines.map((l) => l.width));
    boxH = node.props?.h ?? lines.length * lineHeight;
  } else {
    boxW = Math.max(0, ...lines.map((l) => l.width));
    boxH = lines.length * lineHeight;
  }

  const align = base.textAlign || 'left';
  laidLines.forEach((l) => {
    if (align === 'center') l.x = (boxW - l.width) / 2;
    else if (align === 'right') l.x = boxW - l.width;
    else l.x = 0; // left & justify minimal
  });

  return { lines: laidLines, box: { w: boxW, h: boxH } };
}
