'use client';
import { useEditorStore } from '@/store/editorStore';
import { moveCrop } from '@/lib/image/crop';
import { useEffect } from 'react';

export default function ImageCropOverlay() {
  const draft = useEditorStore((s) => s.cropDraft);
  const updateCrop = useEditorStore((s) => s.updateCrop);
  const commitCrop = useEditorStore((s) => s.commitCrop);
  const cancelCrop = useEditorStore((s) => s.cancelCrop);
  const assets = useEditorStore((s) => s.assets.images);
  const tree = useEditorStore((s) => s.tree);
  if (!draft) return null;
  const node = tree.find((n) => n.id === draft.nodeId) as any;
  const meta = assets[node?.props.assetId];
  const natural = { w: meta?.w || node?.props.w || 0, h: meta?.h || node?.props.h || 0 };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        commitCrop();
        e.preventDefault();
      } else if (e.key === 'Escape') {
        cancelCrop();
        e.preventDefault();
      } else if (e.key.startsWith('Arrow')) {
        const dx = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
        const dy = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
        const mul = e.shiftKey ? 10 : 1;
        const next = moveCrop(draft.rect, dx * mul, dy * mul, natural);
        updateCrop(next);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [draft, commitCrop, cancelCrop, updateCrop, natural]);
  const style: React.CSSProperties = {
    position: 'absolute',
    left: draft.rect.x,
    top: draft.rect.y,
    width: draft.rect.w,
    height: draft.rect.h,
    border: '1px solid #4af',
    boxSizing: 'border-box',
  };
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div style={style} />
    </div>
  );
}
