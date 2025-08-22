'use client';
import { STATUS_BAR_HEIGHT } from '@/lib/layout/constants';

export default function StatusBar() {
  return (
    <div
      className="flex items-center justify-between px-3 bg-gray-800 text-white text-xs"
      style={{ height: STATUS_BAR_HEIGHT }}
    >
      <div>Selection</div>
      <div>Error messages</div>
      <div className="flex items-center gap-2">
        <span>100%</span>
        <span>0,0</span>
        <span>Snap</span>
      </div>
    </div>
  );
}
