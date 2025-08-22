'use client';
import { SPLITTER_WIDTH } from '@/lib/layout/constants';

interface Props {
  onDrag: (delta: number) => void;
  onReset: () => void;
  onToggleCollapse: () => void;
}

export default function Splitter({ onDrag, onReset, onToggleCollapse }: Props) {
  const handleMouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      onDrag(delta);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleDouble = (e: React.MouseEvent) => {
    if (e.altKey) onToggleCollapse();
    else onReset();
  };

  return (
    <div
      className="splitter"
      style={{ width: SPLITTER_WIDTH }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDouble}
    />
  );
}
