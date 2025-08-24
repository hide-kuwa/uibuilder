/**
 * v12-2: Design Tokens 書き出し（色/タイポ/間隔）
 * 依存追加なし。Editor の現在ツリーを走査し、よく使う見た目属性から
 * colors / typography / spacing の簡易トークンを抽出する。
 */

export type Tokens = {
  colors: Record<string, string>; // e.g. { 'color-1': '#0ea5e9' }
  typography: {
    fonts: string[]; // unique family（引用符込み）
    fontSizes: number[]; // px
    lineHeights: number[]; // px
    letterSpacing: number[]; // px
    fontWeights: number[]; // numeric
  };
  spacing: {
    space: number[]; // px（gap/padding/margin/borderRadius から抽出）
  };
};

// ===== 抽出のメインAPI =====
export function extractTokensFromTree(tree: any[]): Tokens {
  const colors = new Set<string>();
  const fonts = new Set<string>();
  const fontSizes = new Set<number>();
  const lineHeights = new Set<number>();
  const letterSpacing = new Set<number>();
  const fontWeights = new Set<number>();
  const space = new Set<number>();

  traverse(tree, (n) => {
    const p = (n as any)?.props ?? {};
    const style = (n as any)?.style ?? {};

    // Colors
    for (const val of [
      p.fill,
      p.stroke,
      style.color,
      style.backgroundColor,
      style.borderColor,
      style.fill,
      style.stroke,
    ]) {
      const c = normalizeColor(val);
      if (c) colors.add(c);
    }

    // Typography
    const ff = style.fontFamily ?? p.fontFamily;
    if (typeof ff === 'string' && ff.trim()) {
      fonts.add(quoteIfNeeded(ff.trim()));
    }
    const fs = pickNum(style.fontSize, p.fontSize);
    if (isFiniteNum(fs)) fontSizes.add(round1(fs));
    const lh = normalizeLineHeight(style.lineHeight ?? p.lineHeight);
    if (isFiniteNum(lh)) lineHeights.add(round1(lh));
    const ls = normalizeLetterSpacing(style.letterSpacing ?? p.letterSpacing);
    if (isFiniteNum(ls)) letterSpacing.add(round2(ls));
    const fw = pickNum(style.fontWeight, p.fontWeight);
    if (isFiniteNum(fw)) fontWeights.add(Math.round(fw));

    // Spacing（px換算して集約）
    const spacingCandidates = [
      style.gap,
      style.rowGap,
      style.columnGap,
      style.padding,
      style.paddingTop,
      style.paddingRight,
      style.paddingBottom,
      style.paddingLeft,
      style.margin,
      style.marginTop,
      style.marginRight,
      style.marginBottom,
      style.marginLeft,
      style.borderRadius,
      style.borderTopLeftRadius,
      style.borderTopRightRadius,
      style.borderBottomRightRadius,
      style.borderBottomLeftRadius,
      p.radius,
    ];
    spacingCandidates.forEach((v) => {
      const px = toPx(v);
      if (isFiniteNum(px)) space.add(round1(px));
    });
  });

  // 並び替え・整形
  const colorMap = buildSequentialMap([...colors].sort(hexSort), 'color');
  const tokens: Tokens = {
    colors: colorMap,
    typography: {
      fonts: [...fonts].sort(),
      fontSizes: sortNum([...fontSizes]),
      lineHeights: sortNum([...lineHeights]),
      letterSpacing: sortNum([...letterSpacing]),
      fontWeights: sortNum([...fontWeights]),
    },
    spacing: {
      space: sortNum([...space]),
    },
  };
  return tokens;
}

// ===== 書き出し（JSON / TS） =====
export function tokensToJSON(tokens: Tokens): string {
  return JSON.stringify(tokens, null, 2);
}

