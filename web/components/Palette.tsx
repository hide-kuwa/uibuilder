"use client";
import { Registry } from "@domain-components";
import { nanoid } from "nanoid";

export function Palette({ onAdd }: { onAdd: (node: any) => void }) {
  const keys = Object.keys(Registry);
  return (
    <div className="p-2 border-r w-60 space-y-2">
      {keys.map((k) => {
        const meta = Registry[k];
        return (
          <button
            key={k}
            className="w-full text-left px-2 py-1 rounded hover:bg-gray-100"
            onClick={() => {
              const props = meta.propsSchema.parse(meta.defaultProps);
              onAdd({ id: nanoid(), componentId: meta.id, props });
            }}
          >
            {meta.displayName}
          </button>
        );
      })}
    </div>
  );
}
