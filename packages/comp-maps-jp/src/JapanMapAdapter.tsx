'use client'
import type { RendererProps } from '@repo/types/src/builder'
import { JapanMap } from './JapanMap'
import type { JapanMapProps, VisitStatus, PrefCode } from './types'

export default function JapanMapAdapter({ values }: RendererProps) {
  const props: JapanMapProps = {
    values: (values?.values ?? {}) as Record<PrefCode, VisitStatus>,
    showLabels: values?.showLabels ?? true,
    palette: {
      visited: values?.colorVisited ?? '#22c55e',
      lived:   values?.colorLived   ?? '#0ea5e9',
      passed:  values?.colorPassed  ?? '#f59e0b',
      none:    values?.colorDefault ?? '#1f2937',
      stroke:  values?.colorStroke  ?? '#0b1020',
    },
    strokeWidth: values?.strokeWidth ?? 1,
    labelKind: values?.labelKind ?? 'pref',
  }
  return <JapanMap {...props} />
}

