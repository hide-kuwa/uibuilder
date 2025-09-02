export const runtime = 'edge'

const decodeBool = (b64: string): number[] => {
  try {
    const bin = atob(b64)
    const bytes = Array.from(bin, ch => ch.charCodeAt(0))
    const out: number[] = []
    for (const byte of bytes) {
      for (let bit = 7; bit >= 0 && out.length < 47; bit--) {
        out.push(((byte >> bit) & 1) ? 2 : 0) // 1=塗り→"行った"(2)として描画
      }
    }
    while (out.length < 47) out.push(0)
    return out.slice(0, 47)
  } catch {
    return Array(47).fill(0)
  }
}

export async function GET(req: Request, { params }: { params: { p: string } }) {
  const vals = decodeBool(params.p)
  const t = new URL(req.url).searchParams.get('t')
  // 再利用：列挙APIに合わせた描画
  const url = new URL('/api/og/' + btoa(String.fromCharCode(...pack2bit(vals))), 'http://x')
  if (t) url.searchParams.set('t', t)
  return fetch(url) // 2bitへ変換して転送
}

function pack2bit(vals: number[]): number[] {
  const bytes: number[] = []
  for (let i = 0; i < 47; i += 4) {
    const a = vals[i] ?? 0
    const b = vals[i + 1] ?? 0
    const c = vals[i + 2] ?? 0
    const d = vals[i + 3] ?? 0
    bytes.push((a << 6) | (b << 4) | (c << 2) | d)
  }
  return bytes
}

