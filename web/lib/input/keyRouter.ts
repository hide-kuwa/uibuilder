import { getCommand } from '@/lib/keymap';
import { runCommand } from '@/lib/commands';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

function isEditingContext(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable) return true;
  if (el.closest('[data-ignore-shortcuts]')) return true;
  return false;
}

export function keyRouter(e: KeyboardEvent | ReactKeyboardEvent) {
  const evt = 'nativeEvent' in e ? (e as ReactKeyboardEvent).nativeEvent : e;
  if (evt.isComposing) return;
  if (isEditingContext(evt.target)) return;

  if (evt.key === '/') {
    const input = document.getElementById('leftpane-search') as HTMLInputElement | null;
    if (input) {
      input.focus();
      evt.preventDefault();
      return;
    }
  }
  if (evt.key === 'Escape') {
    const active = document.activeElement as HTMLElement | null;
    if (active && active.id === 'leftpane-search') {
      active.blur();
      evt.preventDefault();
      return;
    }
  }

  const cmd = getCommand(evt);
  if (cmd && runCommand(cmd)) {
    evt.preventDefault();
    evt.stopPropagation();
  }
}
