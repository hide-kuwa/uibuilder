'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { PREFS, type PrefName } from '@/lib/prefectures'
import { ensureAuth, listPrefImages, downloadFileBlob } from '@/lib/google-drive'

type ImgInfo = { url: string; img: HTMLImageElement; w: number; h: number }

const W = 1280  // 出力幅
const H = 720   // 出力高さ
const DURATION = 7.0 // 秒
const GAP = 8   // 画像間ギャップ(px)

function chooseMime(): string {
  const cand = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ]
  for (const t of cand) if ((window as any).MediaRecorder?.isTypeSupported?.(t)) return t
  return 'video/webm'
}

export default function SharePage() {
  const [pref, setPref] = useState<PrefName>('東京都')
  const [busy, setBusy] = useState(false)
  const [images, setImages] = useState<ImgInfo[]>([])
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)
  const [fps, setFps] = useState(60)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animRef = useRef<number | null>(null)

  useEffect(() => {
    const init = new URLSearchParams(location.search).get('pref')
    if (init) setPref(init as PrefName)
  }, [])

  // 画像読込
  const load = async () => {
    setBusy(true)
    setDownloadUrl((u)=>{ if (u) URL.revokeObjectURL(u); return null })
    try {
      await ensureAuth()
      const files = await listPrefImages(pref)
      const pick = files.slice(0, 24) // 取りすぎると重いので抑制
      const out: ImgInfo[] = []
      for (const f of pick) {
        const blob = await downloadFileBlob(f.id)
        const url = URL.createObjectURL(blob)
        const img = new Image()
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = (e) => reject(e)
          img.src = url
        })
        out.push({ url, img, w: img.naturalWidth, h: img.naturalHeight })
      }
      setImages(out)
    } catch (e) {
      console.error(e)
      alert('画像の取得でエラーが発生しました')
      setImages([])
    } finally {
      setBusy(false)
    }
  }
  useEffect(() => { load(); return () => { images.forEach(i=>URL.revokeObjectURL(i.url)) } /* eslint-disable-next-line */ }, [pref])

  // リボン1本を描画（可変幅タイルを無限ループ）
  const drawRibbon = (
    ctx: CanvasRenderingContext2D,
    imgs: ImgInfo[],
    y: number,
    h: number,
    t: number,
    pxPerSec: number,
    dir: 'left' | 'right'
  ) => {
    if (!imgs.length) {
      // プレースホルダー
      ctx.fillStyle = '#eee'
      ctx.fillRect(0, y, W, h)
      return
    }
    // 各タイル幅を高さ基準で算出
    const widths = imgs.map(i => Math.max(60, (i.w / i.h) * h))
    const loopW = widths.reduce((a,b)=> a + b + GAP, 0)
    const v = (dir === 'left' ? -1 : 1) * pxPerSec
    // オフセット（常に 0..loopW ）
    let offset = ((t * v) % loopW + loopW) % loopW
    // 開始位置を左端に合わせる
    let x = -offset
    // 2周分描いて継ぎ目を消す
    for (let k = 0; k < 2 * imgs.length + 3; k++) {
      const i = imgs[k % imgs.length]
      const w = widths[k % widths.length]
      ctx.drawImage(i.img, x, y, w, h)
      x += w + GAP
      if (x > W) break
    }
    // 端フェード
    const gradL = ctx.createLinearGradient(0, 0, 120, 0)
    gradL.addColorStop(0, 'rgba(255,255,255,1)')
    gradL.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradL; ctx.fillRect(0, y, 120, h)
    const gradR = ctx.createLinearGradient(W-120, 0, W, 0)
    gradR.addColorStop(0, 'rgba(255,255,255,0)')
    gradR.addColorStop(1, 'rgba(255,255,255,1)')
    ctx.fillStyle = gradR; ctx.fillRect(W-120, y, 120, h)
  }

  const drawFrame = (ctx: CanvasRenderingContext2D, elapsed: number) => {
    ctx.clearRect(0,0,W,H)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0,0,W,H)

    const t = Math.min(elapsed, DURATION)
    // 上段/下段リボン
    const topH = Math.round(H * 0.28)
    const botH = Math.round(H * 0.28)
    drawRibbon(ctx, images, 40, topH, t, 120, 'left')
    drawRibbon(ctx, images.slice().reverse(), H - botH - 40, botH, t, 100, 'right')

    // タイトル帯
    const inT = Math.min(1, Math.max(0, (t - 0.2) / 0.9))   // 0.2s→1.1s
    const outT = Math.min(1, Math.max(0, (t - (DURATION-1.0)) / 1.0)) // 最後1sでアウト
    const ease = (x:number)=> 1 - Math.pow(1 - x, 3) // easeOutCubic
    const yBand = 40 + topH + 20
    const bandH = 140
    ctx.save()
    ctx.globalAlpha = 1 - outT
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, yBand, W, bandH)
    ctx.shadowColor = 'rgba(0,0,0,0.25)'
    ctx.shadowBlur = 16
    ctx.fillStyle = '#ffffff'
    ctx.font = `700 ${64}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto`
    const text = ` ${pref} `
    const tw = ctx.measureText(text).width
    const tx = (W - tw) / 2
    const ty = yBand + bandH/2 + 24
    // スライドイン
    const slide = (1 - ease(inT)) * 60
    ctx.fillText(text, tx, ty - slide)
    ctx.restore()

    // フェードイン/アウト黒幕
    const fadeIn = Math.max(0, 1 - (t / 0.8)) // 0.8s フェードイン
    const fadeOut = Math.max(0, (t - (DURATION - 0.8)) / 0.8)
    const overlay = Math.max(fadeIn, fadeOut)
    if (overlay > 0) {
      ctx.fillStyle = `rgba(0,0,0,${overlay})`
      ctx.fillRect(0,0,W,H)
    }
  }

  const start = async (doRecord: boolean) => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (!images.length) { alert('この都道府県に画像がありません'); return }
    setDownloadUrl((u)=>{ if (u) URL.revokeObjectURL(u); return null })
    const ctx = canvas.getContext('2d')!
    let startTs = performance.now()
    let chunks: BlobPart[] = []
    let rec: MediaRecorder | null = null

    if (doRecord) {
      const stream = (canvas as HTMLCanvasElement).captureStream(fps)
      const mime = chooseMime()
      rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 })
      rec.ondataavailable = (ev) => { if (ev.data?.size) chunks.push(ev.data) }
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: rec?.mimeType || 'video/webm' })
        const url = URL.createObjectURL(blob)
        setDownloadUrl(url)
        setRecording(false)
      }
      rec.start()
      setRecording(true)
    }

    const tick = (now: number) => {
      const t = (now - startTs) / 1000
      drawFrame(ctx, t)
      if (t < DURATION) {
        animRef.current = requestAnimationFrame(tick)
      } else {
        if (rec && rec.state !== 'inactive') rec.stop()
        animRef.current = null
      }
    }
    // 先頭フレームを描画してから開始（黒画面を避ける）
    drawFrame(ctx, 0)
    animRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current) }, [])

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Share Movie Maker</h1>
        <a href="/map" className="rounded-md border px-3 py-2 text-sm">← Back to map</a>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* 左パネル */}
        <section className="rounded-2xl border bg-white p-4">
          <div className="mb-2 text-sm font-medium text-gray-700">設定</div>
          <div className="space-y-3">
            <label className="block text-xs text-gray-500">
              都道府県
              <select value={pref} onChange={(e)=> setPref(e.target.value as PrefName)} className="mt-1 w-full rounded-md border px-2 py-2 text-sm">
                {PREFS.map(p => <option key={p}>{p}</option>)}
              </select>
            </label>

            <label className="block text-xs text-gray-500">
              FPS
              <input type="number" min={24} max={60} value={fps} onChange={(e)=> setFps(Math.max(24, Math.min(60, +e.target.value || 60)))} className="mt-1 w-full rounded-md border px-2 py-2 text-sm"/>
            </label>

            <div className="flex gap-2">
              <button disabled={busy || recording} onClick={()=> start(false)} className="rounded-md border px-3 py-2 text-sm disabled:opacity-50">▶︎ プレビュー</button>
              <button disabled={busy || recording || !images.length} onClick={()=> start(true)} className="rounded-md border px-3 py-2 text-sm disabled:opacity-50">● レンダリング&保存</button>
            </div>

            {busy && <div className="text-xs text-gray-500">画像を読み込み中…</div>}
            {!!downloadUrl && (
              <div className="text-xs">
                <a className="text-blue-600 underline" href={downloadUrl} download={`${pref}-share.webm`}>動画をダウンロード（WebM）</a>
              </div>
            )}
            {recording && <div className="text-xs text-gray-500">録画中…（自動で完了します）</div>}
          </div>
        </section>

        {/* 右：キャンバス */}
        <section className="rounded-2xl border bg-white p-3">
          <div className="mb-2 text-sm text-gray-700">プレビュー（{W}×{H}）</div>
          <div className="overflow-auto rounded-lg border bg-gray-50 p-2">
            <canvas ref={canvasRef} width={W} height={H} className="block max-w-full rounded bg-white shadow" />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            「レンダリング&保存」を押すと、{DURATION}秒の動画を WebM で生成します。SNS 用に MP4 が必要な場合は後で ffmpeg.wasm を足せます。
          </p>
        </section>
      </div>
    </div>
  )
}

