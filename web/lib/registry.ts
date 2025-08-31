export type ComponentDef = {
  key: string
  meta?: { displayName?: string; defaultW?: number; defaultH?: number; propertySchema?: any[] }
  render?: any
}

import UiButton from '@/components/defs/ui/Button'
import UiText from '@/components/defs/ui/Text'
import UiHeader from '@/components/defs/ui/Header'
import UiCard from '@/components/defs/ui/Card'

export const REGISTRY: Record<string, ComponentDef> = {
  'ui.button': UiButton,
  'ui.text': UiText,
  'ui.header': UiHeader,
  'ui.card': UiCard,
}

export const registry = REGISTRY
export type RegistryKey = keyof typeof REGISTRY

export function getDef(key: string): ComponentDef | undefined {
  return REGISTRY[key]
}

export function listDefs(): Array<{ key: string; label: string }> {
  return Object.entries(REGISTRY).map(([key, def]) => ({
    key,
    label: def?.meta?.displayName || key,
  }))
}
