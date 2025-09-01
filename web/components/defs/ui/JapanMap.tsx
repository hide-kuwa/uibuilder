'use client'
import React from 'react'
import { JapanMapAdapter } from '@/components/domain/maps/JapanMapAdapter'

const Def = {
  key: 'ui.japanmap',
  meta: {
    displayName: 'Japan Map',
    defaultW: 480,
    defaultH: 360,
    propertySchema: [
      { id: 'values', type: 'json', default: {} },
      { id: 'showLabels', type: 'boolean', default: true },
      { id: 'colorVisited', type: 'string', default: '#22c55e' },
      { id: 'colorLived', type: 'string', default: '#0ea5e9' },
      { id: 'colorPassed', type: 'string', default: '#f59e0b' },
      { id: 'colorDefault', type: 'string', default: '#1f2937' },
    ],
  },
  render: (p: any) => {
    const values = {
      values: p.values ?? {},
      showLabels: p.showLabels ?? true,
      colorVisited: p.colorVisited ?? '#22c55e',
      colorLived: p.colorLived ?? '#0ea5e9',
      colorPassed: p.colorPassed ?? '#f59e0b',
      colorDefault: p.colorDefault ?? '#1f2937',
    }
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <JapanMapAdapter nodeId={p.id || 'map'} values={values} />
      </div>
    )
  },
}
export default Def

