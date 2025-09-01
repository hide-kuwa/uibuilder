import { register } from '@/lib/componentRegistry'
import type { ComponentDef } from '@/types/builder'
import { JapanMapAdapter } from './JapanMapAdapter'

const def: ComponentDef = {
  meta: {
    id: 'maps/japan',
    displayName: 'Japan Map',
    group: 'Maps',
    props: [
      { id: 'values',      label: 'Values(JSON)', control: 'json',   default: {} },
      { id: 'showLabels',  label: 'Labels',       control: 'switch', default: true },
      { id: 'colorVisited',label: 'Visited',      control: 'color',  default: '#22c55e' },
      { id: 'colorLived',  label: 'Lived',        control: 'color',  default: '#0ea5e9' },
      { id: 'colorPassed', label: 'Passed',       control: 'color',  default: '#f59e0b' },
      { id: 'colorDefault',label: 'Default',      control: 'color',  default: '#1f2937' },
    ],
  },
  Render: JapanMapAdapter,
}

register(def)

