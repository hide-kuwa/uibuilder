export function sizeGuardOk(bytes: number): boolean {
  const limit = 2 * 1024 * 1024
  return bytes <= limit
}

