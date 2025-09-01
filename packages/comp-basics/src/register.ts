import { register } from '@repo/builder-core'
import type { ComponentDef } from '@repo/types'
import { Text } from './Text'
import { Card } from './Card'

const textDef: ComponentDef = {
  meta: {
    id: 'basic/text',
    displayName: 'Text',
    group: 'Basics',
    props: [
      { id: 'text',  label: 'Text',  control: 'text',   default: 'Hello' },
      { id: 'size',  label: 'Size',  control: 'number', default: 16, min: 8, max: 128, step: 1 },
      { id: 'color', label: 'Color', control: 'color',  default: '#e5e7eb' },
    ],
  },
  Render: Text,
}

const cardDef: ComponentDef = {
  meta: {
    id: 'basic/card',
    displayName: 'Card',
    group: 'Basics',
    allowChildren: true,
    props: [
      { id: 'slotComponentId', label: 'Content', control: 'component', default: '' },
    ],
  },
  Render: Card,
}

register(textDef)
register(cardDef)

