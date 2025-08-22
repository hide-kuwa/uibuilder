import { useEditorStore } from '@/store/editorStore';

export function zoomBy(factor: number, origin?: { x: number; y: number }) {
  const { camera, setCamera } = useEditorStore.getState();
  setCamera({ zoom: camera.zoom * factor });
}

export function animateZoomTo(zoom: number, _opts?: { duration?: number }) {
  const { setCamera } = useEditorStore.getState();
  setCamera({ zoom });
}

export function fitAll() {
  const { setCamera } = useEditorStore.getState();
  setCamera({ x: 0, y: 0, zoom: 1 });
}

export function fitSelection() {
  const { setCamera } = useEditorStore.getState();
  setCamera({ x: 0, y: 0, zoom: 1 });
}

export function panWithInertia(_vx: number, _vy: number) {
  // stub
}
