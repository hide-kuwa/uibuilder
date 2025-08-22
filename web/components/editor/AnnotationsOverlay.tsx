import React from 'react';
import { useEditorStore } from '@/store/editorStore';

export default function AnnotationsOverlay() {
  const threads = useEditorStore((s) => s.comments.threads);
  return (
    <div className="annotations-overlay">
      {Object.values(threads).map((t) => {
        if (t.anchor.kind === 'PIN' && t.anchor.x !== undefined && t.anchor.y !== undefined) {
          return (
            <div
              key={t.id}
              className="annotation-pin"
              style={{ left: t.anchor.x, top: t.anchor.y }}
            />
          );
        }
        if (t.anchor.kind === 'RECT' && t.anchor.rect) {
          const r = t.anchor.rect;
          return (
            <div
              key={t.id}
              className="annotation-rect"
              style={{ left: r.x, top: r.y, width: r.w, height: r.h }}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
