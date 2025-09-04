import Link from 'next/link';

export default function SharePage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">共有ビュー</h1>
        <Link href="/dev/pages" className="text-sm underline">
          ← /dev/pages
        </Link>
      </div>

      <p className="text-sm text-zinc-500">
        今後このページから公開用URLが発行される予定です。
      </p>

      <div className="grid max-w-md gap-3 sm:grid-cols-2">
        <Link
          href="/map"
          className="rounded-xl border p-4 hover:bg-zinc-50"
        >
          <div className="font-medium">Map (published)</div>
          <div className="break-all text-xs text-zinc-500">/map</div>
        </Link>
        <Link
          href="/map?preview=1"
          className="rounded-xl border p-4 hover:bg-zinc-50"
        >
          <div className="font-medium">Map (preview)</div>
          <div className="break-all text-xs text-zinc-500">/map?preview=1</div>
        </Link>
      </div>
    </div>
  );
}

