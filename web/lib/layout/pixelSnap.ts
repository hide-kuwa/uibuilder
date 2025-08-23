export function shouldShowPixelGrid(zoom: number): boolean {
  return zoom >= 4;
}

export function snapRectToPixels(
  rect: { x: number; y: number; w: number; h: number },
  zoom: number,
  devicePixelRatio: number,
  enabled: boolean
) {
  if (!enabled) return rect;
  const scale = zoom * devicePixelRatio;
  const snap = (v: number) => Math.round(v * scale) / scale;
  return {
    x: snap(rect.x),
    y: snap(rect.y),
    w: snap(rect.w),
    h: snap(rect.h),
  };
}
