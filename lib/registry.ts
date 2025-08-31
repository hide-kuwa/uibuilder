import meta from '../component-meta.json'
import type { ComponentType } from 'react'
import MyCard from '../src/components/custom/MyCard'

export const library = meta as { displayName: string; description?: string }[]

export const REGISTRY = {
  MyCard,
} as const satisfies Record<string, ComponentType<any>>

export type RegistryKey = keyof typeof REGISTRY

export function getByKey(key: RegistryKey): ComponentType<any> {
  return REGISTRY[key]
}
