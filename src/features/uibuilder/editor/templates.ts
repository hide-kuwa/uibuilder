import { EditorNode, createNode } from './useEditorStore';

export const templates: Record<string, EditorNode> = {
  'Dashboard Layout': {
    id: 'root',
    type: 'div',
    props: { className: 'flex' },
    children: [
      createNode('Sidebar', { id: 'sidebar' }),
      createNode('MainContent', { id: 'main' }),
    ],
  },
};

