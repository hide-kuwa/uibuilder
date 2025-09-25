import React from 'react'
import type { ReactNode, CSSProperties } from 'react'
import { RegistryEntry, ComponentNode } from '@chizu/types'

// type helpers
type SlotName = 'header' | 'sidebar' | 'content' | 'footer'
type SlotValue = ReactNode[] | React.ReactElement | undefined
type SlotBag = Partial<Record<SlotName, SlotValue>>

type SlotTag = 'header' | 'aside' | 'main' | 'footer'

const SLOT_KEY_VARIANTS: Record<SlotName, string[]> = {
  header: ['header', 'slot.header', 'slot_header', 'slots.header', 'slots_header', 'headerSlot', 'headerContainer', 'headerNode', 'headerId', 'headerContainerId', 'container.header', 'container_header', 'containers.header'],
  sidebar: ['sidebar', 'slot.sidebar', 'slot_sidebar', 'slots.sidebar', 'slots_sidebar', 'sidebarSlot', 'sidebarContainer', 'sidebarNode', 'sidebarId', 'sidebarContainerId', 'container.sidebar', 'container_sidebar', 'containers.sidebar'],
  content: ['content', 'slot.content', 'slot_content', 'slots.content', 'slots_content', 'contentSlot', 'contentContainer', 'contentNode', 'contentId', 'contentContainerId', 'container.content', 'container_content', 'containers.content'],
  footer: ['footer', 'slot.footer', 'slot_footer', 'slots.footer', 'slots_footer', 'footerSlot', 'footerContainer', 'footerNode', 'footerId', 'footerContainerId', 'container.footer', 'container_footer', 'containers.footer'],
}

const SLOT_ID_FIELDS = ['nodeId', 'containerNodeId', 'containerId', 'id', 'value'] as const

function pickNodeId(obj: Record<string, any> | undefined): string | undefined {
  if (!obj) return undefined
  for (const key of SLOT_ID_FIELDS) {
    const val = obj[key]
    if (typeof val === 'string' && val) return val
  }
  return undefined
}

function extractSlotContainerNodeId(source: any, slot: SlotName, seen: Set<any>): string | undefined {
  if (!source || seen.has(source)) return undefined
  if (typeof source === 'string') return source
  if (Array.isArray(source)) {
    for (const entry of source) {
      if (!entry) continue
      const matchCandidate = typeof entry === 'object' && entry !== null ? (entry as Record<string, any>) : undefined
      if (matchCandidate) {
        const slotHint = matchCandidate.slot ?? matchCandidate.name ?? matchCandidate.key
        if (slotHint === slot || slotHint === `slot.${slot}` || slotHint === `slot_${slot}`) {
          const direct = pickNodeId(matchCandidate)
          if (direct) return direct
        }
      }
      const nested = extractSlotContainerNodeId(entry, slot, seen)
      if (nested) return nested
    }
    return undefined
  }
  if (typeof source === 'object') {
    const record = source as Record<string, any>
    if (typeof record.$$typeof === 'symbol') return undefined
    seen.add(source)
    for (const key of SLOT_KEY_VARIANTS[slot]) {
      if (Object.prototype.hasOwnProperty.call(record, key)) {
        const nested = extractSlotContainerNodeId(record[key], slot, seen)
        if (nested) return nested
      }
    }
    const slotHint = record.slot ?? record.name ?? record.key
    if (slotHint === slot || slotHint === `slot.${slot}` || slotHint === `slot_${slot}`) {
      const direct = pickNodeId(record)
      if (direct) return direct
    }
    for (const nestedKey of ['container', 'target', 'node']) {
      if (Object.prototype.hasOwnProperty.call(record, nestedKey)) {
        const nested = extractSlotContainerNodeId(record[nestedKey], slot, seen)
        if (nested) return nested
      }
    }
  }
  return undefined
}

function getSlotContainerNodeId(runtime: any, slot: SlotName): string | undefined {
  if (!runtime) return undefined
  const seen = new Set<any>()
  const sources = [
    runtime?.frame?.slotContainers,
    runtime?.frame?.slotContainerIds,
    runtime?.frame?.slotNodes,
    runtime?.frame?.slotIds,
    runtime?.frame?.containers,
    runtime?.frame?.slots,
    runtime?.frame?.nodeIds,
    runtime?.slotContainers,
    runtime?.slotContainerIds,
    runtime?.frame,
  ]
  for (const source of sources) {
    const id = extractSlotContainerNodeId(source, slot, seen)
    if (id) return id
  }
  return undefined
}

