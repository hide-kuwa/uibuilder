'use client';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [dark]);

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} />
      ダークモード
    </label>
  );
}

