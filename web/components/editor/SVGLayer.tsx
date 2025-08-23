"use client";
import { useEffect, useRef } from "react";
import { useEditorStore } from "@/store/editorStore";
import type {
  ComponentNode,
  FrameNode,
  ImageNode,
  PathNode,
  PathPoint,
} from "@/types/editor";
import {
  ensureMaskDefs,
  buildMaskElement,
  makeMaskId,
} from "@/lib/vector/mask";

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

export default function SVGLayer() {
  const tree = useEditorStore((s) => s.tree);
  const selectPath = useEditorStore((s) => s.selectPath);
  const svgRef = useRef<SVGSVGElement>(null);

  // Build mask <defs> on every change to the tree
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const defs = ensureMaskDefs(svg);
    defs.innerHTML = "";
    const masks: Array<PathNode | FrameNode | ImageNode> = [];
    const collect = (nodes: ComponentNode[]) => {
      nodes.forEach((n) => {
        if ((n as any).isMask) masks.push(n as any);
        if (n.children) collect(n.children);
      });
    };
    collect(tree);
    masks.forEach((m) => {
      defs.appendChild(buildMaskElement(svg.ownerDocument, m));
    });
  }, [tree]);

  const renderNodes = (nodes: ComponentNode[]): JSX.Element[] => {
    const els: JSX.Element[] = [];
    let activeMask: string | null = null;
    nodes.forEach((n) => {
      if ((n as any).isMask) {
        activeMask = makeMaskId(n.id);
        return; // mask nodes are not rendered themselves
      }
      if (n.type === "Path") {
        const p = n as PathNode;
        const props = p.props || {};
        const strokeWidth = props.strokeWidth ?? 0;
        const strokeProps =
          strokeWidth > 0
            ? {
                stroke: props.stroke || "none",
                strokeWidth,
                strokeLinecap: props.strokeCap || "butt",
                strokeLinejoin: props.strokeJoin || "miter",
                strokeMiterlimit: props.miterLimit ?? 4,
                strokeDasharray:
                  props.dash && props.dash.length
                    ? props.dash.join(" ")
                    : undefined,
                strokeDashoffset: props.dashOffset ?? 0,
                strokeOpacity: props.strokeOpacity ?? 1,
              }
            : {};
        const pathEl = (
          <path
            key={p.id}
            d={pathToD(p)}
            fill={props.fill || "none"}
            fillOpacity={props.fillOpacity ?? 1}
            fillRule={
              p.subpaths && p.subpaths.length
                ? props.fillRule || "evenodd"
                : props.fillRule || "nonzero"
            }
            className="pointer-events-auto"
            onPointerDown={(e) => {
              selectPath(p.id);
              e.stopPropagation();
            }}
            {...strokeProps}
          />
        );
        if (activeMask) {
          els.push(
            <g key={`g-${p.id}`} mask={`url(#${activeMask})`}>
              {pathEl}
            </g>,
          );
        } else {
          els.push(pathEl);
        }
      } else if (n.children) {
        const childEls = renderNodes(n.children);
        if (childEls.length) {
          if (activeMask) {
            els.push(
              <g key={n.id} mask={`url(#${activeMask})`}>
                {childEls}
              </g>,
            );
          } else {
            els.push(<g key={n.id}>{childEls}</g>);
          }
        }
      }
    });
    return els;
  };

  return (
    <svg ref={svgRef} className="absolute inset-0 pointer-events-none">
      {renderNodes(tree)}
    </svg>
  );
}