function SlotContainer({
  slotId,
  nodeId,
  as,
  children,
}: {
  slotId: string
  nodeId?: string
  as: SlotTag
  children?: React.ReactNode
}) {
  const list = React.Children.toArray(children ?? [])
  const pieces: React.ReactNode[] = []
  pieces.push(React.createElement('div', { key: 'sep-0', 'data-drop-sep': '', 'data-drop-index': 0 }))
  list.forEach((child, idx) => {
    pieces.push(child)
    pieces.push(React.createElement('div', { key: `sep-${idx + 1}`, 'data-drop-sep': '', 'data-drop-index': idx + 1 }))
  })
  return React.createElement(
    as,
    {
      'data-slot': slotId,
      'data-node-id': nodeId ?? slotId,
    },
    pieces
  )
}

function renderSlot(content: SlotValue): React.ReactNode {
  if (Array.isArray(content)) {
    return (content as ReactNode[]).map((n: ReactNode, i: number) => React.createElement('div', { key: i }, n))
  }
  return content ?? null
}
import { applyHoverFlexible } from '@chizu/renderer'

const CommonHover: any = {
  hoverPresetId:  { type: 'string', title: 'Hover Preset (single)', default: '' },
  hoverPresetIds: { type: 'array', title: 'Hover Presets (multi)', items: { type: 'string' }, default: [] },
}

export const entries: any = {
  Text: {
    id: 'Text',
    displayName: 'Text',
    propsSchema: { type: 'object', properties: { text: { type: 'string', title: 'text', default: '' } } },
    render: (p: any, _slots?: any, runtime?: any) => {
      const node = React.createElement('span', { style: { display: 'inline-block' } }, p.text ?? '')
      const presetArg = (p.hoverPresetIds?.length ? p.hoverPresetIds : p.hoverPresetId) as any
      return applyHoverFlexible(node, presetArg, runtime?.api?.hoverPresets)
    }
  },
  Image: {
    id: 'Image',
    displayName: 'Image',
    propsSchema: { type: 'object', properties: { src: { type: 'string', title: 'src', default: '' }, alt: { type: 'string', title: 'alt', default: '' } } },
    render: (p) => React.createElement('img', { src: p.src, alt: p.alt })
  },
  Hero: {
    id: 'Hero',
    displayName: 'Hero',
    propsSchema: { type: 'object', properties: { title: { type: 'string', title: 'title', default: '' } } },
    render: (p: any, _slots?: any, runtime?: any) => {
      const node = React.createElement('h1', null, p.title ?? '')
      const presetArg = (p.hoverPresetIds?.length ? p.hoverPresetIds : p.hoverPresetId) as any
      return applyHoverFlexible(node, presetArg, runtime?.api?.hoverPresets)
    }
  },
  TopNav: {
    id: 'TopNav',
    displayName: 'TopNav',
    propsSchema: { type: 'object', properties: {} },
    render: () => React.createElement('nav', null, 'TopNav')
  },
  PrefList: {
    id: 'PrefList',
    displayName: 'PrefList',
    propsSchema: { type: 'object', properties: {} },
    render: () => React.createElement('aside', null, 'PrefList')
  },
  // type helpers for slots
  
  Frame_Basic: {
    id: 'Frame_Basic',
    displayName: 'Frame Basic',
    propsSchema: { type: 'object', properties: {} },
    slotSchema: [{ name: 'header' }, { name: 'sidebar' }, { name: 'content', required: true }, { name: 'footer' }],
    render: (_p: any, slots: SlotBag, runtime?: any) => {
      const headerNodeId = getSlotContainerNodeId(runtime, 'header')
      const sidebarNodeId = getSlotContainerNodeId(runtime, 'sidebar')
      const contentNodeId = getSlotContainerNodeId(runtime, 'content')
      const footerNodeId = getSlotContainerNodeId(runtime, 'footer')
      return (
        React.createElement(React.Fragment, null,
          React.createElement(SlotContainer, { slotId: 'slot.header', nodeId: headerNodeId, as: 'header' }, renderSlot(slots.header)),
          React.createElement(SlotContainer, { slotId: 'slot.sidebar', nodeId: sidebarNodeId, as: 'aside' }, renderSlot(slots.sidebar)),
          React.createElement(SlotContainer, { slotId: 'slot.content', nodeId: contentNodeId, as: 'main' }, renderSlot(slots.content)),
          React.createElement(SlotContainer, { slotId: 'slot.footer', nodeId: footerNodeId, as: 'footer' }, renderSlot(slots.footer))
        )
      )
    }
  },
  Frame_Toponly: {
    id: 'Frame_Toponly',
    displayName: 'Frame TopOnly',
    propsSchema: { type: 'object', properties: {} },
    slotSchema: [{ name: 'header' }, { name: 'content', required: true }],
    render: (_p: any, slots: SlotBag, runtime?: any) => {
      const headerNodeId = getSlotContainerNodeId(runtime, 'header')
      const contentNodeId = getSlotContainerNodeId(runtime, 'content')
      return (
        React.createElement(React.Fragment, null,
          React.createElement(SlotContainer, { slotId: 'slot.header', nodeId: headerNodeId, as: 'header' }, renderSlot(slots.header)),
          React.createElement(SlotContainer, { slotId: 'slot.content', nodeId: contentNodeId, as: 'main' }, renderSlot(slots.content))
        )
      )
    }
  },
  Frame_Wide: {
    id: 'Frame_Wide',
    displayName: 'Frame Wide',
    propsSchema: { type: 'object', properties: {} },
    slotSchema: [{ name: 'content', required: true }, { name: 'footer' }],
    render: (_p: any, slots: SlotBag, runtime?: any) => {
      const contentNodeId = getSlotContainerNodeId(runtime, 'content')
      const footerNodeId = getSlotContainerNodeId(runtime, 'footer')
      return (
        React.createElement(React.Fragment, null,
          React.createElement(SlotContainer, { slotId: 'slot.content', nodeId: contentNodeId, as: 'main' }, renderSlot(slots.content)),
          React.createElement(SlotContainer, { slotId: 'slot.footer', nodeId: footerNodeId, as: 'footer' }, renderSlot(slots.footer))
        )
      )
    }
  }
}

