import type { InteractionPreset } from '@/types/interactions';

export const hoverActionPresets: InteractionPreset[] = [
  {
    id: 'hover.lift',
    name: 'Hover Lift',
    triggers: ['hover'],
    effects: [
      { kind: 'translate', y: -4 },
      { kind: 'shadow', value: 'lg' },
    ],
    transitionMs: 120,
    updatedAt: 0,
  },
  {
    id: 'hover.fade',
    name: 'Fade',
    triggers: ['hover'],
    effects: [{ kind: 'opacity', value: 0.8 }],
    transitionMs: 120,
    updatedAt: 0,
  },
];
