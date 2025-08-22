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
  | 'swapInstance';

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
  }
  if (mod) {
    if (e.code === 'KeyD') return 'duplicate';
    if (e.code === 'KeyZ' && e.shiftKey) return 'redo';
    if (e.code === 'KeyZ') return 'undo';
    if (e.code === 'KeyA' && e.shiftKey) return 'removeAutoLayout';
  }
  if (e.code === 'KeyA' && e.shiftKey) return 'makeAutoLayout';
  return map[e.code];
}
