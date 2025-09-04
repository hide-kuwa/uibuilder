import type { NodeStatusState, AnyStatus } from '@/types/status'
import type { MotionEffect } from '@/types/motion'
import { useStatusConfig } from '@/stores/statusConfig'

/** 背景色を決定（ベース色に、オーバーレイがあれば “縁取り”など拡張も後で可） */
export function computeBgColor(state: NodeStatusState): string {
  const { config } = useStatusConfig.getState()
  return config[state.base]?.color ?? '#eee'
}

/** 常時＆ホバー用の Motion を合成（オーバーレイは “追加ブースト” として上書き） */
export function buildMotionFromStatus(nodeId: string, state: NodeStatusState): {
  mount: MotionEffect[]
  hoverEnter: MotionEffect[]
  hoverLeave: MotionEffect[]
} {
  const { config } = useStatusConfig.getState()

  const pick = (key: AnyStatus) => config[key]
  const eff = [] as MotionEffect[]
  const hover = [] as MotionEffect[]

  // base 常時
  const base = pick(state.base)
  if (base.motionPreset) {
    eff.push({
      id: `${nodeId}-base`,
      preset: base.motionPreset,
      strength: base.motionStrength ?? 40,
      runWhen: ['mount'],
      target: { type: 'nodeId', value: nodeId },
    })
  }
  if (base.hoverPreset) {
    hover.push({
      id: `${nodeId}-base-hover`,
      preset: base.hoverPreset,
      strength: base.hoverStrength ?? 30,
      runWhen: ['hoverEnter'],
      target: { type: 'nodeId', value: nodeId },
    })
  }

  // overlay は加算（want = 光る、hasPhoto = 小刻み 等、上書きで強める）
  for (const ov of state.overlays) {
    const s = pick(ov)
    if (s.motionPreset) {
      eff.push({
        id: `${nodeId}-${ov}`,
        preset: s.motionPreset,
        strength: s.motionStrength ?? 30,
        runWhen: ['mount'],
        target: { type: 'nodeId', value: nodeId },
      })
    }
    if (s.hoverPreset) {
      hover.push({
        id: `${nodeId}-${ov}-hover`,
        preset: s.hoverPreset,
        strength: s.hoverStrength ?? 30,
        runWhen: ['hoverEnter'],
        target: { type: 'nodeId', value: nodeId },
      })
    }
  }

  return {
    mount: eff,
    hoverEnter: hover,
    hoverLeave: [], // 必要ならここで “戻すエフェクト” を定義。今は leave で remove する運用。
  }
}
