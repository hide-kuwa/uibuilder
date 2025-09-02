import type { ComponentNode } from '@/types/editor'
import { newId } from './ids'

export type DomainTag = 'common' | 'travel' | 'accounting'
export type PresetTag = DomainTag | 'card' | 'map' | 'chart' | 'analytics'

export type PresetDef = {
  id: string
  displayName: string
  icon?: string
  tags: PresetTag[]
  tree: ComponentNode
}

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

export const preset_travelTimeline: PresetDef = {
  id: 'preset.travel.timeline',
  displayName: '旅程タイムライン（カード）',
  tags: ['travel', 'card'],
  tree: { id: newId('n'), type: 'Card', props: { title: '旅程' } as any, children: [] },
}

export const preset_accountingJournal: PresetDef = {
  id: 'preset.accounting.journal',
  displayName: '仕訳一覧（カード）',
  tags: ['accounting', 'card'],
  tree: { id: newId('n'), type: 'Card', props: { title: '仕訳' } as any, children: [] },
}

export const PRESETS: PresetDef[] = [
  preset_japanMapCard_basic,
  preset_travelTimeline,
  preset_accountingJournal,
]

export const getPresetById = (id: string) => PRESETS.find((p) => p.id === id)
