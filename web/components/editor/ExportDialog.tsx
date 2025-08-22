'use client';
import { exportPNG } from '@/lib/exporters/png';
import { exportSVG } from '@/lib/exporters/svg';
import { exportHTML } from '@/lib/exporters/html';
import { exportReact } from '@/lib/exporters/react';
import { useEditorStore } from '@/store/editorStore';

export default function ExportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const state = useEditorStore();
  if (!open) return null;
  const handle = async (kind: 'png' | 'svg' | 'html' | 'react') => {
    const el = document.body as HTMLElement;
    const opts = { kind, fileName: 'uibuilder-export', scale: 1 } as const;
    if (kind === 'png') await exportPNG(el, opts);
    else if (kind === 'svg') await exportSVG(el, opts);
    else if (kind === 'html') exportHTML(state, opts);
    else exportReact(state, opts);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white text-black p-4 rounded" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-2">Export</h2>
        <div className="space-x-2">
          <button className="px-2 py-1 border" onClick={() => handle('png')}>PNG</button>
          <button className="px-2 py-1 border" onClick={() => handle('svg')}>SVG</button>
          <button className="px-2 py-1 border" onClick={() => handle('html')}>HTML</button>
          <button className="px-2 py-1 border" onClick={() => handle('react')}>React</button>
        </div>
      </div>
    </div>
  );
}
