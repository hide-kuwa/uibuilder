import React, { useState, useMemo } from 'react';
import { useEditorStore, EditorNode } from './useEditorStore';

function findNode(root: EditorNode, id: string): EditorNode | null {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

export const PropertyPanel: React.FC = () => {
  const selectedId = useEditorStore((s) => s.selectedId);
  const root = useEditorStore((s) => s.root);
  const node = useMemo(() => (selectedId ? findNode(root, selectedId) : null), [root, selectedId]);
  const updateProps = useEditorStore((s) => s.updateProps);
  const updateVariant = useEditorStore((s) => s.updateVariant);
  const [tab, setTab] = useState<'default' | 'hover'>('default');

  if (!node) return <div className="p-4 text-gray-500">No selection</div>;

  const handleClassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (tab === 'default') updateProps(node.id, { className: e.target.value });
    else updateVariant(node.id, tab, e.target.value);
  };

  const classValue = tab === 'default' ? node.props.className || '' : node.props.variants?.[tab] || '';

  return (
    <div className="p-4 space-y-2">
      <div>
        <label className="block text-sm">Text</label>
        <input
          className="w-full border rounded px-2 py-1"
          value={node.props.text || ''}
          onChange={(e) => updateProps(node.id, { text: e.target.value })}
        />
      </div>
      <div>
        <div className="flex space-x-2 text-sm">
          <button className={tab === 'default' ? 'font-bold' : ''} onClick={() => setTab('default')}>default</button>
          <button className={tab === 'hover' ? 'font-bold' : ''} onClick={() => setTab('hover')}>hover</button>
        </div>
        <input
          className="w-full border rounded px-2 py-1 mt-1"
          value={classValue}
          onChange={handleClassChange}
          placeholder="className"
        />
      </div>
    </div>
  );
};

