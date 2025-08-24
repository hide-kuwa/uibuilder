import type { TextSelection } from '@/types/editor';

export function readSelection(root: HTMLElement): { start: number; end: number; rect: DOMRect | null } {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) {
    return { start: 0, end: 0, rect: null };
  }

  const range = sel.getRangeAt(0);
  const anchor = sel.anchorNode;
  const focus = sel.focusNode;
  let start = 0;
  let end = 0;
  let foundAnchor = false;
  let foundFocus = false;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current: Node | null = walker.nextNode();
  while (current) {
    const text = current.textContent || '';
    if (current === anchor) {
      start += sel.anchorOffset;
      foundAnchor = true;
    }
    if (current === focus) {
      end += sel.focusOffset;
      foundFocus = true;
    }
    if (!foundAnchor) start += text.length;
    if (!foundFocus) end += text.length;
    current = walker.nextNode();
  }

  const rect = range.collapsed ? null : range.getBoundingClientRect();
  return { start, end, rect };
}
