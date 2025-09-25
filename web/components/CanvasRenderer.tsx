"use client";
import { Registry, ComponentNode } from "@domain-components";
import React, { lazy, Suspense, useEffect, useRef } from "react";
import { useResolvedProps } from "@/components/hooks/useResolvedProps";

function LazyComponent({ node }: { node: ComponentNode }) {
  const meta = Registry[node.componentId];
  if (!meta) return <div className="text-red-600">Unknown: {node.componentId}</div>;
  const { props, isLoading } = useResolvedProps(node);
  const Cmp = lazy(async () => ({ default: await meta.load() }));
  return (
    <Cmp {...props} nodeId={node.id}>
      {node.children?.length ? node.children.map((ch) => <RenderNode key={ch.id} node={ch} />) : null}
      {isLoading ? <div className="absolute right-1 top-1 text-xs opacity-50">loading…</div> : null}
    </Cmp>
  );
}

function RenderNode({ node }: { node: ComponentNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent node={node} />
    </Suspense>
  );
}

const DROP_SEP_CLASS = ["h-2", "-my-1", "opacity-0"] as const;

function useDropSeparatorHitbox(tree: ComponentNode[], container: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    const root = container.current;
    if (!root) return;

    const apply = (target: ParentNode) => {
      target.querySelectorAll<HTMLElement>("[data-drop-sep]").forEach((el) => {
        if (el.dataset.dropSepPatched === "true") return;
        el.classList.add(...DROP_SEP_CLASS);
        const index = el.getAttribute("data-drop-index");
        if (index !== null) {
          el.dataset.dropIndex = index;
        }
        el.dataset.dropSepPatched = "true";
      });
    };

    apply(root);

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement || node instanceof DocumentFragment) {
            apply(node);
          }
        });
      }
    });

    observer.observe(root, { subtree: true, childList: true });
    return () => observer.disconnect();
  }, [tree, container]);
}

export function CanvasRenderer({ tree }: { tree: ComponentNode[] }) {
  const container = useRef<HTMLDivElement>(null);
  useDropSeparatorHitbox(tree, container);

  return (
    <div ref={container} className="p-6 space-y-4">
      {tree.map((n) => (
        <RenderNode key={n.id} node={n} />
      ))}
    </div>
  );
}
