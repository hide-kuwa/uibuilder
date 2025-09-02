'use client';
import type { RendererProps } from '@/types/builder';
import JapanMap from './JapanMap';

export default function JapanMapAdapter({ nodeId, values }: RendererProps) {
  const props = {
    values: values.values ?? {},
    showLabels: values.showLabels ?? true,
    labelKind: values.labelKind ?? 'pref',
    colors: {
      visited: values.colorVisited ?? '#22c55e',
      lived:   values.colorLived   ?? '#0ea5e9',
      passed:  values.colorPassed  ?? '#f59e0b',
      none:    values.colorDefault ?? '#1f2937',
      stroke:  values.colorStroke  ?? '#0b1020',
    },
    strokeWidth: values.strokeWidth ?? 1,
    interactive: values.interactive ?? true,
    onChange: (next: any) => {
      const store = require('@/store/builderStore');
      store.useBuilderStore.getState().updateProp(nodeId, 'values', next);
    },
  };
  return <JapanMap {...props} />;
}
