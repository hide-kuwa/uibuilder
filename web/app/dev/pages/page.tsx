"use client";
import Link from "next/link";

export default function DevPages() {
  const links = [
    { href: "/builder", label: "Builder" },
    { href: "/dev/arrange", label: "Arrange" },
    { href: "/dev/actions", label: "Actions" },
    { href: "/map", label: "Map" },
    { href: "/map?preview=1", label: "Map (preview)" },
    { href: "/dev/share", label: "Share" },
  ] as const;

  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.13.0";
  const commitHash = process.env.NEXT_PUBLIC_GIT_COMMIT_HASH ?? "開発中";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">/dev/pages</h1>
        <button
          type="button"
          onClick={() => document.documentElement.classList.toggle("dark")}
          className="text-sm px-3 py-1 rounded border hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          🌙
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="p-4 rounded-xl border hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <div className="font-medium">{l.label}</div>
            <div className="text-xs text-zinc-500 break-all">{l.href}</div>
          </Link>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Devtools / Mock</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link
            href="/dev/toggles"
            className="p-4 rounded-xl border hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <div className="text-sm font-medium mb-2">Devtools</div>
            <div className="text-xs text-zinc-500">
              React Query / Zustand Devtools
            </div>
          </Link>
          <Link
            href="/dev/flags"
            className="p-4 rounded-xl border hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <div className="text-sm font-medium mb-2">Flags</div>
            <div className="text-xs text-zinc-500">Runtime feature flags</div>
          </Link>
          <div className="p-4 rounded-xl border">
            <div className="text-sm font-medium mb-2">Mock 切替</div>
            <div className="text-xs text-zinc-500">
              (placeholder) API モック/実データ切替
            </div>
          </div>
          <Link
            href="/dev/unused"
            className="p-4 rounded-xl border hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <div className="text-sm font-medium mb-2">未使用コンポ一覧</div>
            <div className="text-xs text-zinc-500">自動検出 UI</div>
          </Link>
        </div>
      </section>

      <div className="mt-8 text-xs text-gray-500 text-right">
        ver. {version} ({commitHash})
      </div>
    </div>
  );
}
