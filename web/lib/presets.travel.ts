import { newId } from '@/lib/ids'
import type { ComponentNode } from '@/types/editor'

// タグ設計
export type DomainTag = 'common' | 'travel' | 'accounting'
export type PresetTag = DomainTag | 'card' | 'map' | 'share' | 'chart' | 'analytics'

export type PresetDef = {
  id: string
  displayName: string
  tags: PresetTag[]
  tree: ComponentNode
}

// 共通のカード子要素
const mapCardChildren = (useJapanMap: boolean): ComponentNode[] => ([
  { id: newId('n'), type: 'PrefShareBar', props: {} },
  { id: newId('n'), type: useJapanMap ? 'JapanMap' : 'PrefGridMap', props: {} },
  { id: newId('n'), type: 'SaveMapBar', props: {} },
  {
    id: newId('n'),
    type: 'DownloadPNG',
    props: { targetId: 'mapCard', fileName: 'my-map.png' },
  },
])

export const preset_travel_map_share_save_card_grid: PresetDef = {
  id: 'preset.travel.map.share.save.card.grid',
  displayName: 'JapanMap + Share + Save（Grid）',
  tags: ['travel', 'card', 'map', 'share'],
  tree: {
    id: newId('n'),
    type: 'Card',
    props: { title: '地図コレ', className: 'w-[640px] min-h-[420px]', id: 'mapCard' },
    children: mapCardChildren(false),
  },
}

// JapanMap が存在する場合のプリセット（SVG版）
export const maybeJapanMapPreset = (hasJapanMap: boolean): PresetDef | null => {
  if (!hasJapanMap) return null
  return {
    id: 'preset.travel.map.share.save.card.svg',
    displayName: 'JapanMap + Share + Save（SVG）',
    tags: ['travel', 'card', 'map', 'share'],
    tree: {
      id: newId('n'),
      type: 'Card',
      props: { title: '地図コレ（SVG）', className: 'w-[720px] min-h-[480px]', id: 'mapCard' },
      children: mapCardChildren(true),
    },
  }
}
