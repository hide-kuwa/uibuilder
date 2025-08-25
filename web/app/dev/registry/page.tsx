"use client";
import { useState, useEffect } from "react";
import type { ComponentNode } from "@domain-components";
import { Palette } from "@/components/Palette";
import { CanvasRenderer } from "@/components/CanvasRenderer";
import { ActionBus } from "@core/action-bus";

export default function Page() {
  const [tree, setTree] = useState<ComponentNode[]>([]);
  useEffect(() => {
    const off = ActionBus.on((e) => console.log("ActionBus", e));
    return off;
  }, []);
  return (
    <div className="flex h-[100dvh]">
      <Palette onAdd={(node) => setTree((t) => [...t, node])} />
      <div className="flex-1 overflow-auto">
        <CanvasRenderer tree={tree} />
      </div>
    </div>
  );
}
