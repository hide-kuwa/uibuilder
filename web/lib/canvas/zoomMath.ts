export type ZoomPan = { zoom: number; ox: number; oy: number }

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

/**
 * Zoom anchored at the pointer (dy>0 => zoom out). Pointer is in client coords
 * relative to the canvas element (left/top basis).
 */
export function zoomAt(
  state: ZoomPan,
  dy: number,
  pointerX: number,
  pointerY: number,
  opts?: { min?: number; max?: number; speed?: number },
): ZoomPan {
  const min = opts?.min ?? 0.25
  const max = opts?.max ?? 4
  const speed = opts?.speed ?? 0.0015
  const z0 = state.zoom
  const factor = Math.exp(-dy * speed)
  const z1 = clamp(z0 * factor, min, max)

  // Keep pointer anchored in screen space by adjusting offsets
  // screen p = world * z + off  => world = (p - off)/z
  const wx = (pointerX - state.oy) / z0
  const wy = (pointerY - state.ox) / z0
  const ox1 = pointerY - wy * z1
  const oy1 = pointerX - wx * z1

  return { zoom: z1, ox: oy1, oy: ox1 }
}

