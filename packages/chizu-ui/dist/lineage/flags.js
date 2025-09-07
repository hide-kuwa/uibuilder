// src/lineage/flags.ts
function aggregateFlags(graph, nodeId) {
  const flags = { rounded: false, taxAdjust: false, manualAdjust: false };
  for (const e of graph.edges) {
    if (e.from === nodeId || e.to === nodeId) {
      flags.rounded ||= !!e.flags?.rounded;
      flags.taxAdjust ||= !!e.flags?.taxAdjust;
      flags.manualAdjust ||= !!e.flags?.manualAdjust;
    }
  }
  return flags;
}
export {
  aggregateFlags
};
