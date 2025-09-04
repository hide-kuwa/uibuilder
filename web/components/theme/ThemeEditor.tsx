"use client";

import { useEffect, useState } from "react";
import { useDesignTokens } from "@/store/designTokensStore";
import { nanoid } from "nanoid";
import { themePresets, type ThemeToken } from "./themePresets";

const fontOptions = [
  { label: "inter", value: "Inter, system-ui, sans-serif" },
  { label: "noto", value: '"Noto Sans JP", sans-serif' },
  { label: "メイリオ", value: "Meiryo, sans-serif" },
];

export default function ThemeEditor() {
  const [preset, setPreset] = useState<keyof typeof themePresets>("Minimal");
  const [tokens, setTokens] = useState<ThemeToken>(themePresets[preset]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const t = themePresets[preset];
    setTokens(t);
    applyTokensToStore(t);
  }, [preset]);

  function applyTokensToStore(t: ThemeToken) {
    useDesignTokens.getState().replaceAll({
      color: { ...t.colors },
      radius: { ...t.radius },
      space: { ...t.spacing },
      fontFamily: { base: t.font.family },
      fontSize: { base: t.font.size },
    });
  }

  function updateToken(group: keyof ThemeToken, key: string, value: any) {
    const next = {
      ...tokens,
      [group]: { ...tokens[group], [key]: value },
    } as ThemeToken;
    setTokens(next);
    applyTokensToStore(next);
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
        <h3 className="font-bold mb-2">Preset</h3>
        <select
          className="border p-1"
          value={preset}
          onChange={(e) =>
            setPreset(e.target.value as keyof typeof themePresets)
          }
        >
          {Object.keys(themePresets).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </section>

      <section>
        <h3 className="font-bold mb-2">Colors</h3>
        {Object.keys(tokens.colors).map((k) => (
          <div key={k} className="flex items-center gap-2 mb-2">
            <label className="w-24 capitalize">{k}</label>
            <input
              type="color"
              value={tokens.colors[k as keyof ThemeToken["colors"]]}
              onChange={(e) => updateToken("colors", k, e.target.value)}
            />
          </div>
        ))}
      </section>

      <section>
        <h3 className="font-bold mb-2">Radius (px)</h3>
        {Object.keys(tokens.radius).map((k) => (
          <div key={k} className="flex items-center gap-2 mb-2">
            <label className="w-24 capitalize">{k}</label>
            <input
              type="number"
              className="border p-1 w-20"
              value={tokens.radius[k as keyof ThemeToken["radius"]]}
              onChange={(e) =>
                updateToken("radius", k, Number(e.target.value))
              }
            />
          </div>
        ))}
      </section>

      <section>
        <h3 className="font-bold mb-2">Spacing (px)</h3>
        {Object.keys(tokens.spacing).map((k) => (
          <div key={k} className="flex items-center gap-2 mb-2">
            <label className="w-8 uppercase">{k}</label>
            <input
              type="number"
              className="border p-1 w-20"
              value={tokens.spacing[k as keyof ThemeToken["spacing"]]}
              onChange={(e) =>
                updateToken("spacing", k, Number(e.target.value))
              }
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
            value={tokens.font.family}
            onChange={(e) => updateToken("font", "family", e.target.value)}
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
            value={tokens.font.size}
            onChange={(e) =>
              updateToken("font", "size", Number(e.target.value))
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
