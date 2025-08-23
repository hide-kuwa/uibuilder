export interface Point { x: number; y: number }

export function evalCubic(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  t: number
): Point {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  return {
    x:
      mt2 * mt * p0.x +
      3 * mt2 * t * p1.x +
      3 * mt * t2 * p2.x +
      t2 * t * p3.x,
    y:
      mt2 * mt * p0.y +
      3 * mt2 * t * p1.y +
      3 * mt * t2 * p2.y +
      t2 * t * p3.y,
  };
}

export function reflectHandle(anchor: Point, h: Point): Point {
  return { x: 2 * anchor.x - h.x, y: 2 * anchor.y - h.y };
}

export function angleSnap(dx: number, dy: number): Point {
  const len = Math.hypot(dx, dy);
  if (len === 0) return { x: 0, y: 0 };
  const step = Math.PI / 4;
  const ang = Math.atan2(dy, dx);
  const snap = Math.round(ang / step) * step;
  return { x: len * Math.cos(snap), y: len * Math.sin(snap) };
}

function flatEnough(p0: Point, p1: Point, p2: Point, p3: Point, f: number) {
  const ux = 3 * p1.x - 2 * p0.x - p3.x;
  const uy = 3 * p1.y - 2 * p0.y - p3.y;
  const vx = 3 * p2.x - 2 * p3.x - p0.x;
  const vy = 3 * p2.y - 2 * p3.y - p0.y;
  return Math.max(ux * ux + uy * uy, vx * vx + vy * vy) <= f * f;
}

export function flattenCubic(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  flatness = 0.5
): Point[] {
  if (flatEnough(p0, p1, p2, p3, flatness)) return [p0, p3];
  const a = lerpPoint(p0, p1, 0.5);
  const b = lerpPoint(p1, p2, 0.5);
  const c = lerpPoint(p2, p3, 0.5);
  const d = lerpPoint(a, b, 0.5);
  const e = lerpPoint(b, c, 0.5);
  const f = lerpPoint(d, e, 0.5);
  return [
    ...flattenCubic(p0, a, d, f, flatness),
    ...flattenCubic(f, e, c, p3, flatness).slice(1),
  ];
}

function lerpPoint(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}
