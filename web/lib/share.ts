export type SerializableProject = {
  schemaVersion: number
  createdAt: number
  elements: any
  meta?: any
}

function toBytes(s: string) {
  return new TextEncoder().encode(s)
}
function fromBytes(a: Uint8Array) {
  return new TextDecoder().decode(a)
}
function b64uEncode(bytes: Uint8Array) {
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
  const b64 = btoa(s)
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function b64uDecode(s: string) {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
  const bin = atob(b64 + pad)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

export function encodeShare(data: SerializableProject) {
  const json = JSON.stringify(data)
  return b64uEncode(toBytes(json))
}

export function decodeShare(s: string): SerializableProject | null {
  try {
    const json = fromBytes(b64uDecode(s))
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function serializeProject(state: any): SerializableProject {
  return {
    schemaVersion: 1,
    createdAt: Date.now(),
    elements: state?.elements ?? [],
    meta: state?.meta ?? {},
  }
}
