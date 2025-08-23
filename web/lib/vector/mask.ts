import type { FrameNode, PathNode, PathPoint } from "@/types/editor";

const SVG_NS = "http://www.w3.org/2000/svg";

// Ensure a <defs> container exists on the root svg for mask elements
export function ensureMaskDefs(rootSvg: SVGSVGElement): SVGDefsElement {
  let defs = rootSvg.querySelector<SVGDefsElement>("defs[data-mask-defs]");
  if (!defs) {
    defs = rootSvg.ownerDocument.createElementNS(SVG_NS, "defs");
    defs.setAttribute("data-mask-defs", "1");
    rootSvg.insertBefore(defs, rootSvg.firstChild);
  }
  return defs;
}

// Generate a unique mask id for a given node
export function makeMaskId(nodeId: string): string {
  return `mask-${nodeId}`;
}

function areMirrored(pt: PathPoint) {
  return (
    pt.in &&
    pt.out &&
    Math.abs(pt.x * 2 - pt.in.x - pt.out.x) < 1e-6 &&
    Math.abs(pt.y * 2 - pt.in.y - pt.out.y) < 1e-6
  );
}

function segToCmd(prev: PathPoint, curr: PathPoint, prevSmooth: boolean) {
  const c1 = prev.out || prev;
  const c2 = curr.in || curr;
  const useS = prevSmooth;
  if (prev.out || curr.in) {
    if (useS) return `S${c2.x} ${c2.y} ${curr.x} ${curr.y}`;
    return `C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${curr.x} ${curr.y}`;
  }
  return `L${curr.x} ${curr.y}`;
}

function pathToD(node: PathNode) {
  const paths = node.subpaths && node.subpaths.length ? node.subpaths : [node.points];
  const parts: string[] = [];
  paths.forEach((pts) => {
    if (!pts.length) return;
    const cmds = [`M${pts[0].x} ${pts[0].y}`];
    for (let i = 1; i < pts.length; i++) {
      cmds.push(segToCmd(pts[i - 1], pts[i], areMirrored(pts[i - 1])));
    }
    const last = pts[pts.length - 1];
    const first = pts[0];
    cmds.push(segToCmd(last, first, areMirrored(last)));
    cmds.push("Z");
    parts.push(cmds.join(" "));
  });
  return parts.join(" ");
}

// Build a mask element for the given node
export function buildMaskElement(
  doc: Document,
  node: PathNode | FrameNode,
): SVGMaskElement {
  const mask = doc.createElementNS(SVG_NS, "mask");
  mask.setAttribute("id", makeMaskId(node.id));
  mask.setAttribute("maskUnits", "userSpaceOnUse");

  if (node.type === "Path") {
    const path = doc.createElementNS(SVG_NS, "path");
    path.setAttribute("d", pathToD(node));
    path.setAttribute("fill", "white");
    const props = node.props || {};
    const rule =
      node.subpaths && node.subpaths.length
        ? props.fillRule || "evenodd"
        : props.fillRule || "nonzero";
    path.setAttribute("fill-rule", rule);
    mask.appendChild(path);
  } else if (node.type === "Frame") {
    const rect = doc.createElementNS(SVG_NS, "rect");
    const p = node.props || {};
    rect.setAttribute("x", String(p.x || 0));
    rect.setAttribute("y", String(p.y || 0));
    rect.setAttribute("width", String(p.w || 0));
    rect.setAttribute("height", String(p.h || 0));
    rect.setAttribute("fill", "white");
    mask.appendChild(rect);
  }
  return mask;
}

// Apply a mask to a group element
export function applyMask(groupEl: SVGGElement, maskId: string): void {
  groupEl.setAttribute("mask", `url(#${maskId})`);
}

export function buildImageMaskElement(
  doc: Document,
  args: {
    nodeId: string;
    href: string;
    drawRect: { x: number; y: number; w: number; h: number };
    viewport: { x: number; y: number; w: number; h: number };
    rotateDeg?: number;
    useLuminance?: boolean;
  },
): SVGMaskElement {
  const { nodeId, href, drawRect, viewport, rotateDeg, useLuminance } = args;
  const mask = doc.createElementNS(SVG_NS, "mask");
  mask.setAttribute("id", makeMaskId(nodeId));
  mask.setAttribute("maskUnits", "userSpaceOnUse");
  mask.setAttribute("maskContentUnits", "userSpaceOnUse");
  mask.setAttribute("x", String(viewport.x));
  mask.setAttribute("y", String(viewport.y));
  mask.setAttribute("width", String(viewport.w));
  mask.setAttribute("height", String(viewport.h));
  mask.setAttribute("style", "mask-type:alpha");

  const image = doc.createElementNS(SVG_NS, "image");
  image.setAttributeNS("http://www.w3.org/1999/xlink", "href", href);
  image.setAttribute("x", String(drawRect.x));
  image.setAttribute("y", String(drawRect.y));
  image.setAttribute("width", String(drawRect.w));
  image.setAttribute("height", String(drawRect.h));
  image.setAttribute("preserveAspectRatio", "none");
  if (rotateDeg) {
    const cx = drawRect.x + drawRect.w / 2;
    const cy = drawRect.y + drawRect.h / 2;
    image.setAttribute("transform", `rotate(${rotateDeg} ${cx} ${cy})`);
  }

  if (useLuminance) {
    const filter = doc.createElementNS(SVG_NS, "filter");
    const filterId = `lum-${nodeId}`;
    filter.setAttribute("id", filterId);
    const fe = doc.createElementNS(SVG_NS, "feColorMatrix");
    fe.setAttribute("type", "matrix");
    fe.setAttribute(
      "values",
      "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2126 0.7152 0.0722 0 0",
    );
    filter.appendChild(fe);
    mask.appendChild(filter);
    image.setAttribute("filter", `url(#${filterId})`);
  }

  mask.appendChild(image);
  return mask;
}

