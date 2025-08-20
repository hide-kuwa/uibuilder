import meta from '../component-meta.json'
import type { ComponentType } from 'react'

export const library = meta as { displayName: string; description?: string }[]

export const components: Record<string, ComponentType<any>> = {}
for (const m of library) {
  components[m.displayName] = (props: any) => {
    const React = require('react')
    const Mod = require(`../src/components/custom/${m.displayName}.tsx`).default
    return React.createElement(Mod, props)
  }
}
