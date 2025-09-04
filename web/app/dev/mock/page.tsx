'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { isMockEnabled } from '@/lib/mock';

export default function MockPage() {
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    const enabled = isMockEnabled();
    console.log('mock enabled', enabled);
    setUseMock(enabled);
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    localStorage.setItem('useMock', checked ? 'true' : 'false');
    setUseMock(checked);
    location.reload();
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Mock 切替</h1>
      <div>現在の mock 有効状態: {String(useMock)}</div>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={useMock} onChange={onChange} />
        <span>useMock</span>
      </label>
      <Link href="/dev/pages" className="text-blue-600 underline">
        &larr; /dev/pages
      </Link>
    </div>
  );
}

