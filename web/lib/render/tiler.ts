/**
 * v13-1: Canvas タイル描画 + OffscreenCanvas（MVP）
 *
 * - ビューポートをタイル（既定 768px）に分割し、見えているタイルだけ描画
 * - OffscreenCanvas が使える環境では ImageBitmap 経由で転送してオーバードローを削減
 * - DPR（devicePixelRatio）対応
 * - 依存追加なし。描画内容はコールバックで注入する（UIビルダーの既存レンダラを想定）。
 */

export type WorldRect = { x: number; y: number; w: number; h: number }
export type Camera = { x: number; y: number; scale: number } // world→screen: (p - {x,y}) * scale

export type DrawTileFn = (ctx: CanvasRenderingContext2D, tileWorldRect: WorldRect, cam: Camera, dpr: number) => void

type TileKey = string // `${ix},${iy},z`
type Tile = {
  key: TileKey
  ix: number
  iy: number
  z: number
  bmp: ImageBitmap | null
  stamp: number
}

export type TilerOptions = {
  tileSize?: number // CSS px（DPR前）
  dpr?: number
  maxConcurrentRenders?: number
}

export class CanvasTiler {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private opts: Required<TilerOptions>

  private cam: Camera = { x: 0, y: 0, scale: 1 }
  private drawTile: DrawTileFn | null = null
  private tiles = new Map<TileKey, Tile>()
  private queue: Tile[] = []
  private inflight = 0
  private rafId: number | null = null
  private resizeObserver?: ResizeObserver
  private sceneRevision = 0

