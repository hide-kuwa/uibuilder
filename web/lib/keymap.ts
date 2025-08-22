export type Command =
  | 'select'
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
  | 'export'
  | 'annotation.pin'
  | 'annotation.rect'
  | 'comment.submit'
  | 'review.inReview';

const map: Record<string, Command> = {
  KeyV: 'select',
  KeyF: 'frame',
  KeyR: 'rect',
  KeyT: 'text',
  Delete: 'delete',
  Backspace: 'delete',
};

export function getCommand(e: KeyboardEvent): Command | undefined {
  const mod = e.metaKey || e.ctrlKey;
  if (mod && e.altKey) {
    if (e.code === 'KeyK') return 'createComponent';
    if (e.code === 'KeyB') return 'detachInstance';
    if (e.code === 'KeyS') return 'swapInstance';
    if (e.code === 'KeyH') return 'distribute.h';
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
    if (e.code === 'KeyE' && e.shiftKey) return 'export';
    if (e.code === 'Enter') return 'comment.submit';
  }
  if (e.code === 'KeyA' && e.shiftKey) return 'makeAutoLayout';
  if (e.code === 'KeyC' && e.shiftKey) return 'annotation.rect';
  if (e.code === 'KeyC') return 'annotation.pin';
  return map[e.code];
}
