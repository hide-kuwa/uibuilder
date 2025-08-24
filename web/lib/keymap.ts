import { useEditorStore } from '@/store/editorStore';

export type Command =
  | 'select'
  | 'tool.pen'
  | 'tool.select'
  | 'path.confirm'
  | 'path.cancel'
  | 'path.deleteLast'
  | 'frame'
  | 'rect'
  | 'text'
  | 'delete'
  | 'duplicate'
  | 'undo'
  | 'redo'
  | 'makeAutoLayout'
  | 'removeAutoLayout'
  | 'createComponent'
  | 'detachInstance'
  | 'swapInstance'
  | 'commandPalette'
  | 'align.left'
  | 'align.center.h'
  | 'distribute.h'
  | 'order.front'
  | 'view.toggleRulers'
  | 'view.toggleGuides'
  | 'view.toggleOutline'
  | 'view.toggleLayoutGrid'
  | 'view.toggleSnapToPixel'
  | 'view.eventLog'
  | 'view.prefs'
  | 'export'
  | 'annotation.pin'
  | 'annotation.rect'
  | 'comment.submit'
  | 'review.inReview'
  | 'nudge.up'
  | 'nudge.down'
  | 'nudge.left'
  | 'nudge.right'
  | 'nudge.big.up'
  | 'nudge.big.down'
  | 'nudge.big.left'
  | 'nudge.big.right'
  | 'text.bold'
  | 'text.italic'
  | 'text.underline'
  | 'text.link';

const map: Record<string, Command> = {
  KeyP: 'tool.pen',
  KeyV: 'tool.select',
  Enter: 'path.confirm',
  Escape: 'path.cancel',
  Backspace: 'path.deleteLast',
  KeyF: 'frame',
  KeyR: 'rect',
  KeyT: 'text',
  Delete: 'delete',
};

export function getCommand(e: KeyboardEvent): Command | undefined {
  if (useEditorStore.getState().ui?.activeTool === 'crop') return undefined;
  const mod = e.metaKey || e.ctrlKey;
  const editing = !!useEditorStore.getState().textSel;
  if (mod && editing) {
    if (e.code === 'KeyB') return 'text.bold';
    if (e.code === 'KeyI') return 'text.italic';
    if (e.code === 'KeyU') return 'text.underline';
    if (e.code === 'KeyK') return 'text.link';
  }
  if (mod && e.altKey) {
    if (e.code === 'KeyK') return 'createComponent';
    if (e.code === 'KeyB') return 'detachInstance';
    if (e.code === 'KeyS') return 'swapInstance';
    if (e.code === 'KeyH') return 'distribute.h';
    if (e.code === 'KeyL') return 'view.eventLog';
  }
  if (mod) {
    if (e.code === 'KeyD') return 'duplicate';
    if (e.code === 'KeyZ' && e.shiftKey) return 'redo';
    if (e.code === 'KeyZ') return 'undo';
    if (e.code === 'KeyA' && e.shiftKey) return 'removeAutoLayout';
    if (e.code === 'KeyK') return 'commandPalette';
    if (e.code === 'KeyL' && e.shiftKey) return 'align.left';
    if (e.code === 'KeyH' && e.shiftKey) return 'align.center.h';
    if (e.code === 'BracketRight' && e.shiftKey) return 'order.front';
    if (e.code === 'KeyR' && e.shiftKey) return 'review.inReview';
    if (e.code === 'KeyR') return 'view.toggleRulers';
    if (e.code === 'Semicolon') return 'view.toggleGuides';
    if (e.code === 'KeyY') return 'view.toggleOutline';
    if (e.code === 'KeyG' && e.shiftKey) return 'view.toggleLayoutGrid';
    if (e.code === 'KeyP' && e.shiftKey) return 'view.toggleSnapToPixel';
    if (e.code === 'Comma') return 'view.prefs';
    if (e.code === 'KeyE' && e.shiftKey) return 'export';
    if (e.code === 'Enter') return 'comment.submit';
  }
  if (!mod) {
    if (e.code === 'ArrowUp') return e.shiftKey ? 'nudge.big.up' : 'nudge.up';
    if (e.code === 'ArrowDown') return e.shiftKey ? 'nudge.big.down' : 'nudge.down';
    if (e.code === 'ArrowLeft') return e.shiftKey ? 'nudge.big.left' : 'nudge.left';
    if (e.code === 'ArrowRight') return e.shiftKey ? 'nudge.big.right' : 'nudge.right';
  }
  if (e.code === 'KeyA' && e.shiftKey) return 'makeAutoLayout';
  if (e.code === 'KeyC' && e.shiftKey) return 'annotation.rect';
  if (e.code === 'KeyC') return 'annotation.pin';
  return map[e.code];
}
