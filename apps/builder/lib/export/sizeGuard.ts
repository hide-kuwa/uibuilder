const LIMIT_BYTES = 2 * 1024 * 1024

export function sizeGuardOk(bytes: number): boolean {
  return bytes <= LIMIT_BYTES
}

