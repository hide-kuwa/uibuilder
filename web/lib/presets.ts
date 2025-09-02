import type { ComponentNode } from '@/types/editor'
import { newId } from './ids'
import { preset_travel_map_share_save_card_grid, maybeJapanMapPreset, type PresetDef } from './presets.travel'
export type { DomainTag, PresetTag, PresetDef } from './presets.travel'

export const cloneSubtree = (node: ComponentNode): ComponentNode => {
  return {
    ...node,
    id: newId('n'),
    children: node.children?.map(cloneSubtree),
  }
}

export const preset_japanMapCard_basic: PresetDef = {
  id: 'preset.jpmap.card.basic',
  displayName: 'JapanMap（カード/基本）',
  tags: ['common', 'map', 'card', 'analytics'],
  tree: {
    id: newId('n'),
    type: 'Card',
    props: { title: 'Japan Map', className: 'w-[520px] h-[360px]' } as any,
    children: [
      {
        id: newId('n'),
        type: 'JapanMap',
        props: {
          valuesByPref: {},
          selected: null,
        } as any,
      },
    ],
  },
}

export const preset_tripHeaderCard: PresetDef = {
  id: 'preset.travel.header.card',
  displayName: 'Trip Header（カード）',
  tags: ['travel', 'card'],
  tree: {
    id: newId('n'),
    type: 'Card',
    props: { title: '旅の概要', className: 'w-[520px] h-[160px]' } as any,
    children: [
      {
        id: newId('n'),
        type: 'TripHeader',
        props: { title: '北海道の旅', period: '2025/09/01–09/05', members: '4名', coverUrl: '' } as any,
      },
    ],
  },
}

export const preset_itineraryTimelineCard: PresetDef = {
  id: 'preset.travel.timeline.card',
  displayName: 'Itinerary Timeline（カード）',
  tags: ['travel', 'card'],
  tree: {
    id: newId('n'),
    type: 'Card',
    props: { title: '旅程', className: 'w-[560px] h-[360px]' } as any,
    children: [{ id: newId('n'), type: 'ItineraryTimeline', props: {} as any }],
  },
}

export const preset_travelPrefPaintCard: PresetDef = {
  id: 'preset.travel.prefpaint.card',
  displayName: '都道府県ぬりえ（カード）',
  tags: ['travel', 'card'],
  tree: {
    id: newId('n'),
    type: 'Card',
    props: { title: '地図コレ・ぬりえ', className: 'w-[560px] h-[420px]' } as any,
    children: [
      { id: newId('n'), type: 'PrefShareBar', props: {} as any },
      { id: newId('n'), type: 'PrefGridMap', props: {} as any },
    ],
  },
}

export const PRESETS: PresetDef[] = [
  preset_japanMapCard_basic,
  preset_tripHeaderCard,
  preset_itineraryTimelineCard,
  preset_travelPrefPaintCard,
  preset_travel_map_share_save_card_grid,
  // JapanMap（SVG版）があるなら追加
  ...(() => {
    try {
      require('@/components/domain/maps/JapanMap')
      const p = maybeJapanMapPreset(true)
      return p ? [p] : []
    } catch {
      return []
    }
  })(),
]

export const getPresetById = (id: string) => PRESETS.find((p) => p.id === id)
