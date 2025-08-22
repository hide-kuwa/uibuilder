import type { EditorState } from '@/types/editor';

export function deserialize(data: any): EditorState {
  return {
    tree: data.tree || [],
    components: data.components || {},
    meta: data.meta || { version: 1, updatedAt: Date.now() },
    selectedIds: [],
    hoverId: null,
    camera: { x: 0, y: 0, zoom: 1 },
    guides: [],
    ui: { showRulers: false, showGuides: true, showSmartGuides: true, showOutline: false },
    lastCommandId: undefined,
    review: { status: 'DRAFT', requireApprovedToShare: false },
    comments: { threads: {}, users: {} },
  };
}
