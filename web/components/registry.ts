import { HeaderView } from '@/components/builder/header/HeaderView'
import { HeaderInspector } from '@/components/builder/header/HeaderInspector'
import { FooterView } from '@/components/builder/footer/FooterView'
import { FooterInspector } from '@/components/builder/footer/FooterInspector'
import { SidebarView } from '@/components/app/SidebarView'
import { SidebarInspector } from '@/components/app/SidebarInspector'

export const registry = {
  header: {
    label: 'Header',
    view: HeaderView,
    inspector: HeaderInspector,
    minW: 960,
    minH: 64,
  },
  footer: {
    label: 'Footer',
    view: FooterView,
    inspector: FooterInspector,
    minW: 960,
    minH: 56,
  },
  sidebar: {
    label: 'Sidebar',
    view: SidebarView,
    inspector: SidebarInspector,
    minW: 200,
    minH: 240,
  },
} as const

export type RegistryKey = keyof typeof registry
