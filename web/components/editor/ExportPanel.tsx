'use client';
import { useState } from 'react';
import { exportPNG, exportSVG, exportHTML, exportReact, ExportScope, ExportOptions } from '@/lib/export';

export default function ExportPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [format, setFormat] = useState<'png' | 'svg' | 'html' | 'react'>('png');
  const [scale, setScale] = useState(1);
  const [background, setBackground] = useState<'transparent' | 'white'>('transparent');
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
    const scope: ExportScope = { mode: 'selection' };
    const opts: ExportOptions = {
      scale,
      background: background === 'transparent' ? 'transparent' : { color: background },
    };
    if (format === 'png') {
      const blob = await exportPNG(scope, opts);
      download(blob, 'export.png');
    } else if (format === 'svg') {
      const res = await exportSVG(scope, opts);
      const blob = res instanceof Blob ? res : new Blob([res], { type: 'image/svg+xml' });
      download(blob, 'export.svg');
    } else if (format === 'html') {
      const { html } = await exportHTML(scope, opts);
      const blob = new Blob([html], { type: 'text/html' });
      download(blob, 'export.html');
    } else {
      const { jsx } = await exportReact(scope, opts);
      const blob = new Blob([jsx], { type: 'text/plain' });
      download(blob, 'export.tsx');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white text-black p-4 rounded" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-2">Export</h2>
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
        <button className="px-2 py-1 border" onClick={handleExport}>Export</button>
      </div>
    </div>
  );
}
