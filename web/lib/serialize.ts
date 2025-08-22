import type { EditorState } from '@/types/editor';

export function serialize(state: EditorState) {
  return {
    tree: state.tree,
    components: state.components,
    meta: state.meta,
  };
}
