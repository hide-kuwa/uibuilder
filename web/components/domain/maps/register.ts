import { register } from '@/lib/registry';
import JapanMapAdapter from './JapanMapAdapter';
import Legend from './Legend';
import HoverLabel from './HoverLabel';

register({
  meta: {
    id: 'maps/japan',
    displayName: 'Japan Map',
    group: 'Maps',
    props: [
      { id: 'values',       label: 'Values(JSON)', control: 'json',   default: {} },
      { id: 'interactive',  label: 'Interactive',  control: 'switch', default: true },
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
    preferredSize: { width: 480, height: 360 },
  },
  Render: JapanMapAdapter,
});

register({
  meta: {
    id: 'maps/legend',
    displayName: 'Legend',
    group: 'Maps',
    props: [
      { id: 'colorVisited', label: 'Visited',      control: 'color', default: '#22c55e' },
      { id: 'colorLived',   label: 'Lived',        control: 'color', default: '#0ea5e9' },
      { id: 'colorPassed',  label: 'Passed',       control: 'color', default: '#f59e0b' },
      { id: 'colorDefault', label: 'Default',      control: 'color', default: '#1f2937' },
    ],
    allowChildren: false,
  },
  Render: Legend,
});

register({
  meta: {
    id: 'maps/hover-label',
    displayName: 'Hover Label',
    group: 'Maps',
    props: [],
    allowChildren: false,
  },
  Render: HoverLabel,
});
