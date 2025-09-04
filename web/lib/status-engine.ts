// web/lib/status-engine.ts
import type { NodeStatus, StatusConfig, OverlayConfig } from '@/types/status';
import { DEFAULT_STATUS_CONFIG } from '@/types/status';

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return { r, g, b };
  }
  const num = parseInt(h, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('');
}

function blendHex(baseHex: string, overHex: string, alpha: number) {
  const b = hexToRgb(baseHex);
  const o = hexToRgb(overHex);
  const r = Math.round((1 - alpha) * b.r + alpha * o.r);
  const g = Math.round((1 - alpha) * b.g + alpha * o.g);
  const bl = Math.round((1 - alpha) * b.b + alpha * o.b);
  return rgbToHex(r, g, bl);
}

export function computeBgColor(
  status: NodeStatus,
  cfg: StatusConfig = DEFAULT_STATUS_CONFIG,
) {
  let base = cfg.base[status.base].color;
  const glows: { color: string }[] = [];
  let filter = '';
  const overlays = [...status.overlays];
  const ordered =
    cfg.compose.order === 'priority'
      ? overlays.sort((a, b) => {
          const pa = cfg.overlays.find((o) => o.key === a)?.priority ?? 0;
          const pb = cfg.overlays.find((o) => o.key === b)?.priority ?? 0;
          return pb - pa;
        })
      : overlays;

  ordered.forEach((key) => {
    const oc = cfg.overlays.find((o) => o.key === key);
    if (!oc) return;
    base = applyOverlay(base, oc, glows);
  });

  if (glows.length) {
    // drop-shadow を積む
    filter = glows
      .map((g, i) => `drop-shadow(0 0 ${6 + i * 6}px ${g.color})`)
      .join(' ');
  }
  return { bg: base, filter, glow: glows };
}

function applyOverlay(baseHex: string, oc: OverlayConfig, glows: { color: string }[]) {
  switch (oc.mode) {
    case 'override':
      return oc.color;
    case 'blend':
      return blendHex(baseHex, oc.color, 0.45);
    case 'glow':
      glows.push({ color: oc.color });
      // 視認性のために少しだけブレンド
      return blendHex(baseHex, oc.color, 0.25);
    default:
      return baseHex;
  }
}

export function buildMotionFromStatus(status: NodeStatus, cfg: StatusConfig) {
  const overlays = status.overlays
    .map((k) => cfg.overlays.find((o) => o.key === k))
    .filter(Boolean) as OverlayConfig[];
  const hasGlow = overlays.some((o) => o.mode === 'glow');
  if (!hasGlow) return undefined;
  // anime.js 用：軽い鼓動
  return {
    scale: [1, 1.03],
    duration: 1200,
    direction: 'alternate' as const,
    easing: 'easeInOutSine' as const,
    loop: true,
  };
}

