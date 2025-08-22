'use client';
import { useEditorStore } from '@/store/editorStore';
import SelectionBox from './SelectionBox';
import ResizeHandles from './ResizeHandles';

export default function CanvasStage() {
  const tree = useEditorStore((s) => s.tree);
  const selected = useEditorStore((s) => s.selectedIds);
  return (
    <div className="relative bg-gray-900 overflow-hidden">
      {tree.map((n) => (
        <div
          key={n.id}
          className="absolute border border-gray-700 text-xs text-white"
          style={{
            left: n.props?.x || 0,
            top: n.props?.y || 0,
            width: n.props?.w || 0,
            height: n.props?.h || 0,
          }}
        >
          {n.type}
        </div>
      ))}
      {selected.length === 1 && <SelectionBox />}
      {selected.length === 1 && <ResizeHandles />}
    </div>
  );
}
