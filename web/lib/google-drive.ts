'use client'

import type { PrefName } from './prefectures'

let _gisLoaded = false
let _token: string | null = null

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!

function loadGis(): Promise<void> {
  if (_gisLoaded) return Promise.resolve()
  return new Promise((res, rej) => {
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.onload = () => { _gisLoaded = true; res() }
    s.onerror = () => rej(new Error('Failed to load GIS'))
    document.head.appendChild(s)
  })
}

export async function ensureAuth(): Promise<string> {
  if (typeof window === 'undefined') throw new Error('client only')
  await loadGis()
  if (_token) return _token

  // @ts-ignore
  const tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/drive.file',
    prompt: '', // 既に許可済みなら無音
    callback: (resp: any) => {},
  })

  _token = await new Promise<string>((resolve, reject) => {
    tokenClient.requestAccessToken({
      prompt: 'consent',
      callback: (r: any) => r && r.access_token ? resolve(r.access_token) : reject(new Error('No token')),
    })
  })
  return _token!
}

async function gfetch(path: string, init: RequestInit = {}) {
  const token = await ensureAuth()
  const resp = await fetch(`https://www.googleapis.com/drive/v3${path}`, {
    ...init,
    headers: { ...(init.headers || {}), Authorization: `Bearer ${token}` },
  })
  if (!resp.ok) throw new Error(`Drive API ${resp.status}: ${await resp.text()}`)
  return resp
}

async function ensureFolderByName(name: string, parentId?: string): Promise<string> {
  const q = encodeURIComponent(`name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId ?? 'root'}' in parents and trashed=false`)
  const r = await gfetch(`/files?q=${q}&fields=files(id,name)`)
  const j = await r.json()
  if (j.files?.[0]?.id) return j.files[0].id

  const meta = { name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId ?? 'root'] }
  const token = await ensureAuth()
  const resp = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(meta),
  })
  if (!resp.ok) throw new Error(`create folder failed: ${await resp.text()}`)
  const created = await resp.json()
  return created.id as string
}

export async function ensureGeoKorePath(pref: PrefName): Promise<{ rootId: string; prefId: string }> {
  const rootId = await ensureFolderByName('地図コレ')
  const prefId = await ensureFolderByName(pref, rootId)
  return { rootId, prefId }
}

export async function uploadImageToPrefecture(file: File, pref: PrefName): Promise<{ id: string; name: string }> {
  const { prefId } = await ensureGeoKorePath(pref)

  const boundary = '-------314159265358979323846'
  const delimiter = `\r\n--${boundary}\r\n`
  const closeDelim = `\r\n--${boundary}--`

  const metadata = {
    name: `${pref}_${new Date().toISOString().replace(/[:.]/g,'')}_${file.name}`,
    parents: [prefId],
    mimeType: file.type || 'image/jpeg',
  }

  const metaPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`
  const fileContent = await file.arrayBuffer()
  const mediaPart = `${delimiter}Content-Type: ${metadata.mimeType}\r\n\r\n`
  const body = new Blob([metaPart, mediaPart, fileContent, closeDelim], { type: `multipart/related; boundary=${boundary}` })

  const token = await ensureAuth()
  const resp = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,parents', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body,
  })
  if (!resp.ok) throw new Error(`upload failed: ${await resp.text()}`)
  return await resp.json()
}

export async function listPrefImages(pref: PrefName): Promise<Array<{ id: string; name: string }>> {
  const { prefId } = await ensureGeoKorePath(pref)
  const q = encodeURIComponent(`'${prefId}' in parents and mimeType contains 'image/' and trashed=false`)
  const r = await gfetch(`/files?q=${q}&fields=files(id,name,thumbnailLink,webContentLink)&pageSize=1000`)
  const j = await r.json()
  return j.files ?? []
}

export async function downloadFileBlob(fileId: string): Promise<Blob> {
  const token = await ensureAuth()
  const r = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, { headers: { Authorization: `Bearer ${token}` } })
  if (!r.ok) throw new Error(`download failed: ${await r.text()}`)
  return await r.blob()
}
