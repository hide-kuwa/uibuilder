import { registry } from './registry.tsx'

export { registry }
export type Registry = typeof registry
export type RegistryKey = keyof Registry
export function getDef(key: RegistryKey): any {
  return (registry as any)[key]
}
