'use client';
import { LEFT_PANE_DEFAULT_WIDTH } from '@/lib/layout/constants';
import { useState } from 'react';

const TABS = ['Layers', 'Assets', 'Pages'];

export default function LeftPane() {
  const [tab, setTab] = useState('Layers');
  return (
    <div className="flex flex-col h-full bg-gray-800 text-white" style={{width: LEFT_PANE_DEFAULT_WIDTH}}>
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
      <div className="p-2">
        <input
          id="leftpane-search"
          className="w-full px-2 py-1 bg-gray-700"
          placeholder="Search layers"
        />
      </div>
      <div className="flex-1 overflow-auto text-sm p-2">
        <p>{tab} content</p>
      </div>
    </div>
  );
}