export const R = new Proxy(entries, { get: (t, p: string) => (t as any)[p]?.render ?? (() => React.createElement('div', null, `Unknown:${p}`)) })
export default R
export function getSchema(type: string) { return (entries as any)[type]?.propsSchema }
export function mergeHoverStyle(
  el: JSX.Element,
  preset?: { base?: CSSProperties; hover?: CSSProperties; transition?: string }
){
  if (!preset) return el
  const props = { ...(el.props||{}) }
  const style: CSSProperties = { ...(props.style||{}), ...(preset.base||{}) }
  if (preset.transition) style.transition = preset.transition
  const onMouseEnter = (e:any) => {
    if (preset.hover) Object.assign(e.currentTarget.style, preset.hover)
    props.onMouseEnter?.(e)
  }
  const onMouseLeave = (e:any) => {
    if (preset.base) Object.assign(e.currentTarget.style, preset.base)
    props.onMouseLeave?.(e)
  }
  return React.cloneElement(el, { ...props, style, onMouseEnter, onMouseLeave })
}

// extend schemas with common hover field for Text/Hero
entries.Text.propsSchema.properties = { ...entries.Text.propsSchema.properties, ...CommonHover }
entries.Hero.propsSchema.properties = { ...entries.Hero.propsSchema.properties, ...CommonHover }

// --- chizu:registry P0 append ---
export { BacklinkList } from './components/BacklinkList'
export { NodeInspector } from './components/NodeInspector'
export { GridSheet } from './components/GridSheet'
// --- append-only ---
export { GridSheetV2 } from './components/GridSheetV2'
// --- append-only ---
export { NodeInspectorV2 } from './components/NodeInspectorV2'
// --- append-only ---
export { TraceGraph } from './components/TraceGraph'
// --- append-only ---
export { TraceLegend } from './components/TraceLegend'
export { RecoPanel } from './components/RecoPanel'
export { PublishSummary } from './components/PublishSummary'

// --- append-only: named renderer exports for codegen compatibility ---
// Components: adapt (props, runtime) to underlying (props, _slots?, runtime)
export const Text = (props: any, runtime?: any) => (R as any)['Text'](props, undefined, runtime)
export const Image = (props: any, runtime?: any) => (R as any)['Image'](props, undefined, runtime)
export const Hero = (props: any, runtime?: any) => (R as any)['Hero'](props, undefined, runtime)
export const TopNav = (props: any, runtime?: any) => (R as any)['TopNav'](props, undefined, runtime)
export const PrefList = (props: any, runtime?: any) => (R as any)['PrefList'](props, undefined, runtime)

// Frames: adapt (slots, runtime) to underlying (props, slots, runtime)
export const Frame_Basic = (slots: any, runtime?: any) => (R as any)['Frame_Basic']({}, slots, runtime)
export const Frame_Toponly = (slots: any, runtime?: any) => (R as any)['Frame_Toponly']({}, slots, runtime)
export const Frame_Wide = (slots: any, runtime?: any) => (R as any)['Frame_Wide']({}, slots, runtime)

// --- append-only: alias names for frames/components to absorb naming variants ---
export const Frame_TopOnly = Frame_Toponly
