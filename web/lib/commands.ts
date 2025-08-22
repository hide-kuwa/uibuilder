export interface Command {
  id: string;
  label: string;
  keywords?: string[];
  shortcut?: string;
  run: () => void;
}

import { useEditorStore } from '@/store/editorStore';

export const COMMANDS: Command[] = [
  {
    id: 'align.left',
    label: 'Align Left',
    keywords: ['align', 'left'],
    shortcut: 'Ctrl+Shift+L',
    run: () => useEditorStore.getState().align('left'),
  },
  {
    id: 'align.center.h',
    label: 'Align Horizontal Center',
    shortcut: 'Ctrl+Shift+H',
    run: () => useEditorStore.getState().align('centerH'),
  },
  {
    id: 'distribute.h',
    label: 'Distribute Horizontally',
    shortcut: 'Ctrl+Alt+H',
    run: () => useEditorStore.getState().distribute('h'),
  },
  {
    id: 'order.front',
    label: 'Bring to Front',
    shortcut: 'Ctrl+]',
    run: () => useEditorStore.getState().reorder('front'),
  },
  {
    id: 'view.toggleRulers',
    label: 'Toggle Rulers',
    shortcut: 'Ctrl+R',
    run: () => useEditorStore.getState().toggleRulers(),
  },
  {
    id: 'view.toggleGuides',
    label: 'Toggle Guides',
    shortcut: 'Ctrl+;',
    run: () => useEditorStore.getState().toggleGuides(),
  },
  {
    id: 'view.toggleOutline',
    label: 'Toggle Outline',
    shortcut: 'Ctrl+Y',
    run: () => useEditorStore.getState().toggleOutline(),
  },
  {
    id: 'export',
    label: 'Export',
    shortcut: 'Ctrl+Shift+E',
    run: () => window.dispatchEvent(new CustomEvent('uibuilder:export')),
  },
];
