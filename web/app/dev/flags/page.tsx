'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const FLAG_KEYS = ['glowOff', 'heavyAnimationOff', 'showLegend'] as const;
type FlagKey = (typeof FLAG_KEYS)[number];

type FlagsState = Record<FlagKey, boolean>;

export default function DevFlagsPage() {
  const [flags, setFlags] = useState<FlagsState>(() => {
    const initial: FlagsState = {
      glowOff: false,
      heavyAnimationOff: false,
      showLegend: false,
    };
    return initial;
  });

  useEffect(() => {
    const stored: FlagsState = { ...flags };
    FLAG_KEYS.forEach((key) => {
      const value = localStorage.getItem(`flags.${key}`);
      if (value === 'true') stored[key] = true;
      if (value === 'false') stored[key] = false;
    });
    setFlags(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (key: FlagKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked;
    setFlags((prev) => ({ ...prev, [key]: value }));
    localStorage.setItem(`flags.${key}`, value ? 'true' : 'false');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">/dev/flags</h1>
        {FLAG_KEYS.map((key) => (
          <label key={key} className="flex items-center gap-2">
            <input type="checkbox" checked={flags[key]} onChange={handleChange(key)} />
            <span>{key}</span>
          </label>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold">Current values</h2>
        <ul className="list-disc pl-5 space-y-1">
          {FLAG_KEYS.map((key) => (
            <li key={key}>
              {key}: {String(flags[key])}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <Link href="/dev/pages" className="text-blue-600 underline">
          ← Back to /dev/pages
        </Link>
      </div>
    </div>
  );
}

