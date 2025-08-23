import type { PathNode, PathPoint } from "@/types/editor";
import { flattenCubic } from "./bezier";

export interface Polyline {
  points: { x: number; y: number }[];
  closed: boolean;
}

const EPS = 1e-3;

function distToSeg(p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) {
  const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const x = a.x + t * (b.x - a.x);
  const y = a.y + t * (b.y - a.y);
  return Math.hypot(p.x - x, p.y - y);
}

function rdp(points: { x: number; y: number }[], eps: number): { x: number; y: number }[] {
  if (points.length <= 2) return points.slice();
  let dmax = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = distToSeg(points[i], points[0], points[points.length - 1]);
    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }
  if (dmax > eps) {
    const rec1 = rdp(points.slice(0, index + 1), eps);
    const rec2 = rdp(points.slice(index), eps);
    return rec1.slice(0, -1).concat(rec2);
  } else {
    return [points[0], points[points.length - 1]];
  }
}

function area(pts: { x: number; y: number }[]) {
  let a = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    a += (pts[j].x - pts[i].x) * (pts[j].y + pts[i].y);
  }
  return a / 2;
}

function toPoint(p: PathPoint) {
  return { x: p.x, y: p.y };
}

export function flattenPath(path: PathNode, flatness = 0.5): Polyline[] {
  const src = path.subpaths && path.subpaths.length ? path.subpaths : [path.points];
  const result: Polyline[] = [];
  for (const sub of src) {
    if (!sub.length) continue;
    const poly: { x: number; y: number }[] = [];
    const push = (pt: { x: number; y: number }) => {
      const last = poly[poly.length - 1];
      if (!last || Math.hypot(last.x - pt.x, last.y - pt.y) > EPS) poly.push(pt);
    };
    let prev = sub[0];
    push(toPoint(prev));
    for (let i = 1; i < sub.length; i++) {
      const curr = sub[i];
      if (prev.out || curr.in) {
        const seg = flattenCubic(toPoint(prev), toPoint(prev.out || prev), toPoint(curr.in || curr), toPoint(curr), flatness);
        seg.slice(1).forEach(push);
      } else {
        push(toPoint(curr));
      }
      prev = curr;
    }
    if (path.closed) {
      const first = sub[0];
      const last = sub[sub.length - 1];
      if (last.out || first.in) {
        const seg = flattenCubic(toPoint(last), toPoint(last.out || last), toPoint(first.in || first), toPoint(first), flatness);
        seg.slice(1).forEach(push);
      } else {
        push(toPoint(first));
      }
    }
    if (poly.length < 3) continue;
    // simplify and orient
    const simplified = rdp(poly, Math.min(flatness, 0.5));
    const ar = area(simplified);
    if (ar < 0) simplified.reverse();
    result.push({ points: simplified, closed: true });
  }
  return result;
}
