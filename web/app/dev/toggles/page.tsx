"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const KEY_RQ = "devtools.reactQuery";
const KEY_ZUSTAND = "devtools.zustand";
const KEY_THEME = "devtools.theme";

function read(key: string) {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function write(key: string, val: boolean) {
  try {
    localStorage.setItem(key, val ? "1" : "0");
  } catch {}
  window.dispatchEvent(new Event("devtools-update"));
}

export default function DevTogglesPage() {
  const [rq, setRq] = useState(false);
  const [zustand, setZustand] = useState(false);
  const [theme, setTheme] = useState(false);

  useEffect(() => {
    setRq(read(KEY_RQ));
    setZustand(read(KEY_ZUSTAND));
    setTheme(read(KEY_THEME));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Devtools Toggles</h1>
        <Link
          href="/dev/pages"
          className="text-sm text-blue-600 hover:underline"
        >
          ← /dev/pages
        </Link>
      </div>
      <p className="text-sm text-zinc-500">
        開発支援ツールの表示を切り替えます。
      </p>
      <div className="space-y-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={rq}
            onChange={(e) => {
              const v = e.target.checked;
              setRq(v);
              write(KEY_RQ, v);
            }}
          />
          <span>React Query Devtools</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={zustand}
            onChange={(e) => {
              const v = e.target.checked;
              setZustand(v);
              write(KEY_ZUSTAND, v);
            }}
          />
          <span>Zustand Devtools</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={theme}
            onChange={(e) => {
              const v = e.target.checked;
              setTheme(v);
              write(KEY_THEME, v);
            }}
          />
          <span>Theme Inspector</span>
        </label>
      </div>
    </div>
  );
}
