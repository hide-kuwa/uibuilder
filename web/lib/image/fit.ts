export interface FitRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function objectFit(
  container: { w: number; h: number },
  image: { w: number; h: number },
  fit: 'contain' | 'cover',
  position: { x: number; y: number } = { x: 0.5, y: 0.5 },
): FitRect {
  let scale = 1;
  if (fit === 'contain') {
    scale = Math.min(container.w / image.w, container.h / image.h);
  } else {
    scale = Math.max(container.w / image.w, container.h / image.h);
  }
  const w = image.w * scale;
  const h = image.h * scale;
  const x = (container.w - w) * position.x;
  const y = (container.h - h) * position.y;
  return { x, y, w, h };
}

export function normalizeCrop(
  crop: { x: number; y: number; w: number; h: number },
  natural: { w: number; h: number },
) {
  const x = Math.max(0, Math.min(crop.x, natural.w - crop.w));
  const y = Math.max(0, Math.min(crop.y, natural.h - crop.h));
  const w = Math.min(crop.w, natural.w);
  const h = Math.min(crop.h, natural.h);
  return { x, y, w, h };
}
