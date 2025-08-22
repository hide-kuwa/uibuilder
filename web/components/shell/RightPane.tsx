'use client';
import { RIGHT_PANE_DEFAULT_WIDTH } from '@/lib/layout/constants';
import { useState } from 'react';

const TABS = ['Properties', 'Prototype', 'Code'];

export default function RightPane() {
  const [tab, setTab] = useState('Properties');
  return (
    <div className="flex flex-col h-full bg-gray-800 text-white" style={{width: RIGHT_PANE_DEFAULT_WIDTH}}>
      <div role="tablist" className="flex">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            onClick={() => setTab(t)}
            className={`flex-1 px-2 py-1 border-b ${tab===t? 'border-white':'border-transparent'}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-2 text-sm">
        <p>{tab} panel</p>
      </div>
    </div>
  );
}
