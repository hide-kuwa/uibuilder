'use client';
import { ZOOM_BUTTON_SIZE } from '@/lib/layout/constants';
import * as zoom from '@/lib/zoom';
import { useEditorStore } from '@/store/editorStore';

export default function ZoomControls() {
  const z = useEditorStore((s) => s.camera.zoom);
  return (
    <div
      className="flex items-center gap-1 bg-gray-800/70 rounded px-1"
      style={{ height: ZOOM_BUTTON_SIZE }}
    >
      <button className="w-7 h-7" onClick={() => zoom.zoomBy(1.1)}>
        +
      </button>
      <button className="w-7 h-7" onClick={() => zoom.zoomBy(0.9)}>
        -
      </button>
      <span className="text-xs w-12 text-center">{Math.round(z * 100)}%</span>
      <button className="w-12 h-7" onClick={() => zoom.animateZoomTo(1)}>
        100%
      </button>
      <button className="w-7 h-7" onClick={() => zoom.fitAll()}>
        Fit
      </button>
      <button className="w-7 h-7" onClick={() => zoom.fitSelection()}>
        Sel
      </button>
    </div>
  );
}
