import { Button, ButtonMeta } from '@/components/blocks/Button'
import { Container, ContainerMeta } from '@/components/blocks/Container'
import { Text, TextMeta } from '@/components/blocks/Text'
import { Header, HeaderMeta } from '@/components/blocks/Header'
import { Footer, FooterMeta } from '@/components/blocks/Footer'
import { Sidebar, SidebarMeta } from '@/components/blocks/Sidebar'
import { Hud, HudMeta } from '@/components/blocks/Hud'

export const registry = {
  button: { Comp: Button, meta: ButtonMeta },
  container: { Comp: Container, meta: ContainerMeta },
  text: { Comp: Text, meta: TextMeta },
  header: { Comp: Header, meta: HeaderMeta },
  footer: { Comp: Footer, meta: FooterMeta },
  sidebar: { Comp: Sidebar, meta: SidebarMeta },
  hud: { Comp: Hud, meta: HudMeta },
} as const

export type Registry = typeof registry
export type RegistryKey = keyof Registry
