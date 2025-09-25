import type { Frame, Page } from '@chizu/types'

export type SlotName =
  | 'header'
  | 'sidebar'
  | 'content'
  | 'footer'
  | 'leftSidebar'
  | 'rightPanel'
  | 'canvas'

export const BASE_FRAMES: Frame[] = [
  {
    id: 'frame-basic',
    name: 'Basic',
    slots: [
      { name: 'header' },
      { name: 'sidebar' },
      { name: 'content', required: true },
      { name: 'footer' },
    ],
  },
  {
    id: 'frame-top',
    name: 'TopOnly',
    slots: [
      { name: 'header' },
      { name: 'content', required: true },
    ],
  },
  {
    id: 'frame-wide',
    name: 'Wide',
    slots: [
      { name: 'content', required: true },
      { name: 'footer' },
    ],
  },
]

export const META_FRAME: Frame = {
  id: 'frame-builder',
  name: 'Builder UI',
  slots: [
    { name: 'leftSidebar' },
    { name: 'canvas', required: true },
    { name: 'rightPanel' },
  ],
}

export const META_SLOTS: SlotName[] = ['leftSidebar', 'canvas', 'rightPanel']

export const FRAME_TYPE_MAP: Record<string, string> = {
  'frame-basic': 'Frame_Basic',
  'frame-top': 'Frame_Toponly',
  'frame-wide': 'Frame_Wide',
}

export const DEFAULT_PAGE = (id = 'map-home'): Page => ({
  id,
  title: '新規ページ',
  frameId: 'frame-basic',
  content: [],
  slotAssignments: {},
})

export const CATALOG: Array<{
  type: string
  label: string
  defaultProps?: Record<string, any>
}> = [
  { type: 'Text', label: 'Text', defaultProps: { text: 'テキスト' } },
  { type: 'Image', label: 'Image', defaultProps: { src: '', alt: '' } },
  { type: 'Hero', label: 'Hero', defaultProps: { title: 'タイトル' } },
  { type: 'TopNav', label: 'TopNav' },
  { type: 'PrefList', label: 'PrefList' },
]

export const PREVIEW_API: Record<string, any> = {
  prefStats: {
    '01': { name: '北海道', population: 5224614 },
    '13': { name: '東京都', population: 14047594 },
  },
}
