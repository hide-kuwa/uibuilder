// apps/builder/lib/dnd/paletteToCanvas.ts
// append-only DnD helpers for palette -> canvas insertion

export const DT_KEY = 'application/x-uib-palette-id';

export function startPaletteDrag(ev: React.DragEvent, compId: string) {
  ev.dataTransfer?.setData(DT_KEY, compId);
  if (ev.dataTransfer) ev.dataTransfer.effectAllowed = 'copy';
}

// Replace this stub if you have a selector; keeps it append-only.
function currentPageId(): string {
  return (
    document.querySelector('[data-page-id]')?.getAttribute('data-page-id') ||
    'page-root'
  );
}

/** Prefer separator to compute exact index; fallback: append to slot */
export function deriveDropTarget(clientX: number, clientY: number) {
  const at = document.elementFromPoint(clientX, clientY) as HTMLElement | null;

  // 1) precise: separator between children
  const sep = at?.closest?.('[data-drop-sep="true"]') as HTMLElement | null;
  if (sep) {
    const slot = sep.closest('[data-slot]') as HTMLElement | null;
    const slotId = slot?.getAttribute('data-slot') || 'page.root';
    const containerNodeId =
      slot?.getAttribute('data-node-id') || currentPageId();
    const index = Number(sep.getAttribute('data-child-index')) || 0;
    return { slotId, containerNodeId, index };
  }

  // 2) fallback: whole-slot => append
  const slot = at?.closest?.('[data-slot]') as HTMLElement | null;
  if (!slot) {
    return { slotId: 'page.root', containerNodeId: currentPageId(), index: Infinity };
  }
  const slotId = slot.getAttribute('data-slot')!;
  const containerNodeId = slot.getAttribute('data-node-id') || currentPageId();
  return { slotId, containerNodeId, index: Infinity };
}

/** High-level drop handler that resolves def -> node -> bridge call */
export function handleCanvasDrop(
  ev: DragEvent,
  deps: {
    getDef: (id: string) => any;
    createNode: (def: any, opts: any) => any;
    callInsert: (parentId: string, index: number, node: any) => void;
  }
) {
  const compId = ev.dataTransfer?.getData(DT_KEY);
  if (!compId) return;
  const def = deps.getDef(compId);
  if (!def) return;

  const { slotId, containerNodeId, index } = deriveDropTarget(ev.clientX, ev.clientY);

  if (def.dropTargets && !def.dropTargets.includes(slotId)) return;

  const node = deps.createNode(def, { slotKey: slotId });
  deps.callInsert(containerNodeId, index, node);
}
