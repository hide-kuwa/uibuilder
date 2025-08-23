export type BooleanOp = 'UNION' | 'SUBTRACT' | 'INTERSECT' | 'EXCLUDE';
export interface Ring {
  points: { x: number; y: number }[];
  outer: boolean;
}
export interface Polyline {
  points: { x: number; y: number }[];
  closed: boolean;
}

class Vertex {
  x: number;
  y: number;
  next: Vertex | null = null;
  prev: Vertex | null = null;
  _corresponding: Vertex | null = null;
  _distance = 0;
  _isEntry = true;
  _isIntersection = false;
  _visited = false;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  static from(p: { x: number; y: number }) {
    return new Vertex(p.x, p.y);
  }
  static createIntersection(x: number, y: number, dist: number) {
    const v = new Vertex(x, y);
    v._distance = dist;
    v._isIntersection = true;
    v._isEntry = false;
    return v;
  }
  equals(v: Vertex) {
    return this.x === v.x && this.y === v.y;
  }
  visit() {
    this._visited = true;
    if (this._corresponding && !this._corresponding._visited) {
      this._corresponding.visit();
    }
  }
  isInside(poly: Polygon) {
    let odd = false;
    let v = poly.first!;
    let n = v.next!;
    const x = this.x;
    const y = this.y;
    do {
      if (((v.y < y && n.y >= y) || (n.y < y && v.y >= y)) && (v.x <= x || n.x <= x)) {
        odd ^= v.x + ((y - v.y) / (n.y - v.y)) * (n.x - v.x) < x;
      }
      v = n;
      n = v.next!;
    } while (!v.equals(poly.first!));
    return odd;
  }
}

class Intersection {
  x = 0;
  y = 0;
  toSource = 0;
  toClip = 0;
  constructor(s1: Vertex, s2: Vertex, c1: Vertex, c2: Vertex) {
    const d = (c2.y - c1.y) * (s2.x - s1.x) - (c2.x - c1.x) * (s2.y - s1.y);
    if (d === 0) return;
    this.toSource = ((c2.x - c1.x) * (s1.y - c1.y) - (c2.y - c1.y) * (s1.x - c1.x)) / d;
    this.toClip = ((s2.x - s1.x) * (s1.y - c1.y) - (s2.y - s1.y) * (s1.x - c1.x)) / d;
    if (this.valid()) {
      this.x = s1.x + this.toSource * (s2.x - s1.x);
      this.y = s1.y + this.toSource * (s2.y - s1.y);
    }
  }
  valid() {
    return this.toSource > 0 && this.toSource < 1 && this.toClip > 0 && this.toClip < 1;
  }
}

