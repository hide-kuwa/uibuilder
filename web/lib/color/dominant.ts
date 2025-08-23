export async function computeDominantColor(
  blob: Blob,
  opts?: { downscale?: number; ignoreAlphaBelow?: number },
): Promise<string> {
  const downscale = opts?.downscale ?? 64;
  const alphaThreshold = opts?.ignoreAlphaBelow ?? 16;
  const bitmap = await createImageBitmap(blob, {
    imageOrientation: 'from-image',
  } as any);
  const scale = Math.min(1, downscale / Math.min(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const data = ctx.getImageData(0, 0, w, h).data;
  const hist = new Map<number, number>();
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < alphaThreshold) continue;
    const r = data[i] >> 3;
    const g = data[i + 1] >> 3;
    const b = data[i + 2] >> 3;
    const key = (r << 10) | (g << 5) | b;
    hist.set(key, (hist.get(key) || 0) + 1);
  }
  let maxKey = 0;
  let max = -1;
  hist.forEach((count, key) => {
    if (count > max) {
      max = count;
      maxKey = key;
    }
  });
  const r5 = (maxKey >> 10) & 0x1f;
  const g5 = (maxKey >> 5) & 0x1f;
  const b5 = maxKey & 0x1f;
  const r8 = (r5 << 3) | (r5 >> 2);
  const g8 = (g5 << 3) | (g5 >> 2);
  const b8 = (b5 << 3) | (b5 >> 2);
  const hex = `#${((r8 << 16) | (g8 << 8) | b8).toString(16).padStart(6, '0')}`;
  return hex;
}
