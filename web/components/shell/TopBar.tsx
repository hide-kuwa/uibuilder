'use client';
import { TOP_BAR_HEIGHT } from '@/lib/layout/constants';

export default function TopBar() {
  return (
    <div
      className="flex items-center justify-between px-3 gap-2 bg-gray-800 text-white"
      style={{ height: TOP_BAR_HEIGHT }}
    >
      <div className="flex items-center gap-2">
        <button>Back</button>
        <span>Untitled</span>
      </div>
      <div className="flex items-center gap-2">
        <button>Group</button>
        <button>Align</button>
      </div>
      <div className="flex items-center gap-2">
        <button>Share</button>
        <button>Present</button>
        <div className="w-6 h-6 bg-gray-500 rounded-full" />
      </div>
    </div>
  );
}
