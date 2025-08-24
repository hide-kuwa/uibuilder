import { useEditorStore } from '@/store/editorStore';
import { MIN_ZOOM, MAX_ZOOM, FIT_PADDING, PAN_INERTIA } from '@/lib/layout/constants';

function clampZoom(z: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
}

export function zoomBy(factor: number, anchor?: { x: number; y: number }) {
  const { camera, setCamera } = useEditorStore.getState();
  const nextZoom = clampZoom(camera.zoom * factor);
  let x = camera.x;
  let y = camera.y;
  if (anchor) {
    const wx = (anchor.x - camera.x) / camera.zoom;
    const wy = (anchor.y - camera.y) / camera.zoom;
    x = anchor.x - wx * nextZoom;
    y = anchor.y - wy * nextZoom;
  }
  setCamera({ x, y, zoom: nextZoom });
}

export function animateZoomTo(
  target: { x: number; y: number; zoom: number },
  opts?: { duration?: number }
): Promise<void> {
  const store = useEditorStore.getState();
  const to = { x: target.x, y: target.y, zoom: clampZoom(target.zoom) };
  const prefersReduce =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration =
    (opts?.duration ??
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--motion-base')
      )) || 200;
  if (prefersReduce || duration === 0) {
    store.setCamera(to);
    return Promise.resolve();
  }
  const from = store.camera;
  const start = performance.now();
  return new Promise((resolve) => {
    function frame(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const x = from.x + (to.x - from.x) * eased;
      const y = from.y + (to.y - from.y) * eased;
      const z = from.zoom + (to.zoom - from.zoom) * eased;
      store.setCamera({ x, y, zoom: z });
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
}

export function fitRect(
  camera: { x: number; y: number; zoom: number },
  rect: { x: number; y: number; w: number; h: number },
  opts?: { padding?: number }
): { x: number; y: number; zoom: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pad = opts?.padding ?? 0;
  const worldX = camera.x + rect.x / camera.zoom;
  const worldY = camera.y + rect.y / camera.zoom;
  const worldW = rect.w / camera.zoom;
  const worldH = rect.h / camera.zoom;
  const padW = worldW * pad;
  const padH = worldH * pad;
  const zoom = clampZoom(
    Math.min(vw / (worldW + padW * 2), vh / (worldH + padH * 2))
  );
  const cx = worldX + worldW / 2;
  const cy = worldY + worldH / 2;
  const x = cx - vw / (2 * zoom);
  const y = cy - vh / (2 * zoom);
  return { x, y, zoom };
}

export function fitAll(): void {
  const store = useEditorStore.getState();
  const nodes = store.tree;
  if (!nodes.length) return;
  const boxes = nodes
    .map((n) => ({ x: n.props?.x || 0, y: n.props?.y || 0, w: n.props?.w || 0, h: n.props?.h || 0 }));
  const x1 = Math.min(...boxes.map((b) => b.x));
  const y1 = Math.min(...boxes.map((b) => b.y));
  const x2 = Math.max(...boxes.map((b) => b.x + b.w));
  const y2 = Math.max(...boxes.map((b) => b.y + b.h));
  const bounds = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
  fitBounds(bounds);
}

export function fitSelection(): void {
  const store = useEditorStore.getState();
  const bounds = store.getSelectionBounds();
  if (bounds) fitBounds(bounds);
  else fitAll();
}

function fitBounds(bounds: { x: number; y: number; w: number; h: number }) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const padW = bounds.w * FIT_PADDING;
  const padH = bounds.h * FIT_PADDING;
  const zoom = clampZoom(Math.min(vw / (bounds.w + padW * 2), vh / (bounds.h + padH * 2)));
  const cx = bounds.x + bounds.w / 2;
  const cy = bounds.y + bounds.h / 2;
  const x = cx - vw / (2 * zoom);
  const y = cy - vh / (2 * zoom);
  useEditorStore.getState().setCamera({ x, y, zoom });
}

export function panWithInertia(vx: number, vy: number) {
  let { camera } = useEditorStore.getState();
  let x = camera.x;
  let y = camera.y;
  let last = performance.now();
  function step(now: number) {
    const dt = now - last;
    last = now;
    x -= vx * dt;
    y -= vy * dt;
    useEditorStore.getState().setCamera({ x, y });
    vx *= PAN_INERTIA;
    vy *= PAN_INERTIA;
    if (Math.abs(vx) > 0.01 || Math.abs(vy) > 0.01) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
