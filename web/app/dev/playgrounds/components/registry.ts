import React from 'react'
import { z } from 'zod'
import PublishButton from '../../../../../components/PublishButton'
import TextBlock from '../../../../../components/TextBlock'
import FormBox from '../../../../../components/FormBox'
import ContainerBox from '../../../../../components/ContainerBox'

export type ComponentCategory = 'visual' | 'functional' | 'invocation' | 'layout'

export interface RegisteredComponent {
  id: string
  name: string
  type: ComponentCategory
  icon: React.ReactNode
  tags: string[]
  description: string
  component: React.ComponentType<any>
  propSchema: z.ZodObject<any>
}

const registry: Record<string, RegisteredComponent> = {}

export function registerComponent(component: React.ComponentType<any>, meta: Omit<RegisteredComponent, 'component'>) {
  registry[meta.id] = { ...meta, component }
}

export function getRegisteredComponents(type?: ComponentCategory): RegisteredComponent[] {
  const comps = Object.values(registry)
  return type ? comps.filter((c) => c.type === type) : comps
}

export function getRegisteredComponent(id: string): RegisteredComponent | undefined {
  return registry[id]
}

const publishSchema = z.object({})
registerComponent(PublishButton, {
  id: 'publish-button',
  name: 'Publish Button',
  type: 'invocation',
  icon: '🚀',
  tags: ['action'],
  description: 'Triggers page publication.',
  propSchema: publishSchema,
})

const textBlockSchema = z.object({
  text: z.string().default('Sample text'),
})
registerComponent(TextBlock, {
  id: 'text-block',
  name: 'Text Block',
  type: 'visual',
  icon: '📝',
  tags: ['visual', 'text'],
  description: 'Displays simple text content.',
  propSchema: textBlockSchema,
})

const formBoxSchema = z.object({})
registerComponent(FormBox, {
  id: 'form-box',
  name: 'Form',
  type: 'functional',
  icon: '📋',
  tags: ['functional', 'form'],
  description: 'Simple form container.',
  propSchema: formBoxSchema,
})

const containerBoxSchema = z.object({
  className: z.string().optional(),
})
registerComponent(ContainerBox, {
  id: 'container-box',
  name: 'Container',
  type: 'layout',
  icon: '📦',
  tags: ['layout', 'container'],
  description: 'Generic container for layout.',
  propSchema: containerBoxSchema,
})

export { registry }

