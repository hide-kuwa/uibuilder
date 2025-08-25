"use client";
import { Registry, ComponentNode } from "@domain-components";
import { use, Suspense } from "react";

function LazyView({ componentId, props, nodeId }: { componentId: string; props: any; nodeId: string }) {
  const meta = Registry[componentId];
  if (!meta) return <div className="text-red-600">Unknown: {componentId}</div>;
  const Cmp = use(meta.load());
  return <Cmp {...props} nodeId={nodeId} />;
}

export function CanvasRenderer({ tree }: { tree: ComponentNode[] }) {
  return (
    <div className="p-6 space-y-4">
      {tree.map((node) => (
        <Suspense key={node.id} fallback={<div>Loading...</div>}>
          <LazyView componentId={node.componentId} props={node.props} nodeId={node.id} />
        </Suspense>
      ))}
    </div>
  );
}
