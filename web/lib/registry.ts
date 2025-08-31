import type { ComponentDef } from '@/types/composition'
import { Button } from '@/components/domain/Button'
import { Text } from '@/components/domain/Text'
import Header from '@/components/domain/Header'
import Card from '@/components/domain/Card'
import { BUTTON_META } from '@/components/domain/meta/buttonMeta'
import { TEXT_META } from '@/components/domain/meta/textMeta'
import { HEADER_META } from '@/components/domain/meta/headerMeta'
import { CARD_META } from '@/components/domain/meta/cardMeta'

export const REGISTRY: Record<string, ComponentDef> = {
  'ui.button': {
    key: 'ui.button',
    displayName: 'Button',
    cmp: Button,
    defaultProps: { label: 'Button', variant: 'primary' },
    variants: [
      { id: 'primary', label: 'Primary', props: { variant: 'primary' } },
      { id: 'secondary', label: 'Secondary', props: { variant: 'secondary' } },
      { id: 'ghost', label: 'Ghost', props: { variant: 'ghost' } },
    ],
    meta: BUTTON_META,
  },
  'ui.text': {
    key: 'ui.text',
    displayName: 'Text',
    cmp: Text,
    defaultProps: { text: 'Lorem ipsum', size: 'base' },
    variants: [
      { id: 'body', label: 'Body', props: { size: 'base' } },
      { id: 'title', label: 'Title', props: { size: 'xl' } },
    ],
    meta: TEXT_META,
  },
  'ui.header': {
    key: 'ui.header',
    displayName: 'Header',
    cmp: Header,
    defaultProps: { title: 'Header', align: 'left' },
    variants: [
      { id: 'left', label: 'Left', props: { align: 'left' } },
      { id: 'center', label: 'Center', props: { align: 'center' } },
      { id: 'right', label: 'Right', props: { align: 'right' } },
    ],
    meta: HEADER_META,
  },
  'ui.card': {
    key: 'ui.card',
    displayName: 'Card',
    cmp: Card,
    defaultProps: { title: 'Card Title', body: 'Card body' },
    variants: [
      { id: 'default', label: 'Default', props: {} },
      { id: 'compact', label: 'Compact', props: {} },
    ],
    meta: CARD_META,
  },
}

export const registry = REGISTRY
export type RegistryKey = keyof typeof REGISTRY
export function getDef(key: string): ComponentDef | undefined {
  return REGISTRY[key]
}
