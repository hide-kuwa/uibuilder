'use client';
import { useState } from 'react';
import { ZOOM_BUTTON_SIZE, ZOOM_PERCENT_WIDTH } from '@/lib/layout/constants';

export default function ZoomControls() {
  const [zoom, setZoom] = useState(100);
  const inc = () => setZoom((z) => Math.min(z + 10, 800));
  const dec = () => setZoom((z) => Math.max(z - 10, 10));
  const fit = () => setZoom(100);
  const reset = () => setZoom(100);
  return (
    <div className="flex items-center gap-1 bg-gray-800/70 rounded" style={{height: ZOOM_BUTTON_SIZE}}>
      <button className="w-7 h-7" onClick={dec}>-</button>
      <input
        className="text-center bg-transparent"
        style={{width: ZOOM_PERCENT_WIDTH}}
        value={`${zoom}%`}
        onChange={(e) => setZoom(parseInt(e.target.value) || 0)}
      />
      <button className="w-7 h-7" onClick={inc}>+</button>
      <button className="w-7 h-7" onClick={fit}>Fit</button>
      <button className="w-7 h-7" onClick={reset}>1:1</button>
    </div>
  );
}
