export interface Command {
  id: string;
  title: string;
  keywords?: string[];
  shortcut?: string;
  run: () => void;
}

import { useEditorStore } from '@/store/editorStore';
import * as zoom from '@/lib/zoom';

export const COMMANDS: Command[] = [
  {
    id: 'align.left',
    title: 'Align Left',
    keywords: ['align', 'left'],
    shortcut: 'Ctrl+Shift+L',
    run: () => useEditorStore.getState().align('left'),
  },
  {
    id: 'align.center.h',
    title: 'Align Horizontal Center',
    shortcut: 'Ctrl+Shift+H',
    run: () => useEditorStore.getState().align('centerH'),
  },
  {
    id: 'distribute.h',
    title: 'Distribute Horizontally',
    shortcut: 'Ctrl+Alt+H',
    run: () => useEditorStore.getState().distribute('h'),
  },
  {
    id: 'order.front',
    title: 'Bring to Front',
    shortcut: 'Ctrl+]',
    run: () => useEditorStore.getState().reorder('front'),
  },
  {
    id: 'view.toggleRulers',
    title: 'Toggle Rulers',
    shortcut: 'Ctrl+R',
    run: () => useEditorStore.getState().toggleRulers(),
  },
  {
    id: 'view.toggleGuides',
    title: 'Toggle Guides',
    shortcut: 'Ctrl+;',
    run: () => useEditorStore.getState().toggleGuides(),
  },
  {
    id: 'view.toggleOutline',
    title: 'Toggle Outline',
    shortcut: 'Ctrl+Y',
    run: () => useEditorStore.getState().toggleOutline(),
  },
  {
    id: 'view.toggleLayoutGrid',
    title: 'Toggle Layout Grid',
    shortcut: 'Ctrl+Shift+G',
    run: () => useEditorStore.getState().toggleLayoutGrid(),
  },
  {

    id: 'view.togglePixelGrid',
    title: 'Toggle Pixel Grid',
    shortcut: "Ctrl+'",
    run: () => useEditorStore.getState().togglePixelGrid(),
  },
  {
    id: 'view.toggleSnapToPixel',
    title: 'Toggle Snap To Pixel',
    shortcut: 'Ctrl+Shift+P',
    run: () => useEditorStore.getState().toggleSnapToPixel(),
  },
  {
    id: 'view.prefs',
    label: 'Preferences',
    shortcut: 'Ctrl+,',
    run: () => useEditorStore.getState().togglePreferences(),
  },
  {
    id: 'export',
    title: 'Export',
    shortcut: 'Ctrl+Shift+E',
    run: () => window.dispatchEvent(new CustomEvent('uibuilder:export')),
  },
  {
    id: 'zoom.in',
    title: 'Zoom In',
    shortcut: 'Ctrl++',
    run: () => zoom.zoomBy(1.1),
  },
  {
    id: 'zoom.out',
    title: 'Zoom Out',
    shortcut: 'Ctrl+-',
    run: () => zoom.zoomBy(0.9),
  },
  {
    id: 'zoom.fitAll',
    title: 'Fit All',
    shortcut: 'Shift+1',
    run: () => zoom.fitAll(),
  },
  {
    id: 'zoom.fitSelection',
    title: 'Fit Selection',
    shortcut: 'Shift+2',
    run: () => zoom.fitSelection(),
  },
  {
    id: 'zoom.to100',
    title: 'Zoom to 100%',
    shortcut: '1',
    run: () => {
      const cam = useEditorStore.getState().camera;
      zoom.animateZoomTo({ ...cam, zoom: 1 });
    },
  },
];

export function runCommand(id: string): boolean {
  const cmd = COMMANDS.find((c) => c.id === id);
  if (!cmd) return false;
  cmd.run();
  const store = useEditorStore.getState();
  store.setLastCommand(id);
  store.addRecentCommand(id);
  return true;
}
