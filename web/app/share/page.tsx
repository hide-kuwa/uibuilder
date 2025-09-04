"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useBuilderStore } from "@/stores/builder";
import { computeBgColor, buildMotionFromStatus } from "@/lib/status-engine";
import { runMotionEffects } from "@/lib/runMotion";

type MapNode = {
  id: string;
  name?: string;
};

function NodeViewer({ node }: { node: MapNode }) {
  const cfg = useBuilderStore((s) => s.statusConfig);
  const getStatus = useBuilderStore((s) => s.getNodeStatus);
  const status = getStatus(node.id);
  const { bg, filter } = computeBgColor(status, cfg);
  const motion = buildMotionFromStatus(node.id, status, cfg);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !motion) return;
    runMotionEffects(
      [
        {
          id: "glow",
          preset: "pulse",
          runWhen: ["mount"],
          options: { loop: true, ...motion },
        },
      ],
      "mount",
      ref.current,
    );
  }, [motion]);

  return (
    <div
      ref={ref}
      className="flex w-full max-w-[320px] flex-col items-center justify-center rounded-xl border p-6 text-center shadow-lg"
      style={{ background: bg, filter }}
    >
      <div className="text-2xl font-bold drop-shadow">
        {node.name ?? node.id}
      </div>
      <div className="mt-2 text-xs opacity-70">id: {node.id}</div>
    </div>
  );
}

export default function SharePage() {
  const sp = useSearchParams();
  const id = sp.get("id");
  const getMapNodes = useBuilderStore((s) => s.getMapNodes);
  const nodes = getMapNodes(true);
  const node = id ? nodes.find((n) => n.id === id) : undefined;

  if (id) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        {node ? (
          <NodeViewer node={node} />
        ) : (
          <p className="text-sm text-zinc-500">該当ノードが見つかりません</p>
        )}
        <footer className="mt-6">
          <Link href="/map" className="text-sm underline">
            ← 地図にもどる
          </Link>
        </footer>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">共有ビュー</h1>
        <Link href="/dev/pages" className="text-sm underline">
          ← /dev/pages
        </Link>
      </div>

      <p className="text-sm text-zinc-500">
        今後このページから公開用URLが発行される予定です。
      </p>

      <div className="grid max-w-md gap-3 sm:grid-cols-2">
        <Link href="/map" className="rounded-xl border p-4 hover:bg-zinc-50">
          <div className="font-medium">Map (published)</div>
          <div className="break-all text-xs text-zinc-500">/map</div>
        </Link>
        <Link
          href="/map?preview=1"
          className="rounded-xl border p-4 hover:bg-zinc-50"
        >
          <div className="font-medium">Map (preview)</div>
          <div className="break-all text-xs text-zinc-500">/map?preview=1</div>
        </Link>
      </div>
    </div>
  );
}

