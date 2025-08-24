'use client';
import React from 'react';

type Props = {
  title?: string;
  index: number;
  total: number;
  overlayOpen: boolean;
  onBack: () => void;
  onForward: () => void;
};

/**
 * v11-3: プレゼンターモード用 HUD
 * - 現在フレーム名、インデックス表示
 * - ⬅️➡️/Space/Backspace のナビを画面上のボタンでも操作可能
 * - Overlay 開閉状態の表示
 */
export function PresenterHUD({
  title,
  index,
  total,
  overlayOpen,
  onBack,
  onForward,
}: Props) {
  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      <div className="flex items-center gap-2 rounded-lg bg-zinc-900/80 border border-zinc-700 px-3 py-1.5 shadow">
        <button
          className="pointer-events-auto px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm"
          onClick={onBack}
          title="Back (← / Backspace)"
        >
          ← Back
        </button>
        <div className="text-xs text-zinc-300">
          <span className="font-medium">{title ?? 'Untitled'}</span>
          <span className="mx-2 opacity-60">•</span>
          <span>
            {index + 1}/{total}
          </span>
          {overlayOpen && <span className="ml-2 text-amber-300">[Overlay]</span>}
        </div>
        <button
          className="pointer-events-auto px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm"
          onClick={onForward}
          title="Forward (→ / Space)"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

