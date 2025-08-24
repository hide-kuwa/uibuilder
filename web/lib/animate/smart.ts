/**
 * v11-2: Smart Animate (MVP)
 * - Interpolates x/y/scale/rotation/opacity between nodes with same id
 * - Unmatched nodes are treated as fade in/out
 * - Pure functions only, no dependencies
 */

export type Pose = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number; // deg
  opacity: number; // 0..1
};

export type PoseDiff = {
  id: string;
  from: Pose | null; // null = new (fade in)
  to: Pose | null; // null = removed (fade out)
};

const DEFAULT_POSE: Pose = {
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  opacity: 1,
};

/** Extract nodeId -> Pose map from a tree (best-effort guess). */
export function buildPoseMap(root: any): Record<string, Pose> {
  const map: Record<string, Pose> = {};
  traverse([root], (n: any) => {
    const id = n?.id;
    if (!id) return;
    const p = n?.props ?? {};
    const style = n?.style ?? {};
    const pose: Pose = {
      x: pickNum(p.x, style.left, 0),
      y: pickNum(p.y, style.top, 0),
      scaleX: pickNum(p.scaleX, style.scaleX, 1),
      scaleY: pickNum(p.scaleY, style.scaleY, 1),
      rotation: pickNum(p.rotation, style.rotate, 0),
      opacity: clamp01(pickNum(p.opacity, style.opacity, 1)),
    };
    map[id] = pose;
  });
  return map;
}

/** Build diff list from before/after pose maps. */
export function diffPoses(
  before: Record<string, Pose>,
  after: Record<string, Pose>
): PoseDiff[] {
  const ids = new Set([...Object.keys(before), ...Object.keys(after)]);
  const out: PoseDiff[] = [];
  ids.forEach((id) => {
    const a = before[id];
    const b = after[id];
    if (!a && b) out.push({ id, from: null, to: b });
    else if (a && !b) out.push({ id, from: a, to: null });
    else if (a && b) out.push({ id, from: a, to: b });
  });
  return out;
}

/** Simple ease (approximation of Bezier 0.2, 0, 0, 1). */
export function easeStandard(t: number) {
  return t * (2 - t);
}

/** Linear interpolation */
export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Interpolate between poses (null treated as fade). */
export function mixPose(from: Pose | null, to: Pose | null, t: number): Pose {
  if (!from && to) {
    return { ...to, opacity: to.opacity * t };
  }
  if (from && !to) {
    return { ...from, opacity: from.opacity * (1 - t) };
  }
  const A = from ?? DEFAULT_POSE;
  const B = to ?? DEFAULT_POSE;
  return {
    x: lerp(A.x, B.x, t),
    y: lerp(A.y, B.y, t),
    scaleX: lerp(A.scaleX, B.scaleX, t),
    scaleY: lerp(A.scaleY, B.scaleY, t),
    rotation: lerp(A.rotation, B.rotation, t),
    opacity: clamp01(lerp(A.opacity, B.opacity, t)),
  };
}

// ===== helpers =====
function traverse(nodes: any[], fn: (n: any) => void) {
  for (const n of nodes ?? []) {
    fn(n);
    const ch = (n as any)?.children;
    if (ch && Array.isArray(ch)) traverse(ch, fn);
  }
}

function pickNum(...vals: Array<any>): number {
  for (const v of vals) {
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return 0;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

