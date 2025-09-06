import React from 'react'
import { RegistryEntry, ComponentNode } from '@chizu/types'

export const entries: Record<string, RegistryEntry> = {
  Text: {
    id: 'Text',
    displayName: 'Text',
    propsSchema: { type: 'object', properties: { text: { type: 'string', title: 'text', default: '' } } },
    render: (p) => React.createElement('span', null, p.text ?? '')
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
    render: (p) => React.createElement('h1', null, p.title ?? '')
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
  Frame_Basic: {
    id: 'Frame_Basic',
    displayName: 'Frame Basic',
    propsSchema: { type: 'object', properties: {} },
    slotSchema: [{ name: 'header' }, { name: 'sidebar' }, { name: 'content', required: true }, { name: 'footer' }],
    render: (_p, slots) => {
      const S = (name: string) => (slots?.[name] ?? []).map((n, i) => React.createElement('div', { key: i }, `[${(n as ComponentNode).type}]`))
      return React.createElement(React.Fragment, null,
        React.createElement('header', null, S('header')),
        React.createElement('aside', null, S('sidebar')),
        React.createElement('main', null, S('content')),
        React.createElement('footer', null, S('footer'))
      )
    }
  }
}

export const R = new Proxy(entries, { get: (t, p: string) => (t as any)[p]?.render ?? (() => React.createElement('div', null, `Unknown:${p}`)) })
export default R
export function getSchema(type: string) { return (entries as any)[type]?.propsSchema }
