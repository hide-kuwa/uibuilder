import type { WheelEvent as ReactWheelEvent } from 'react';

export type WheelAction =
  | { type: 'zoom'; factor: number; anchor: { x: number; y: number } }
  | { type: 'pan'; dx: number; dy: number };

export function wheelRouter(e: WheelEvent | ReactWheelEvent): WheelAction {
  const evt = 'nativeEvent' in e ? (e as ReactWheelEvent).nativeEvent : e;
  const dx = evt.deltaMode === WheelEvent.DOM_DELTA_LINE ? evt.deltaX * 16 : evt.deltaX;
  const dy = evt.deltaMode === WheelEvent.DOM_DELTA_LINE ? evt.deltaY * 16 : evt.deltaY;
  if (evt.ctrlKey || evt.metaKey) {
    const factor = dy > 0 ? 0.9 : 1.1;
    return { type: 'zoom', factor, anchor: { x: evt.clientX, y: evt.clientY } };
  }
  return { type: 'pan', dx, dy };
}
