import { register } from '@/lib/componentRegistry'
import type { ComponentDef } from '@/types/builder'
import { Text } from './Text'

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

register(textDef)

