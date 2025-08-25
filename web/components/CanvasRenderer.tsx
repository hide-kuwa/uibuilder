"use client";
import { Registry, ComponentNode } from "@domain-components";
import React, { lazy, Suspense } from "react";
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

export function CanvasRenderer({ tree }: { tree: ComponentNode[] }) {
  return <div className="p-6 space-y-4">{tree.map((n) => <RenderNode key={n.id} node={n} />)}</div>;
}
