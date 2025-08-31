export function b64uEncode(json: string) {
  const b = typeof window !== 'undefined' ? new TextEncoder().encode(json) : Buffer.from(json, 'utf8')
  let s = ''
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i])
  const b64 = typeof window !== 'undefined' ? btoa(s) : Buffer.from(s, 'binary').toString('base64')
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
export function b64uDecode(s: string) {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
  const bin = typeof window !== 'undefined' ? atob(b64 + pad) : Buffer.from(b64 + pad, 'base64').toString('binary')
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return new TextDecoder().decode(out)
}
