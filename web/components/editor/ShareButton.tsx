'use client';
import { useEditorStore } from '@/store/editorStore';
import { serialize } from '@/lib/serialize';

export default function ShareButton() {
  const state = useEditorStore();
  const handle = async () => {
    const res = await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serialize(state)),
    });
    const json = await res.json();
    const url = `${location.origin}/s/${json.id}`;
    window.prompt('Share URL', url);
  };
  return (
    <button className="px-2 py-1 border" onClick={handle}>
      Share
    </button>
  );
}
