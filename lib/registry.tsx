import meta from '../component-meta.json'
import type { ComponentType } from 'react'
import MyCard from '../src/components/custom/MyCard'

export const library = meta as { displayName: string; description?: string }[]

// Static registry of available components
export const components: Record<string, ComponentType<any>> = {
  MyCard,
}
