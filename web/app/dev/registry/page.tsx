"use client";
import { useState, useMemo } from "react";
import { registry } from "@/lib/registry";
import { themePresets } from "@/lib/themePresets";
import { hoverActionPresets } from "@/lib/hoverActionPresets";
import { animationPresets } from "@/lib/animationPresets";
import { ZodError } from "zod";
import { themeDocSchema } from "../../../../src/schemas/theme";
import { layoutTemplateSchema } from "../../../../src/schemas/layout";
import { pageSnapshotSchema } from "../../../../src/schemas/page";

 type Tab = "components" | "themes" | "hover" | "animations" | "schemas";

export default function DevRegistryPage() {
  const [tab, setTab] = useState<Tab>("components");
  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        {[
          { key: "components", label: "Components" },
          { key: "themes", label: "Themes" },
          { key: "hover", label: "Hover Actions" },
          { key: "animations", label: "Animations" },
          { key: "schemas", label: "Schemas" },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as Tab)}
            className={`px-2 py-1 rounded border text-sm ${tab === t.key ? "bg-zinc-200 dark:bg-zinc-700" : "bg-transparent"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "components" && <ComponentsSection />}
      {tab === "themes" && <ThemesSection />}
      {tab === "hover" && <HoverSection />}
      {tab === "animations" && <AnimationSection />}
      {tab === "schemas" && <SchemasSection />}
    </div>
  );
}

function ComponentsSection() {
  const comps = useMemo(() => Object.values(registry), []);
  const categories = useMemo(() => {
    const set = new Set(comps.map(c => c.meta.group || "misc"));
    return Array.from(set);
  }, [comps]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const filtered = comps.filter(c =>
    (!search || c.meta.displayName.toLowerCase().includes(search.toLowerCase())) &&
    (category === "all" || (c.meta.group || "misc") === category)
  );
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search"
          className="border px-2 py-1 rounded flex-1 text-sm"
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border px-2 py-1 rounded text-sm"
        >
          <option value="all">All</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        {filtered.map(item => (
          <details key={item.meta.id} className="border rounded p-2">
            <summary className="cursor-pointer">{item.meta.displayName}</summary>
            <div className="mt-2 space-y-2 text-sm">
              <div>Props: {item.meta.props.map(p => p.name).join(", ") || "none"}</div>
              <div className="border rounded p-2">
                <item.Render />
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function ThemesSection() {
  return (
    <div className="grid gap-2">
      {themePresets.map(t => (
        <details key={t.id} className="border rounded p-2">
          <summary className="cursor-pointer">{t.name}</summary>
          <div className="mt-2 space-y-2">
            <div className="flex gap-2">
              {Object.entries(t.colors).map(([k, v]) => (
                <div
                  key={k}
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: v }}
                  title={k}
                />
              ))}
            </div>
            <pre className="text-xs bg-neutral-100 dark:bg-neutral-800 p-2 rounded">{JSON.stringify(t.colors, null, 2)}</pre>
          </div>
        </details>
      ))}
    </div>
  );
}

function HoverSection() {
  return (
    <div className="grid gap-2">
      {hoverActionPresets.map(p => (
        <details key={p.id} className="border rounded p-2">
          <summary className="cursor-pointer">{p.name}</summary>
          <div className="mt-2">
            <pre className="text-xs bg-neutral-100 dark:bg-neutral-800 p-2 rounded">{JSON.stringify(p.effects, null, 2)}</pre>
          </div>
        </details>
      ))}
    </div>
  );
}

function AnimationSection() {
  return (
    <div className="grid gap-2">
      {animationPresets.map(p => {
        const sample = p.build(0.5);
        return (
          <details key={p.key} className="border rounded p-2">
            <summary className="cursor-pointer">{p.name}</summary>
            <div className="mt-2 space-y-2">
              {p.defaults && (
                <pre className="text-xs bg-neutral-100 dark:bg-neutral-800 p-2 rounded">
                  {JSON.stringify(p.defaults, null, 2)}
                </pre>
              )}
              <pre className="text-xs bg-neutral-100 dark:bg-neutral-800 p-2 rounded">
                {JSON.stringify(sample, null, 2)}
              </pre>
            </div>
          </details>
        );
      })}
    </div>
  );
}

function SchemasSection() {
  const [kind, setKind] = useState<'theme' | 'layout' | 'page'>('theme');
  const [text, setText] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const validate = () => {
    try {
      const json = JSON.parse(text);
      const schema =
        kind === 'theme'
          ? themeDocSchema
          : kind === 'layout'
          ? layoutTemplateSchema
          : pageSnapshotSchema;
      schema.parse(json);
      setResult('Valid!');
    } catch (e) {
      if (e instanceof ZodError) {
        setResult(e.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', '));
      } else if (e instanceof Error) {
        setResult(e.message);
      } else {
        setResult('Unknown error');
      }
    }
  };

  return (
    <div className="space-y-2 max-w-xl">
      <div className="flex gap-2">
        <select
          value={kind}
          onChange={e => setKind(e.target.value as any)}
          className="border px-2 py-1 rounded text-sm"
        >
          <option value="theme">Theme</option>
          <option value="layout">Layout</option>
          <option value="page">Page</option>
        </select>
        <button onClick={validate} className="px-2 py-1 rounded border text-sm">
          Validate
        </button>
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        className="w-full h-40 border p-2 text-xs font-mono rounded"
        placeholder="Paste JSON here"
      />
      {result && <p className="text-sm">{result}</p>}
    </div>
  );
}