export function tokensToTS(tokens: Tokens, exportName = 'tokens'): string {
  return `/* eslint-disable */\n` +
    `// v12-2: Generated Design Tokens\n` +
    `export type Tokens = {\n` +
    `  colors: Record<string, string>\n` +
    `  typography: { fonts: string[]; fontSizes: number[]; lineHeights: number[]; letterSpacing: number[]; fontWeights: number[] }\n` +
    `  spacing: { space: number[] }\n` +
    `}\n\n` +
    `export const ${exportName} = ${JSON.stringify(tokens, null, 2)} as const;\n`;
}

// ===== Utils =====
function traverse(nodes: any[], fn: (n: any) => void) {
  for (const n of nodes ?? []) {
    fn(n);
    const ch = (n as any)?.children;
    if (ch && Array.isArray(ch)) traverse(ch, fn);
  }
}

function isFiniteNum(n: any): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}
function pickNum(...vals: any[]): number | undefined {
  for (const v of vals) {
    const x = Number(v);
    if (!Number.isNaN(x)) return x;
  }
  return undefined;
}
function round1(n: number) {
  return Math.round(n * 10) / 10;
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}
function sortNum(arr: number[]) {
  return arr.sort((a, b) => a - b);
}

// 色正規化: rgb/rgba/hsl/HEX を HEX #rrggbb に寄せる（簡易）
function normalizeColor(v: any): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  // #RGB / #RRGGBB
  if (/^#([0-9a-f]{3})$/i.test(s)) {
    const m = s.slice(1);
    return `#${m[0]}${m[0]}${m[1]}${m[1]}${m[2]}${m[2]}`.toLowerCase();
  }
  if (/^#([0-9a-f]{6})$/i.test(s)) return s.toLowerCase();
  // rgb / rgba
  const rgb = s.match(/^rgba?\((\s*\d+\s*),(\s*\d+\s*),(\s*\d+\s*)(?:,\s*[\d.]+\s*)?\)$/i);
  if (rgb) {
    const r = clamp255(Number(rgb[1]));
    const g = clamp255(Number(rgb[2]));
    const b = clamp255(Number(rgb[3]));
    return toHex(r, g, b);
  }
  // hsl（簡易: 近似→Canvasを使わずに概算は難しいので未対応）
  return null;
}
function clamp255(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}
function toHex(r: number, g: number, b: number) {
  return (
    '#' +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
      .toLowerCase()
  );
}
function hexSort(a: string, b: string) {
  return a.localeCompare(b);
}
function buildSequentialMap(values: string[], prefix: string) {
  const out: Record<string, string> = {};
  values.forEach((v, i) => (out[`${prefix}-${i + 1}`] = v));
  return out;
}
function quoteIfNeeded(family: string) {
  // 既に "..." or '...' ならそのまま。スペースを含む場合は "" で包む。
  if (/^["'].+["']$/.test(family)) return family;
  if (/\s/.test(family)) return `"${family}"`;
  return family;
}
function normalizeLineHeight(v: any): number | undefined {
  if (v == null) return undefined;
  // number → pxとみなす
  if (typeof v === 'number') return v;
  const s = String(v).trim();
  if (/^\d+(\.\d+)?px$/.test(s)) return Number(s.replace('px', ''));
  if (/^\d+(\.\d+)?$/.test(s)) return Number(s); // 単位なし（倍率ではなくpx想定）
  return undefined;
}
function normalizeLetterSpacing(v: any): number | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  if (/^\d+(\.\d+)?px$/.test(s)) return Number(s.replace('px', ''));
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return undefined;
}
function toPx(v: any): number | undefined {
  if (v == null) return undefined;
  if (typeof v === 'number') return v;
  const s = String(v).trim();
  if (/^-?\d+(\.\d+)?px$/.test(s)) return Number(s.replace('px', ''));
  // rem/em は簡易換算（1rem=16px/1em=16px と仮定）
  if (/^-?\d+(\.\d+)?rem$/.test(s)) return Number(s.replace('rem', '')) * 16;
  if (/^-?\d+(\.\d+)?em$/.test(s)) return Number(s.replace('em', '')) * 16;
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return undefined;
}
