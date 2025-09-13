// Action signatures placeholder (future use)
export type SelectAction = { type: 'select'; ids: string[]; additive?: boolean }
export type ClearSelectAction = { type: 'clearSelect' }
export type StartEditTextAction = { type: 'startEditText'; id: string }
export type StopEditTextAction = { type: 'stopEditText' }
export type SetTextContentAction = { type: 'setTextContent'; id: string; value: string }
/** @deprecated use UpdateNodeAction */
export type SetNodeRectAction = UpdateNodeAction;
export type UpdateNodeAction = {
  type: 'updateNode';
  id: string;
  patch: Partial<{ x: number; y: number; width: number; height: number }>;
};
export type UndoAction = { type: 'undo' }
export type RedoAction = { type: 'redo' }
export type FigmaAction =
  | SelectAction | ClearSelectAction
  | StartEditTextAction | StopEditTextAction
  | SetTextContentAction | UpdateNodeAction
  | UndoAction | RedoAction
