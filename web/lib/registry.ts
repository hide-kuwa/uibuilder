export type ComponentDef = {
  key: string
  meta?: { displayName?: string; defaultW?: number; defaultH?: number; propertySchema?: any[] }
  render?: any
}
import UiHeader from '@/components/defs/ui/Header'
import UiFooter from '@/components/defs/ui/Footer'
import UiSidebar from '@/components/defs/ui/Sidebar'
import UiText from '@/components/defs/ui/Text'
import UiCard from '@/components/defs/ui/Card'
import UiPanel from '@/components/defs/ui/Panel'
import UiHUD from '@/components/defs/ui/HUD'

export const REGISTRY: Record<string, ComponentDef> = {
  
  'ui.header': UiHeader,
  'ui.footer': UiFooter,
  'ui.sidebar': UiSidebar,
  'ui.text': UiText,
  'ui.card': UiCard,
  'ui.panel': UiPanel,
  'ui.hud': UiHUD,
}

export const registry = REGISTRY
export type RegistryKey = keyof typeof REGISTRY

export function getDef(key: string): ComponentDef | undefined { return REGISTRY[key] }
export function listDefs(): Array<{ key: string; label: string }> {
  return Object.entries(REGISTRY).map(([key, def]) => ({ key, label: def?.meta?.displayName || key }))
}
