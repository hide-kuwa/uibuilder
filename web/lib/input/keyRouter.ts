import { getCommand } from '@/lib/keymap';
import { runCommand } from '@/lib/commands';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

export function keyRouter(e: KeyboardEvent | ReactKeyboardEvent) {
  const evt = 'nativeEvent' in e ? (e as ReactKeyboardEvent).nativeEvent : e;
  const cmd = getCommand(evt);
  if (cmd) {
    if (runCommand(cmd)) {
      evt.preventDefault();
      evt.stopPropagation();
    }
  }
}
