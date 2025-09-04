'use client'
import { useEffect, useRef, useState } from 'react'
import { PREFS, type PrefName } from '@/lib/prefectures'
import { uploadImageToPrefecture, listPrefImages, downloadFileBlob } from '@/lib/google-drive'

export default function DriveUploader({ defaultPref }: { defaultPref?: PrefName }) {
  const [pref, setPref] = useState<PrefName>(defaultPref ?? '東京都')
  const [busy, setBusy] = useState(false)
  const [files, setFiles] = useState<Array<{ id:string; name:string }>>([])
  const inputRef = useRef<HTMLInputElement|null>(null)

  const refresh = async () => {
    try { setBusy(true); setFiles(await listPrefImages(pref)) } finally { setBusy(false) }
  }
  useEffect(() => { refresh() }, [pref])

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fs = e.target.files
    if (!fs?.length) return
    setBusy(true)
    try {
      for (const f of Array.from(fs)) { await uploadImageToPrefecture(f, pref) }
      await refresh()
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const preview = async (id: string) => {
    const blob = await downloadFileBlob(id)
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="mb-2 text-sm font-medium text-gray-700">写真アップロード</div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <select value={pref} onChange={(e)=> setPref(e.target.value as PrefName)} className="rounded-md border px-2 py-2 text-sm">
          {PREFS.map(p => <option key={p}>{p}</option>)}
        </select>
        <label className="inline-flex items-center gap-2">
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={onPick} />
        </label>
      </div>

      <div className="mb-2 text-xs text-gray-500">保存先: 地図コレ / {pref} / 写真</div>
      {busy && <div className="text-xs text-gray-500">処理中...</div>}

      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
        {files.map(f => (
          <button key={f.id} onClick={()=>preview(f.id)} className="truncate rounded-md border px-2 py-2 text-left text-xs hover:bg-black/5">
            {f.name}
          </button>
        ))}
        {files.length === 0 && !busy && <div className="text-xs text-gray-500">まだ写真がありません</div>}
      </div>
    </div>
  )
}
