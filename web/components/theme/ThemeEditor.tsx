"use client";

import { useState } from "react";
import { useDesignTokens } from "@/store/designTokensStore";
import { nanoid } from "nanoid";

const radiusMap: Record<string, number> = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
};

const fontOptions = [
  { label: "inter", value: "Inter, system-ui, sans-serif" },
  { label: "noto", value: '"Noto Sans JP", sans-serif' },
  { label: "メイリオ", value: "Meiryo, sans-serif" },
];

export default function ThemeEditor() {
  const store = useDesignTokens();
  const [tokens, setTokens] = useState(() => ({
    color: {
      primary: store.tokens.color?.primary || "#1d4ed8",
      secondary: store.tokens.color?.secondary || "#9333ea",
      background: store.tokens.color?.background || "#ffffff",
      text: store.tokens.color?.text || "#111827",
    },
    radius: {
      base: store.tokens.radius?.base ?? radiusMap.md,
    },
    space: {
      xs: store.tokens.space?.xs ?? 4,
      sm: store.tokens.space?.sm ?? 8,
      md: store.tokens.space?.md ?? 16,
      lg: store.tokens.space?.lg ?? 24,
      xl: store.tokens.space?.xl ?? 32,
    },
    fontFamily: {
      base: store.tokens.fontFamily?.base || fontOptions[0].value,
    },
    fontSize: {
      base: store.tokens.fontSize?.base || 16,
    },
  }));
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function updateToken(group: string, key: string, value: any) {
    const next = {
      ...tokens,
      [group]: { ...tokens[group as keyof typeof tokens], [key]: value },
    };
    setTokens(next);
    useDesignTokens.getState().replaceAll(next);
  }

  function handleApply() {
    if (!name.trim()) {
      setError("保存名を入力してください");
      return;
    }
    setError("");
    const theme = { id: nanoid(), name, tokens };
    const blob = new Blob([JSON.stringify(theme, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-4 space-y-6">
      <section>
        <h3 className="font-bold mb-2">Colors</h3>
        {Object.keys(tokens.color).map((k) => (
          <div key={k} className="flex items-center gap-2 mb-2">
            <label className="w-24 capitalize">{k}</label>
            <input
              type="color"
              value={tokens.color[k as keyof typeof tokens.color]}
              onChange={(e) => updateToken("color", k, e.target.value)}
            />
          </div>
        ))}
      </section>

      <section>
        <h3 className="font-bold mb-2">Radius</h3>
        <select
          className="border p-1"
          value={tokens.radius.base}
          onChange={(e) =>
            updateToken("radius", "base", Number(e.target.value))
          }
        >
          {Object.entries(radiusMap).map(([k, v]) => (
            <option key={k} value={v}>
              {k}
            </option>
          ))}
        </select>
      </section>

      <section>
        <h3 className="font-bold mb-2">Space (px)</h3>
        {Object.keys(tokens.space).map((k) => (
          <div key={k} className="flex items-center gap-2 mb-2">
            <label className="w-8 uppercase">{k}</label>
            <input
              type="number"
              className="border p-1 w-20"
              value={tokens.space[k as keyof typeof tokens.space]}
              onChange={(e) => updateToken("space", k, Number(e.target.value))}
            />
          </div>
        ))}
      </section>

      <section>
        <h3 className="font-bold mb-2">Font</h3>
        <div className="flex items-center gap-2 mb-2">
          <label className="w-24">Family</label>
          <select
            className="border p-1"
            value={tokens.fontFamily.base}
            onChange={(e) => updateToken("fontFamily", "base", e.target.value)}
          >
            {fontOptions.map((f) => (
              <option key={f.label} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="w-24">Size</label>
          <input
            type="number"
            className="border p-1 w-20"
            value={tokens.fontSize.base}
            onChange={(e) =>
              updateToken("fontSize", "base", Number(e.target.value))
            }
          />
        </div>
      </section>

      <section className="pt-4 border-t">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            className="border p-1 flex-1"
            placeholder="保存名"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="px-3 py-1 bg-blue-600 text-white"
            onClick={handleApply}
          >
            Apply
          </button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </section>
    </div>
  );
}
