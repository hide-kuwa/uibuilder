import React from 'react';
import { useEditorStore } from '@/store/editorStore';

export default function CommentsPanel() {
  const threads = useEditorStore((s) => s.comments.threads);
  return (
    <aside>
      {Object.values(threads).map((t) => (
        <div key={t.id}>{t.messages[0]?.text}</div>
      ))}
    </aside>
  );
}
