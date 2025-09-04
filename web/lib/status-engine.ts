import type { NodeStatus, StatusConfig, MotionPresetId } from '@/types/status'
import { defaultStatusConfig } from '@/types/status'

// 簡易ブレンド（alpha 0.35 固定の乗算風）
function blend(base: string, over: string): string {
  const toRgb = (c: string) => {
    const ctx = document.createElement('canvas').getContext('2d')!
    ctx.fillStyle = c; const m = ctx.fillStyle as string
    // ブラウザに任せて正規化 → rgb(r, g, b)
    const nums = m.match(/\d+/g)?.map(Number) ?? [0,0,0]
    return { r: nums[0], g: nums[1], b: nums[2] }
  }
  const b = toRgb(base), o = toRgb(over)
  const a = 0.35
  const r = Math.round((1-a)*b.r + a*o.r)
  const g = Math.round((1-a)*b.g + a*o.g)
  const v = Math.round((1-a)*b.b + a*o.b)
  return `rgb(${r}, ${g}, ${v})`
}

export function computeBgColor(status: NodeStatus, cfg?: StatusConfig): string {
  const conf = cfg ?? defaultStatusConfig
  let color = conf.base[status.base].color
  const overlays = [...status.overlays]

  const ordered = conf.compose.order === 'priority'
    ? overlays.sort((a,b)=> (conf.overlay[b]?.priority ?? 0) - (conf.overlay[a]?.priority ?? 0))
    : overlays

  for (const ov of ordered) {
    const rule = conf.overlay[ov]; if (!rule) continue
    const mode = rule.mode ?? conf.compose.colorMode
    if (mode === 'override') color = rule.color
    else if (mode === 'blend') color = blend(color, rule.color)
    else if (mode === 'glow')  color = blend(color, rule.color) // 実際の発光はエフェクトで付与
  }
  return color
}

// 既存の runMotion と接続するための形に変換
export function buildMotionFromStatus(id: string, status: NodeStatus, cfg?: StatusConfig) {
  const conf = cfg ?? defaultStatusConfig
  const baseFx = conf.base[status.base]?.effects ?? []
  const overlayFx = status.overlays.flatMap(o => conf.overlay[o]?.effects ?? [])
  const all: MotionPresetId[] = [...new Set([...baseFx, ...overlayFx])].filter(x => x !== 'none')

  return {
    mount: all,
    hoverEnter: overlayFx, // 「行きたい」「写真登録」などをホバーで強調したいとき
    hoverLeave: [],
  }
}
