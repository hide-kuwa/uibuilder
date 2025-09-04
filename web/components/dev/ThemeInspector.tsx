"use client";
import { useEffect, useState } from "react";

export default function ThemeInspector() {
  const [vars, setVars] = useState<Record<string, string>>({});

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    const entries: [string, string][] = [];
    for (let i = 0; i < styles.length; i++) {
      const name = styles[i];
      if (name.startsWith("--color-")) {
        const value = styles.getPropertyValue(name).trim();
        entries.push([name, value]);
      }
    }
    setVars(Object.fromEntries(entries));
  }, []);

  return (
    <div className="fixed bottom-0 left-0 max-h-[50vh] w-64 overflow-auto p-4 text-xs bg-white/90 dark:bg-black/90 z-[9999] space-y-1 border-t border-r border-zinc-200 dark:border-zinc-700">
      {Object.entries(vars).map(([name, value]) => (
        <div key={name} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded border border-zinc-300 dark:border-zinc-700"
            style={{ background: `hsl(${value})` }}
          />
          <code>
            {name}: {value}
          </code>
        </div>
      ))}
    </div>
  );
}
