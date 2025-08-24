'use client';
import { useEffect, useState } from 'react';
import { useEditorStore } from '@/store/editorStore';

export default function EventLog() {
  const logs = useEditorStore((s) => s.devLog);
  const log = useEditorStore((s) => s.logDev);
  const clear = useEditorStore((s) => s.clearDevLog);
  const lastCmd = useEditorStore((s) => s.lastCommandId);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const toggle = () => setOpen((o) => !o);
    window.addEventListener('uibuilder:toggleEventLog', toggle);
    return () => window.removeEventListener('uibuilder:toggleEventLog', toggle);
  }, []);

  useEffect(() => {
    if (lastCmd) log({ ts: Date.now(), type: 'action', payload: { id: lastCmd } });
  }, [lastCmd, log]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const handlePointer = (e: PointerEvent) =>
      log({ ts: Date.now(), type: e.type, payload: { x: e.clientX, y: e.clientY, button: e.button } });
    const handleWheel = (e: WheelEvent) =>
      log({ ts: Date.now(), type: 'wheel', payload: { dx: e.deltaX, dy: e.deltaY } });
    const handleKey = (e: KeyboardEvent) =>
      log({ ts: Date.now(), type: e.type, payload: { key: e.key, code: e.code } });
    window.addEventListener('pointerdown', handlePointer);
    window.addEventListener('pointermove', handlePointer);
    window.addEventListener('pointerup', handlePointer);
    window.addEventListener('wheel', handleWheel);
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    return () => {
      window.removeEventListener('pointerdown', handlePointer);
      window.removeEventListener('pointermove', handlePointer);
      window.removeEventListener('pointerup', handlePointer);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
    };
  }, [log]);

  if (!open) return null;

  const entries = logs?.filter((l) => !filter || l.type.includes(filter)) || [];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-h-64 bg-white text-black text-xs border-t z-50">
      <div className="flex items-center p-1 border-b">
        <input
          className="border px-1 mr-1 flex-1"
          placeholder="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button className="px-1 border" onClick={clear}>
          Clear
        </button>
      </div>
      <div className="overflow-auto max-h-56 p-1">
        <ul>
          {entries.map((l, i) => (
            <li key={i} className="whitespace-pre">
              {new Date(l.ts).toLocaleTimeString()} {l.type} {JSON.stringify(l.payload)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
