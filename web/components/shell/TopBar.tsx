'use client';
import { TOP_BAR_HEIGHT } from '@/lib/layout/constants';
import { useEditorStore } from '@/store/editorStore';
import { useState, useRef, useEffect } from 'react';
import type { BooleanOp } from '@/lib/vector/boolean';
import { saveImage } from '@/lib/assets';

export default function TopBar() {
    const prefs = useEditorStore((s) => s.prefs || {});
    const toggleLayoutGrid = useEditorStore((s) => s.toggleLayoutGrid);
    const togglePixelGrid = useEditorStore((s) => s.togglePixelGrid);
    const toggleSnapToPixel = useEditorStore((s) => s.toggleSnapToPixel);
    const selection = useEditorStore((s) => s.selectedIds);
    const tree = useEditorStore((s) => s.tree);
  const toggleMask = useEditorStore((s) => s.toggleMask);
  const combine = useEditorStore((s) => s.booleanCombine);
  const startCrop = useEditorStore((s) => s.startCrop);
  const cancelCrop = useEditorStore((s) => s.cancelCrop);
  const activeTool = useEditorStore((s) => s.ui.activeTool);
    const [replace, setReplace] = useState(false);
    const [toast, setToast] = useState(false);
    const fileInput = useRef<HTMLInputElement | null>(null);
    const replaceInput = useRef<HTMLInputElement | null>(null);

    const handleFiles = async (files: FileList | null) => {
      if (!files) return;
      for (const file of Array.from(files)) {
        const meta = await saveImage(file);
        useEditorStore.getState().addImageNode(meta);
      }
    };

    const handleReplace = async (files: FileList | null) => {
      if (!files || selection.length === 0) return;
      const file = files[0];
      const meta = await saveImage(file);
      const id = selection[selection.length - 1];
      useEditorStore.getState().addImageAsset(meta);
      useEditorStore.getState().replaceImageAsset(id, meta.id);
    };

    useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'r') {
          if (selection.length === 1) {
            e.preventDefault();
            replaceInput.current?.click();
          }
        }
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [selection]);

    const run = (op: BooleanOp) => {
      const id = combine(op, selection, { replace });
      if (id) {
        setToast(true);
        setTimeout(() => setToast(false), 1500);
      }
    };
  return (
      <div
        className="flex items-center justify-between px-3 gap-2 bg-gray-800 text-white relative"
        style={{ height: TOP_BAR_HEIGHT }}
      >
      <div className="flex items-center gap-2">
        <button>Back</button>
        <span>Untitled</span>
      </div>
        <div className="flex items-center gap-4">
          <button>Group</button>
          <button onClick={() => fileInput.current?.click()}>Place Image</button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button
            disabled={selection.length !== 1}
            onClick={() => replaceInput.current?.click()}
          >
            Replace
          </button>
          <input
            ref={replaceInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleReplace(e.target.files)}
          />
          <button
            disabled={selection.length === 0}
            className={activeTool === 'crop' ? 'bg-blue-600' : undefined}
            onClick={() => {
              const id = selection[selection.length - 1];
              if (!id) return;
              if (activeTool === 'crop') cancelCrop();
              else startCrop(id);
            }}
          >
            Crop
          </button>
          {activeTool === 'crop' && (
            <span className="text-xs">Enter to confirm / Esc to cancel</span>
          )}
          <button>Align</button>
          <button
            disabled={selection.length === 0}
            className={(() => {
              const id = selection[selection.length - 1];
              const node = tree.find((n) => n.id === id) as any;
              return node?.isMask ? "bg-blue-600" : undefined;
            })()}
            onClick={() => {
              const id = selection[selection.length - 1];
              if (id) toggleMask(id);
            }}
          >
            Mask
          </button>
          <button
            disabled={selection.length < 2}
            onClick={() => run('UNION')}
          >
            Union
          </button>
          <button
            disabled={selection.length < 2}
            onClick={() => run('SUBTRACT')}
          >
            Subtract
          </button>
          <button
            disabled={selection.length < 2}
            onClick={() => run('INTERSECT')}
          >
            Intersect
          </button>
          <button
            disabled={selection.length < 2}
            onClick={() => run('EXCLUDE')}
          >
            Exclude
          </button>
          <label className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={replace}
              onChange={() => setReplace(!replace)}
            />
            Replace originals
          </label>
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
        {toast && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-green-600 text-white px-2 py-1 rounded">
            Created boolean result (evenodd)
          </div>
        )}
      </div>
    );
  }
