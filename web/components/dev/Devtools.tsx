"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import ThemeInspector from "./ThemeInspector";

const ReactQueryDevtools = dynamic(
  () =>
    import("@tanstack/react-query-devtools").then(
      (mod) => mod.ReactQueryDevtools,
    ),
  { ssr: false },
);

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

export default function Devtools() {
  const [rq, setRq] = useState(false);
  const [zustand, setZustand] = useState(false);
  const [theme, setTheme] = useState(false);

  useEffect(() => {
    const update = () => {
      setRq(read(KEY_RQ));
      setZustand(read(KEY_ZUSTAND));
      setTheme(read(KEY_THEME));
    };
    update();
    window.addEventListener("devtools-update", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("devtools-update", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return (
    <>
      {rq && <ReactQueryDevtools initialIsOpen={false} />}
      {zustand && (
        <div className="fixed bottom-0 right-0 z-[9999] p-2 text-xs bg-white/90 dark:bg-black/90 border-t border-l border-zinc-200 dark:border-zinc-700">
          Zustand Devtools (TODO)
        </div>
      )}
      {theme && <ThemeInspector />}
    </>
  );
}
