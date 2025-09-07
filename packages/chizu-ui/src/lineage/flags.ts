import type { LineageGraph } from '@chizu/types/lineage'

export type FlagAgg = { rounded: boolean; taxAdjust: boolean; manualAdjust: boolean }

export function aggregateFlags(graph: LineageGraph, nodeId: string): FlagAgg {
  const flags: FlagAgg = { rounded: false, taxAdjust: false, manualAdjust: false }
  for (const e of graph.edges) {
    if (e.from === nodeId || e.to === nodeId) {
      flags.rounded ||= !!e.flags?.rounded
      flags.taxAdjust ||= !!e.flags?.taxAdjust
      flags.manualAdjust ||= !!e.flags?.manualAdjust
    }
  }
  return flags
}