  constructor(canvas: HTMLCanvasElement, opts?: TilerOptions) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('2D context unavailable')
    this.canvas = canvas
    this.ctx = ctx
    this.opts = {
      tileSize: opts?.tileSize ?? 768,
      dpr: opts?.dpr ?? window.devicePixelRatio || 1,
      maxConcurrentRenders: opts?.maxConcurrentRenders ?? 2,
    }
    this.setupResize()
  }

  setDpr(dpr: number) {
    this.opts.dpr = Math.max(1, dpr || 1)
    this.resizeNow()
    this.invalidateAll()
  }
  setCamera(cam: Partial<Camera>) {
    this.cam = { ...this.cam, ...cam }
    this.requestFrame()
  }
  setDraw(fn: DrawTileFn) {
    this.drawTile = fn
    this.invalidateAll()
  }
  setSceneRevision(rev: number) {
    // シーンが変わったら無条件にタイル再生成
    if (rev !== this.sceneRevision) {
      this.sceneRevision = rev
      this.invalidateAll()
    }
  }

  destroy() {
    this.resizeObserver?.disconnect()
    if (this.rafId) cancelAnimationFrame(this.rafId)
    this.tiles.forEach((t) => t.bmp?.close?.())
    this.tiles.clear()
  }

  /** すべてのタイルを破棄して再描画 */
  invalidateAll() {
    this.tiles.forEach((t) => t.bmp?.close?.())
    this.tiles.clear()
    this.queue.length = 0
    this.inflight = 0
    this.requestFrame()
  }

  // ====== private ======
  private setupResize() {
    this.resizeObserver = new ResizeObserver(() => this.resizeNow())
    this.resizeObserver.observe(this.canvas)
    this.resizeNow()
  }
  private resizeNow() {
    const dpr = this.opts.dpr
    const rw = Math.max(1, Math.floor(this.canvas.clientWidth * dpr))
    const rh = Math.max(1, Math.floor(this.canvas.clientHeight * dpr))
    if (this.canvas.width !== rw || this.canvas.height !== rh) {
      this.canvas.width = rw
      this.canvas.height = rh
      this.ctx.setTransform(1, 0, 0, 1, 0, 0)
      this.ctx.clearRect(0, 0, rw, rh)
      this.requestFrame()
    }
  }
  private requestFrame() {
    if (this.rafId != null) return
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null
      this.renderFrame()
    })
  }

  private renderFrame() {
    const { width, height } = this.canvas
    const { dpr, tileSize } = this.opts
    const cam = this.cam
    // 背景を軽くクリア（オーバードローはタイルで抑制）
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.clearRect(0, 0, width, height)

    // 可視ワールド矩形
    const vw = width / dpr
    const vh = height / dpr
    const worldRect: WorldRect = {
      x: cam.x,
      y: cam.y,
      w: vw / cam.scale,
      h: vh / cam.scale,
    }

    // タイルグリッド（CSS pxベース）
    const ts = tileSize
    const x0 = Math.floor((worldRect.x) / ts) - 1
    const y0 = Math.floor((worldRect.y) / ts) - 1
    const x1 = Math.ceil((worldRect.x + worldRect.w) / ts) + 1
    const y1 = Math.ceil((worldRect.y + worldRect.h) / ts) + 1

    const z = Math.round(cam.scale * 1000) // 簡易にスケールで別タイル扱い
    const needed: TileKey[] = []
    for (let iy = y0; iy <= y1; iy++) {
      for (let ix = x0; ix <= x1; ix++) {
        const key: TileKey = `${ix},${iy},${z}`
        needed.push(key)
        let tile = this.tiles.get(key)
        if (!tile) {
          tile = { key, ix, iy, z, bmp: null, stamp: 0 }
          this.tiles.set(key, tile)
          this.queue.push(tile)
        }
        // 画面へ描画（ビットマップが準備できていれば）
        if (tile.bmp) {
          const sx = Math.floor((ix * ts - cam.x) * cam.scale * dpr)
          const sy = Math.floor((iy * ts - cam.y) * cam.scale * dpr)
          const sw = Math.ceil(ts * cam.scale * dpr)
          const sh = Math.ceil(ts * cam.scale * dpr)
          this.ctx.drawImage(tile.bmp, sx, sy, sw, sh)
        }
      }
    }
    // 不要タイルを掃除（見えていないもの）
    for (const [k, t] of this.tiles) {
      if (!needed.includes(k)) {
        t.bmp?.close?.()
        this.tiles.delete(k)
      }
    }
    // レンダキューを進める
    this.kickQueue()
  }

  private kickQueue() {
    const { maxConcurrentRenders } = this.opts
    while (this.inflight < maxConcurrentRenders && this.queue.length > 0) {
      const t = this.queue.shift()!
      // 既にbmpがあるならスキップ
      if (t.bmp) continue
      this.inflight++
      this.renderTile(t).finally(() => {
        this.inflight--
        this.requestFrame()
      })
    }
  }

  private async renderTile(tile: Tile) {
    const { tileSize, dpr } = this.opts
    const ts = tileSize
    const cssW = ts
    const cssH = ts
    const pxW = Math.max(1, Math.floor(cssW * dpr))
    const pxH = Math.max(1, Math.floor(cssH * dpr))

    const useOffscreen = typeof OffscreenCanvas !== 'undefined'
    const off = useOffscreen ? new OffscreenCanvas(pxW, pxH) : document.createElement('canvas')
    ;(off as HTMLCanvasElement).width = pxW
    ;(off as HTMLCanvasElement).height = pxH
    const octx = off.getContext('2d')
    if (!octx) return

    // タイルのワールド矩形
    const wx = tile.ix * ts
    const wy = tile.iy * ts
    const wr: WorldRect = { x: wx, y: wy, w: ts, h: ts }

    // タイル内部の描画用変換（world→tile-canvas px）
    octx.save()
    octx.scale(dpr * this.cam.scale, dpr * this.cam.scale)
    octx.translate(-wx + this.cam.x, -wy + this.cam.y)

    // 背景を軽く塗る（デバッグ/透明防止）
    octx.fillStyle = '#000000'
    octx.fillRect(0, 0, pxW, pxH)

    // 実際の描画
    if (this.drawTile) {
      try {
        this.drawTile(octx as unknown as CanvasRenderingContext2D, wr, this.cam, dpr)
      } catch {
        // no-op：描画に失敗しても続行
      }
    }
    octx.restore()

    // ImageBitmap へ
    let bmp: ImageBitmap
    try {
      if (useOffscreen) {
        // @ts-expect-error: TS can't narrow
        bmp = (off as OffscreenCanvas).transferToImageBitmap()
      } else {
        // @ts-expect-error
        bmp = await createImageBitmap(off)
      }
    } catch {
      return
    }
    // 既存があれば閉じる
    this.tiles.get(tile.key)?.bmp?.close?.()
    tile.bmp = bmp
    tile.stamp = performance.now()
  }
}
