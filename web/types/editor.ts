export interface ComponentNode {
  id: string;
  type: string; // 'Frame' | 'Rect' | 'Text' | 'Button' etc
  name?: string;
  props?: Record<string, any>; // x,y,w,h,rotation,style etc
  bindings?: Record<string, PropBinding>;
  variants?: {
    hover?: { className?: string };
    active?: { className?: string };
  };
  children?: ComponentNode[];
  isContainer?: boolean;
  locked?: boolean;
  visible?: boolean;
}

export interface PropBinding {
  source: string; // 'api' | 'store' | 'const'
  endpoint: string;
  path: string;
  fallback?: string;
}

export interface EditorState {
  tree: ComponentNode[];
  selectedIds: string[];
  hoverId: string | null;
  camera: { x: number; y: number; zoom: number };
  meta: { version: number; updatedAt: number };
}
