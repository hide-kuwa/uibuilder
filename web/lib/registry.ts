import type { ComponentType } from 'react'
import type { BuilderMeta } from '@/types/propertySchema'
import { Button } from '@/components/domain/Button'
import { Text } from '@/components/domain/Text'
import { BUTTON_META } from '@/components/domain/meta/buttonMeta'
import { TEXT_META } from '@/components/domain/meta/textMeta'

export type ComponentDef = { key: string; cmp: ComponentType<any>; meta: BuilderMeta }
export const REGISTRY: Record<string, ComponentDef> = {
  'ui.button': { key: 'ui.button', cmp: Button, meta: BUTTON_META },
  'ui.text': { key: 'ui.text', cmp: Text, meta: TEXT_META },
}
export const registry = REGISTRY
export type RegistryKey = keyof typeof REGISTRY
export function getDef(key: RegistryKey) { return REGISTRY[key] }
