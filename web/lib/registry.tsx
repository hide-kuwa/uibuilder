import type { BuilderNodeMeta } from '@/types/builder'
import Button from '@/components/blocks/Button'
import Container from '@/components/blocks/Container'
import Text from '@/components/blocks/Text'
import { Header, HeaderMeta } from '@/components/blocks/Header'
import { Footer, FooterMeta } from '@/components/blocks/Footer'
import { Sidebar, SidebarMeta } from '@/components/blocks/Sidebar'
import { Hud, HudMeta } from '@/components/blocks/Hud'

const ButtonMeta: BuilderNodeMeta = {
  displayName: 'Button',
  defaultSize: { w: 120, h: 40 },
  resizable: false,
  snap: 'grid',
  events: ['click'],
  propertySchema: {
    kind: 'object',
    title: 'Button',
    properties: {
      text:   { kind: 'string', title: 'Text', default: 'Button' },
      variant:{ kind: 'enum',   title: 'Variant', options: [
        { label:'Solid', value:'solid' },
        { label:'Ghost', value:'ghost' },
      ], default: 'solid' },
      href:   { kind: 'string', title: 'URL', format:'url', placeholder:'https://...' },
      color:  { kind: 'string', title: 'Color', format:'color', default:'#2563eb' },
      disabled:{ kind: 'boolean', title: 'Disabled', default:false },
    }
  }
}

const TextMeta: BuilderNodeMeta = {
  displayName: 'Text',
  defaultSize: { w: 160, h: 24 },
  resizable: true,
  snap: 'grid',
  propertySchema: {
    kind: 'object',
    title: 'Text',
    properties: {
      text: { kind: 'string', title:'Content', default:'Text', multiline:false },
      color:{ kind: 'string', title:'Color', format:'color', default:'#e5e7eb' },
      size: { kind: 'number', title:'Font Size', default:14, min:8, max:64, step:1 }
    }
  }
}

const ContainerMeta: BuilderNodeMeta = {
  displayName: 'Container',
  defaultSize: { w: 300, h: 200 },
  resizable: true,
  snap: 'grid',
  allowChildren: true,
  propertySchema: {
    kind:'object',
    title:'Container',
    properties:{
      bg:    { kind:'string', title:'Background', format:'color', default:'#111827' },
      radius:{ kind:'number', title:'Radius', default:8, min:0, max:48, step:1 },
      border:{ kind:'boolean', title:'Border', default:true },
    }
  }
}

export const registry = {
  button:   { cmp: Button,   meta: ButtonMeta },
  container:{ cmp: Container,meta: ContainerMeta },
  text:     { cmp: Text,     meta: TextMeta },
  header:   { cmp: Header,   meta: HeaderMeta },
  footer:   { cmp: Footer,   meta: FooterMeta },
  sidebar:  { cmp: Sidebar,  meta: SidebarMeta },
  hud:      { cmp: Hud,      meta: HudMeta },
} as const

export type Registry = typeof registry
export type RegistryKey = keyof Registry
