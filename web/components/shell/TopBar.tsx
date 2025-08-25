'use client';
import Link from 'next/link';
import { TOP_BAR_HEIGHT } from '@/lib/layout/constants';
import { useEditorStore } from '@/store/editorStore';
import { useState, useRef, useEffect } from 'react';
import type { BooleanOp } from '@/lib/vector/boolean';
import { saveImage } from '@/lib/assets';
import AssetBrowser from '@/components/panels/AssetBrowser';

export default function TopBar() {
    const togglePreferences = useEditorStore((s) => s.togglePreferences);
    const selection = useEditorStore((s) => s.selectedIds);
    const tree = useEditorStore((s) => s.tree);
  const createComponent = useEditorStore((s) => s.createComponent);
  const detachInstance = useEditorStore((s) => s.detachInstance);
  const toggleMask = useEditorStore((s) => s.toggleMask);
  const combine = useEditorStore((s) => s.booleanCombine);
  const startCrop = useEditorStore((s) => s.startCrop);
  const cancelCrop = useEditorStore((s) => s.cancelCrop);
  const activeTool = useEditorStore((s) => s.ui.activeTool);
    const [replace, setReplace] = useState(false);
    const [toast, setToast] = useState(false);
    const [showAssets, setShowAssets] = useState(false);
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
    <>
      {showAssets && <AssetBrowser onClose={() => setShowAssets(false)} />}
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
          <button
            disabled={selection.length !== 1}
            onClick={() => createComponent()}
          >
            Create Component
          </button>
          <button
            disabled={selection.length !== 1}
            onClick={() => detachInstance(selection[0])}
          >
            Detach
          </button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('uibuilder:export'))}>
            Export
          </button>
          <button onClick={() => setShowAssets(true)}>Assets</button>
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
        </div>
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-2">
            <Link href="/builder" className="px-2 py-0.5 text-xs rounded border border-zinc-700 hover:bg-zinc-800">
              Builder
            </Link>
            <Link href="/dev/pages" className="px-2 py-0.5 text-xs rounded border border-zinc-700 hover:bg-zinc-800">
              Dev
            </Link>
          </nav>
          <button>Share</button>
          <button>Present</button>
          <button onClick={togglePreferences}>Preferences</button>
          <div className="w-6 h-6 bg-gray-500 rounded-full" />
        </div>
        {toast && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-green-600 text-white px-2 py-1 rounded">
            Created boolean result (evenodd)
          </div>
        )}
      </div>
    </>
  );
}
