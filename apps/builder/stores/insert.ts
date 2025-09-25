// append-only canonical insert entrypoint (can be swapped to real API later)
export type InsertPayload = { parentId: string; index: number; node: any };

export function insertNode(parentId: string, index: number, node: any) {
  const detail: InsertPayload = { parentId, index, node };

  // 1) delegate to any existing consumer
  window.dispatchEvent(new CustomEvent('builder.insertNode', { detail }));

  // 2) fire a history hint; real history layer can hook this
  window.dispatchEvent(
    new CustomEvent('builder.history', {
      detail: { type: 'insert', ...detail, nodeId: node?.id },
    }),
  );

  // return nodeId for convenience
  return node?.id;
}
