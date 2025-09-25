import { entries as registryEntries } from '@chizu/registry'

type RegistryMap = Record<string, any>

const cache: RegistryMap = registryEntries as unknown as RegistryMap

export function getComponentDef(id: string): any {
  if (typeof id !== 'string' || !id) return undefined
  return cache[id]
}
