'use client';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function DevPages() {
  const links = [
    { href: '/builder', label: 'Builder' },
    { href: '/dev/arrange', label: 'Arrange' },
    { href: '/dev/actions', label: 'Actions (placeholder)' },
    { href: '/share', label: 'Share (placeholder)' },
    { href: '/map', label: 'Map (published)' },
    { href: '/map?preview=1', label: 'Map (preview)' },
  ] as const;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">/dev/pages</h1>
        <ThemeToggle />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="p-4 rounded-xl border hover:bg-zinc-50 dark:hover:bg-zinc-900">
            <div className="font-medium">{l.label}</div>
            <div className="text-xs text-zinc-500 break-all">{l.href}</div>
          </Link>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Devtools / Mock</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl border">
            <div className="text-sm font-medium mb-2">React Query Devtools</div>
            <div className="text-xs text-zinc-500">(placeholder) トグル/マウントを後日追加</div>
          </div>
          <div className="p-4 rounded-xl border">
            <div className="text-sm font-medium mb-2">Zustand Devtools</div>
            <div className="text-xs text-zinc-500">(placeholder) トグル/マウントを後日追加</div>
          </div>
          <div className="p-4 rounded-xl border">
            <div className="text-sm font-medium mb-2">Mock 切替</div>
            <div className="text-xs text-zinc-500">(placeholder) API モック/実データ切替</div>
          </div>
          <div className="p-4 rounded-xl border">
            <div className="text-sm font-medium mb-2">未使用コンポ一覧</div>
            <div className="text-xs text-zinc-500">(placeholder) 自動検出 UI</div>
          </div>
        </div>
      </section>
    </div>
  );
}

