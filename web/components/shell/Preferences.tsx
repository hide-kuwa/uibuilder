'use client';
import { useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';

export default function Preferences() {
  const prefs = useEditorStore((s) => s.prefs || {});
  const setPrefs = useEditorStore((s) => s.setPrefs);
  const open = useEditorStore((s) => s.ui?.showPreferences);
  const toggle = useEditorStore((s) => s.togglePreferences);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggle();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, toggle]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white p-4 rounded w-80 space-y-3">
        <h2 className="text-lg mb-2">Preferences</h2>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={prefs.showImageBadges ?? true}
            onChange={(e) => setPrefs({ showImageBadges: e.target.checked })}
          />
          Show Image Badges
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={prefs.reduceMotion ?? false}
            onChange={(e) => setPrefs({ reduceMotion: e.target.checked })}
          />
          Reduce Motion
        </label>
        <label className="flex items-center gap-2">
          Snap Tolerance
          <input
            type="number"
            className="w-16 bg-gray-700 border border-gray-600 rounded px-1"
            value={prefs.snapPx ?? 4}
            onChange={(e) => setPrefs({ snapPx: Number(e.target.value) })}
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={prefs.showGrid ?? false}
            onChange={(e) => setPrefs({ showGrid: e.target.checked })}
          />
          Canvas Grid
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={prefs.showPerfHud ?? false}
            onChange={(e) => setPrefs({ showPerfHud: e.target.checked })}
          />
          Perf HUD
        </label>
        <div className="text-right">
          <button className="mt-2 px-2 py-1 bg-gray-700 rounded" onClick={toggle}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
