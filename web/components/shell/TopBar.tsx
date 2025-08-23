'use client';
import { TOP_BAR_HEIGHT } from '@/lib/layout/constants';
import { useEditorStore } from '@/store/editorStore';

export default function TopBar() {
  const prefs = useEditorStore((s) => s.prefs || {});
  const toggleLayoutGrid = useEditorStore((s) => s.toggleLayoutGrid);
  const togglePixelGrid = useEditorStore((s) => s.togglePixelGrid);
  const toggleSnapToPixel = useEditorStore((s) => s.toggleSnapToPixel);
  return (
    <div
      className="flex items-center justify-between px-3 gap-2 bg-gray-800 text-white"
      style={{ height: TOP_BAR_HEIGHT }}
    >
      <div className="flex items-center gap-2">
        <button>Back</button>
        <span>Untitled</span>
      </div>
      <div className="flex items-center gap-4">
        <button>Group</button>
        <button>Align</button>
        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={prefs.showLayoutGrid || false}
              onChange={toggleLayoutGrid}
            />
            Layout Grid
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={prefs.showPixelGrid || false}
              onChange={togglePixelGrid}
            />
            Pixel Grid
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={prefs.snapToPixel !== false}
              onChange={toggleSnapToPixel}
            />
            Snap
          </label>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button>Share</button>
        <button>Present</button>
        <div className="w-6 h-6 bg-gray-500 rounded-full" />
      </div>
    </div>
  );
}
