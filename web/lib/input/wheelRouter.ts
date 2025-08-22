import { zoomBy } from '@/lib/zoom';
import { useEditorStore } from '@/store/editorStore';
import type { WheelEvent as ReactWheelEvent } from 'react';

export function wheelRouter(e: WheelEvent | ReactWheelEvent) {
  const evt = 'nativeEvent' in e ? (e as ReactWheelEvent).nativeEvent : e;
  const store = useEditorStore.getState();
  if (evt.ctrlKey || evt.metaKey) {
    const factor = evt.deltaY > 0 ? 0.9 : 1.1;
    zoomBy(factor, { x: evt.clientX, y: evt.clientY });
  } else {
    store.setCamera({
      x: store.camera.x - evt.deltaX,
      y: store.camera.y - evt.deltaY,
    });
  }
  evt.preventDefault();
}
