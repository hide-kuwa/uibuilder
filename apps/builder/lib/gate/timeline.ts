export type Marker = { label: string; phase: 'start' | 'end'; at: number; payloadSize?: number }
export type DurationRow = { label: string; ms: number; payloadSize?: number }

// append-only: simple start/end pairing by label (first match wins)
export function pairDurations(markers: Marker[]): DurationRow[] {
  const starts = new Map<string, Marker>()
  const out: DurationRow[] = []
  for (const m of markers) {
    if (m.phase === 'start') starts.set(m.label, m)
    else if (m.phase === 'end') {
      const s = starts.get(m.label)
      if (s) {
        out.push({ label: m.label, ms: Math.max(0, m.at - s.at), payloadSize: m.payloadSize })
        starts.delete(m.label)
      }
    }
  }
  return out
}

