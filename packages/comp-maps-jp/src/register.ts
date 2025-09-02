import { register } from '@repo/builder-core'
import type { ComponentDef } from '@repo/types/src/builder'
import JapanMapAdapter from './JapanMapAdapter'

const def: ComponentDef = {
  meta: {
    id: 'maps/japan',
    displayName: 'Japan Map',
    group: 'Maps',
    props: [
      { id: 'values',       label: 'Values(JSON)', control: 'json',   default: {} },
      { id: 'showLabels',   label: 'Labels',       control: 'switch', default: true },
      { id: 'labelKind',    label: 'Label Type',   control: 'select', default: 'pref',
        options: [{label:'Pref',value:'pref'},{label:'Capital',value:'capital'},{label:'None',value:'none'}] },
      { id: 'strokeWidth',  label: 'Stroke',       control: 'number', default: 1, min:0, max:4, step:0.5 },
      { id: 'colorVisited', label: 'Visited',      control: 'color',  default: '#22c55e' },
      { id: 'colorLived',   label: 'Lived',        control: 'color',  default: '#0ea5e9' },
      { id: 'colorPassed',  label: 'Passed',       control: 'color',  default: '#f59e0b' },
      { id: 'colorDefault', label: 'Default',      control: 'color',  default: '#1f2937' },
      { id: 'colorStroke',  label: 'Stroke',       control: 'color',  default: '#0b1020' },
    ],
    allowChildren: false,
  },
  Render: JapanMapAdapter,
}

register(def)