class Polygon {
  first: Vertex | null = null;
  vertices = 0;
  _firstIntersect: Vertex | null = null;
  _lastUnprocessed: Vertex | null = null;
  constructor(points: { x: number; y: number }[]) {
    points.forEach((p) => this.addVertex(Vertex.from(p)));
  }
  addVertex(v: Vertex) {
    if (!this.first) {
      this.first = v;
      v.next = v.prev = v;
    } else {
      const n = this.first;
      const p = n.prev!;
      n.prev = v;
      v.next = n;
      v.prev = p;
      p.next = v;
    }
    this.vertices++;
  }
  insertVertex(v: Vertex, start: Vertex, end: Vertex) {
    let c = start;
    while (!c.equals(end) && c._distance < v._distance) c = c.next!;
    v.next = c;
    const p = c.prev!;
    v.prev = p;
    p.next = v;
    c.prev = v;
    this.vertices++;
  }
  getNext(v: Vertex) {
    let c = v;
    while (c._isIntersection) c = c.next!;
    return c;
  }
  getFirstIntersect() {
    let v = this._firstIntersect || this.first!;
    do {
      if (v._isIntersection && !v._visited) break;
      v = v.next!;
    } while (!v.equals(this.first!));
    this._firstIntersect = v;
    return v;
  }
  hasUnprocessed() {
    let v = this._lastUnprocessed || this.first!;
    do {
      if (v._isIntersection && !v._visited) {
        this._lastUnprocessed = v;
        return true;
      }
      v = v.next!;
    } while (!v.equals(this.first!));
    return false;
  }
  getPoints() {
    const pts: { x: number; y: number }[] = [];
    let v = this.first!;
    do {
      pts.push({ x: v.x, y: v.y });
      v = v.next!;
    } while (!v.equals(this.first!));
    return pts;
  }
  clip(clip: Polygon, sourceForwards: boolean, clipForwards: boolean) {
    let s = this.first!;
    let c = clip.first!;
    do {
      if (!s._isIntersection) {
        do {
          if (!c._isIntersection) {
            const inter = new Intersection(s, this.getNext(s.next!), c, clip.getNext(c.next!));
            if (inter.valid()) {
              const si = Vertex.createIntersection(inter.x, inter.y, inter.toSource);
              const ci = Vertex.createIntersection(inter.x, inter.y, inter.toClip);
              si._corresponding = ci;
              ci._corresponding = si;
              this.insertVertex(si, s, this.getNext(s.next!));
              clip.insertVertex(ci, c, clip.getNext(c.next!));
            }
          }
          c = c.next!;
        } while (!c.equals(clip.first!));
      }
      s = s.next!;
    } while (!s.equals(this.first!));

    s = this.first!;
    c = clip.first!;
    let sInC = s.isInside(clip);
    let cInS = c.isInside(this);
    sourceForwards = sourceForwards ? !sInC : sInC;
    clipForwards = clipForwards ? !cInS : cInS;
    do {
      if (s._isIntersection) {
        s._isEntry = sourceForwards;
        sourceForwards = !sourceForwards;
      }
      s = s.next!;
    } while (!s.equals(this.first!));
    do {
      if (c._isIntersection) {
        c._isEntry = clipForwards;
        clipForwards = !clipForwards;
      }
      c = c.next!;
    } while (!c.equals(clip.first!));

    const list: { x: number; y: number }[][] = [];
    while (this.hasUnprocessed()) {
      let current = this.getFirstIntersect();
      const clipped = new Polygon([]);
      clipped.addVertex(new Vertex(current.x, current.y));
      do {
        current.visit();
        if (current._isEntry) {
          do {
            current = current.next!;
            clipped.addVertex(new Vertex(current.x, current.y));
          } while (!current._isIntersection);
        } else {
          do {
            current = current.prev!;
            clipped.addVertex(new Vertex(current.x, current.y));
          } while (!current._isIntersection);
        }
        current = current._corresponding!;
      } while (!current._visited);
      list.push(clipped.getPoints());
    }
    if (list.length === 0) {
      if (!sourceForwards && !clipForwards) {
        if (sInC) list.push(clip.getPoints());
        else if (cInS) list.push(this.getPoints());
        else list.push(this.getPoints(), clip.getPoints());
      } else if (sourceForwards && clipForwards) {
        if (sInC) list.push(this.getPoints());
        else if (cInS) list.push(clip.getPoints());
      } else {
        if (sInC) list.push(clip.getPoints(), this.getPoints());
        else if (cInS) list.push(this.getPoints(), clip.getPoints());
        else list.push(this.getPoints());
      }
      if (list.length === 0) return null;
    }
    return list;
  }
}

function polyArea(pts: { x: number; y: number }[]) {
  let a = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    a += (pts[j].x - pts[i].x) * (pts[j].y + pts[i].y);
  }
  return a / 2;
}

function clipBoolean(A: { x: number; y: number }[], B: { x: number; y: number }[], eA: boolean, eB: boolean) {
  const source = new Polygon(A);
  const clip = new Polygon(B);
  return source.clip(clip, eA, eB);
}

export function booleanCombine(op: BooleanOp, A: Polyline[], B: Polyline[]): Ring[] {
  if (!A.length || !B.length) return [];
  const polyA = A[0].points;
  const polyB = B[0].points;
  let res: { x: number; y: number }[][] | null = null;
  if (op === 'UNION') res = clipBoolean(polyA, polyB, false, false);
  else if (op === 'SUBTRACT') res = clipBoolean(polyA, polyB, false, true);
  else if (op === 'INTERSECT') res = clipBoolean(polyA, polyB, true, true);
  else if (op === 'EXCLUDE') {
    const ab = clipBoolean(polyA, polyB, false, true) || [];
    const ba = clipBoolean(polyB, polyA, false, true) || [];
    res = ab.concat(ba);
  }
  if (!res) return [];
  return res.map((pts) => {
    const area = polyArea(pts);
    return { points: pts, outer: area > 0 };
  });
}
