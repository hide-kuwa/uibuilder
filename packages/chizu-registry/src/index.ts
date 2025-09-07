import React from 'react'
import type { ReactNode, CSSProperties } from 'react'
import { RegistryEntry, ComponentNode } from '@chizu/types'

// type helpers
type SlotName = 'header' | 'sidebar' | 'content' | 'footer'
type SlotValue = ReactNode[] | React.ReactElement | undefined
type SlotBag = Partial<Record<SlotName, SlotValue>>

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
    render: (_p: any, slots: SlotBag, _runtime?: any) => (
      React.createElement(React.Fragment, null,
        React.createElement('header', null, renderSlot(slots.header)),
        React.createElement('aside',  null, renderSlot(slots.sidebar)),
        React.createElement('main',   null, renderSlot(slots.content)),
        React.createElement('footer', null, renderSlot(slots.footer))
      )
    )
  },
  Frame_Toponly: {
    id: 'Frame_Toponly',
    displayName: 'Frame TopOnly',
    propsSchema: { type: 'object', properties: {} },
    slotSchema: [{ name: 'header' }, { name: 'content', required: true }],
    render: (_p: any, slots: SlotBag, _runtime?: any) => (
      React.createElement(React.Fragment, null,
        React.createElement('header', null, renderSlot(slots.header)),
        React.createElement('main',   null, renderSlot(slots.content))
      )
    )
  },
  Frame_Wide: {
    id: 'Frame_Wide',
    displayName: 'Frame Wide',
    propsSchema: { type: 'object', properties: {} },
    slotSchema: [{ name: 'content', required: true }, { name: 'footer' }],
    render: (_p: any, slots: SlotBag, _runtime?: any) => (
      React.createElement(React.Fragment, null,
        React.createElement('main',   null, renderSlot(slots.content)),
        React.createElement('footer', null, renderSlot(slots.footer))
      )
    )
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
