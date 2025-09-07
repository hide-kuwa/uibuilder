// apps/builder/components/AutosaveMount.tsx
'use client';

import * as React from 'react';
import { useAutosave } from '@/src/hooks/useAutosave';

type Props = {
  page: any;             // 既存の page JSON（id を含む想定）
  debounceMs?: number;   // 既定 800ms
};

/**
 * 画面に置くだけで autosave を有効化する薄いマウント。
 * 失敗時は IndexedDB に退避・online 復帰で自動再送。
 * autosave:queued / autosave:saved / autosave:error を window に発火。
 */
export function AutosaveMount({ page, debounceMs = 800 }: Props) {
  useAutosave({
    key: `page:${page?.id ?? 'unknown'}`,
    data: page,
    save: async (p) => {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      });
      if (!res.ok) throw new Error('save failed');
    },
    debounceMs,
  });
  return null;
}

