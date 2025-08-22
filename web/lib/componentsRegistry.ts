import type { ComponentDefinition, EditorState } from '@/types/editor';

export function addComponent(state: EditorState, def: ComponentDefinition) {
  state.components[def.id] = def;
}

export function removeComponent(state: EditorState, id: string) {
  delete state.components[id];
}

export function getComponent(
  state: EditorState,
  id: string
): ComponentDefinition | undefined {
  return state.components[id];
}
