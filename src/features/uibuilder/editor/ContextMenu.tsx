import React, { useEffect, useState } from 'react';
import { useEditorStore, EditorNode } from './useEditorStore';

function findNode(node: EditorNode, id: string): EditorNode | null {
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

export const ContextMenu: React.FC = () => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const root = useEditorStore((s) => s.root);
  const groupSelected = useEditorStore((s) => s.groupSelected);
  const ungroup = useEditorStore((s) => s.ungroup);
  const setLocked = useEditorStore((s) => s.setLocked);

  const selectedNodes = selectedIds.map((id) => findNode(root, id)).filter(Boolean) as EditorNode[];
  const allLocked = selectedNodes.every((n) => n.locked);
  const singleGroup =
    selectedNodes.length === 1 && selectedNodes[0].type === 'group';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      e.preventDefault();
      setPos({ x: e.clientX, y: e.clientY });
    };
    const close = () => setPos(null);
    window.addEventListener('contextmenu', handler);
    window.addEventListener('click', close);
    return () => {
      window.removeEventListener('contextmenu', handler);
      window.removeEventListener('click', close);
    };
  }, []);

  if (!pos) return null;

  return (
    <ul
      className="fixed bg-gray-800 text-white text-sm rounded shadow z-50"
      style={{ left: pos.x, top: pos.y }}
    >
      {selectedIds.length >= 2 && (
        <li
          className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
          onClick={() => {
            groupSelected();
            setPos(null);
          }}
        >
          Group
        </li>
      )}
      {singleGroup && (
        <li
          className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
          onClick={() => {
            ungroup(selectedIds[0]);
            setPos(null);
          }}
        >
          Ungroup
        </li>
      )}
      {selectedIds.length > 0 && (
        <li
          className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
          onClick={() => {
            setLocked(selectedIds, !allLocked);
            setPos(null);
          }}
        >
          {allLocked ? 'Unlock' : 'Lock'}
        </li>
      )}
    </ul>
  );
};
