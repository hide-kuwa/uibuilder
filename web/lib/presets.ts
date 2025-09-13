import type { ComponentNode } from '@/types/editor'
import { newId } from './ids'
import { preset_travel_map_share_save_card_grid, maybeJapanMapPreset, preset_travel_map_enum_card, preset_travel_map_enum_svg_card, preset_travel_landing_svg, preset_theme_ocean, preset_theme_sakura, type PresetDef } from './presets.travel'
export type { DomainTag, PresetTag, PresetDef } from './presets.travel'

export const cloneSubtree = (node: ComponentNode): ComponentNode => {
  return {
    ...node,
    id: newId('n'),
    children: node.children?.map(cloneSubtree),
  }
}

export const template_button: PresetDef = {
  id: 'template.ui.button',
  displayName: 'Button',
  tags: ['common'],
  tree: {
    id: newId('n'),
    type: 'ui.button',
    props: { label: 'Button', variant: 'primary' } as any,
  },
}

export const template_card: PresetDef = {
  id: 'template.ui.card',
  displayName: 'Card',
  tags: ['common', 'card'],
  tree: {
    id: newId('n'),
    type: 'ui.card',
    props: {
      title: 'Card title',
      body: 'Card body',
      bg: 'token:color.surface',
      radius: 'token:radius.lg',
      pad: 'token:space.4',
    } as any,
  },
}

export const template_hero: PresetDef = {
  id: 'template.hero',
  displayName: 'Hero',
  tags: ['common'],
  tree: {
    id: newId('n'),
    type: 'Hero',
    props: {
      title: 'Hero title',
      subtitle: 'Subtitle text',
      ctaText: 'Get Started',
      ctaHref: '#',
    } as any,
  },
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

export const preset_placeGalleryCard: PresetDef = {
  id: 'preset.travel.gallery.card',
  displayName: 'Place Gallery（カード）',
  tags: ['travel', 'card'],
  tree: {
    id: newId('n'),
    type: 'Card',
    props: { title: 'スポット写真', className: 'w-[560px] h-[360px]' } as any,
    children: [
      { id: newId('n'), type: 'PlaceGallery', props: { images: [] } as any },
    ],
  },
}

export const preset_poiMapCard: PresetDef = {
  id: 'preset.travel.poi.card',
  displayName: 'POI Map（カード）',
  tags: ['travel', 'card'],
  tree: {
    id: newId('n'),
    type: 'Card',
    props: { title: 'スポット地図', className: 'w-[560px] h-[360px]' } as any,
    children: [
      { id: newId('n'), type: 'POIMap', props: { markers: [] } as any },
    ],
  },
}

export const preset_costSplitCard: PresetDef = {
  id: 'preset.travel.costsplit.card',
  displayName: 'Cost Split（カード）',
  tags: ['travel', 'card'],
  tree: {
    id: newId('n'),
    type: 'Card',
    props: { title: '費用分担', className: 'w-[420px] h-[240px]' } as any,
    children: [
      { id: newId('n'), type: 'CostSplit', props: { items: [] } as any },
    ],
  },
}

export const PRESETS: PresetDef[] = [
  template_button,
  template_card,
  template_hero,
  preset_japanMapCard_basic,
  preset_tripHeaderCard,
  preset_itineraryTimelineCard,
  preset_travelPrefPaintCard,
  preset_placeGalleryCard,
  preset_poiMapCard,
  preset_costSplitCard,
  preset_travel_map_share_save_card_grid,
  preset_travel_map_enum_card,
  preset_travel_map_enum_svg_card,
  preset_travel_landing_svg,
  preset_theme_ocean,
  preset_theme_sakura,
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
