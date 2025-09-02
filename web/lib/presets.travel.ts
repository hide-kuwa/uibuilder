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

export const preset_travel_map_enum_card: PresetDef = {
  id: 'preset.travel.map.enum.card',
  displayName: 'JapanMap（行きたい/行った/住んだ）',
  tags: ['travel', 'card', 'map', 'share'],
  tree: {
    id: newId('n'),
    type: 'Card',
    props: { title: '地図コレ（列挙）', className: 'w-[720px] min-h-[500px]', id: 'mapCard' },
    children: [
      { id: newId('n'), type: 'PrefEnumLegend', props: {} },
      { id: newId('n'), type: 'PrefEnumShareBar', props: {} },
      { id: newId('n'), type: 'PrefEnumGridMap', props: {} },
      { id: newId('n'), type: 'SaveMapBarEnum', props: {} },
      { id: newId('n'), type: 'DownloadPNG', props: { targetId: 'mapCard', fileName: 'my-map.png' } },
    ],
  },
}

export const preset_travel_map_enum_svg_card: PresetDef = {
  id: 'preset.travel.map.enum.svg.card',
  displayName: 'JapanMap（SVG列挙）カード',
  tags: ['travel', 'card', 'map', 'share'],
  tree: {
    id: newId('n'),
    type: 'Card',
    props: { title: '地図コレ（SVG）', className: 'w-[720px] min-h-[520px]', id: 'mapCard' },
    children: [
      { id: newId('n'), type: 'PrefEnumLegend', props: {} },
      { id: newId('n'), type: 'PrefEnumShareBar', props: {} },
      { id: newId('n'), type: 'JapanMapEnumSVG', props: {} },
      { id: newId('n'), type: 'SaveMapBarEnum', props: {} },
      { id: newId('n'), type: 'DownloadPNG', props: { targetId: 'mapCard', fileName: 'my-map.png' } },
    ],
  },
}

export const preset_travel_landing_svg: PresetDef = {
  id: 'preset.travel.landing.svg',
  displayName: 'Travel Landing（SVG）',
  tags: ['travel', 'page', 'landing', 'common'],
  tree: {
    id: newId('n'),
    type: 'BackgroundGradient',
    props: { from: '#0ea5e9', to: '#22c55e', angle: 135, pattern: 'none' },
    children: [
      {
        id: newId('n'),
        type: 'Section',
        props: { max: 'xl', pad: 'lg', align: 'center' },
        children: [
          {
            id: newId('n'),
            type: 'Hero',
            props: {
              title: '旅の地図',
              subtitle: '行きたい・行った・住んだ',
              ctaText: '地図を作る',
              ctaHref: '/travel/demo',
            },
          },
          {
            id: newId('n'),
            type: 'Card',
            props: { title: '地図コレ（SVG）', className: 'w-[720px] min-h-[520px]', id: 'mapCard' },
            children: [
              { id: newId('n'), type: 'PrefEnumLegend', props: {} },
              { id: newId('n'), type: 'PrefEnumShareBar', props: {} },
              { id: newId('n'), type: 'JapanMapEnumSVG', props: {} },
              { id: newId('n'), type: 'SaveMapBarEnum', props: {} },
              { id: newId('n'), type: 'DownloadPNG', props: { targetId: 'mapCard', fileName: 'my-map.png' } },
            ],
          },
        ],
      },
    ],
  },
}

export const preset_theme_ocean: PresetDef = {
  id: 'preset.theme.ocean',
  displayName: 'Theme (Ocean)',
  tags: ['common'],
  tree: { id: newId('n'), type: 'MapThemeProvider', props: { id: 'ocean' }, children: [] },
}

export const preset_theme_sakura: PresetDef = {
  id: 'preset.theme.sakura',
  displayName: 'Theme (Sakura)',
  tags: ['common'],
  tree: { id: newId('n'), type: 'MapThemeProvider', props: { id: 'sakura' }, children: [] },
}
