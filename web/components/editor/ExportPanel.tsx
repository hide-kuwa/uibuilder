'use client';
import { useState } from 'react';
import {
  exportMany,
  PRESETS,
  ExportScope,
  ExportOptions,
  ExportPreset,
} from '@/lib/export';
import { useEditorStore } from '@/store/editorStore';

export default function ExportPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<'presets' | 'custom'>('presets');
  const [format, setFormat] = useState<'png' | 'svg' | 'html' | 'react'>('png');
  const [scale, setScale] = useState(1);
  const [background, setBackground] = useState<'transparent' | 'white'>('transparent');
  const selectedIds = useEditorStore((s) => s.selectedIds);
  if (!open) return null;

  const download = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    const scopes: ExportScope[] =
      selectedIds.length > 1
        ? selectedIds.map((id) => ({ mode: 'frame', id }))
        : [{ mode: 'selection' }];
    const opts: ExportOptions = {
      scale,
      background: background === 'transparent' ? 'transparent' : { color: background },
    };
    const results = await exportMany(scopes, { format, ...opts } as ExportPreset);
    results.forEach((res, i) => {
      let blob: Blob;
      if (format === 'png') blob = res as Blob;
      else if (format === 'svg')
        blob = res instanceof Blob ? res : new Blob([res as any], { type: 'image/svg+xml' });
      else if (format === 'html')
        blob = new Blob([(res as any).html], { type: 'text/html' });
      else blob = new Blob([(res as any).jsx], { type: 'text/plain' });
      download(blob, `export-${i}.${format === 'react' ? 'tsx' : format}`);
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white text-black p-4 rounded" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-2">Export</h2>
        <div className="mb-2 border-b flex mb-4">
          <button className={`px-2 py-1 ${tab === 'presets' ? 'border-b-2' : ''}`} onClick={() => setTab('presets')}>Presets</button>
          <button className={`px-2 py-1 ${tab === 'custom' ? 'border-b-2' : ''}`} onClick={() => setTab('custom')}>Custom</button>
        </div>
        {tab === 'presets' ? (
          <div className="space-y-2">
            {Object.entries(PRESETS).map(([id, p]) => (
              <button
                key={id}
                className="px-2 py-1 border block w-full text-left"
                onClick={async () => {
                  const scopes: ExportScope[] =
                    selectedIds.length > 1
                      ? selectedIds.map((sid) => ({ mode: 'frame', id: sid }))
                      : [{ mode: 'selection' }];
                  const results = await exportMany(scopes, p);
                  results.forEach((res, i) => {
                    let blob: Blob;
                    if (p.format === 'png') blob = res as Blob;
                    else if (p.format === 'svg')
                      blob = res instanceof Blob ? res : new Blob([res as any], { type: 'image/svg+xml' });
                    else if (p.format === 'html')
                      blob = new Blob([(res as any).html], { type: 'text/html' });
                    else blob = new Blob([(res as any).jsx], { type: 'text/plain' });
                    download(blob, `export-${i}.${p.format === 'react' ? 'tsx' : p.format}`);
                  });
                  onClose();
                }}
              >
                {id.toUpperCase()}
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-2">
              <label className="mr-2">Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value as any)}>
                <option value="png">PNG</option>
                <option value="svg">SVG</option>
                <option value="html">HTML</option>
                <option value="react">React</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="mr-2">Scale</label>
              <select value={scale} onChange={(e) => setScale(Number(e.target.value))}>
                {[1, 2, 3, 4].map((s) => (
                  <option key={s} value={s}>{`${s}x`}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="mr-2">Background</label>
              <select value={background} onChange={(e) => setBackground(e.target.value as any)}>
                <option value="transparent">Transparent</option>
                <option value="white">White</option>
              </select>
            </div>
            <button className="px-2 py-1 border" onClick={handleExport}>
              Export
            </button>
          </>
        )}
      </div>
    </div>
  );
}
