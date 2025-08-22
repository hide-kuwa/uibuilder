export type LayoutMode = 'free' | 'auto';
export type Axis = 'horizontal' | 'vertical';
export type SizeMode = 'HUG' | 'FIXED' | 'FILL';

export interface Guide {
  id: string;
  axis: 'x' | 'y';
  pos: number;
  locked?: boolean;
  label?: string;
}

export interface ComponentNode {
  id: string;
  type: string; // 'Frame' | 'Rect' | 'Text' | 'Instance' etc
  name?: string;
  props?: {
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    rotation?: number;
    layout?: LayoutMode;
    axis?: Axis;
    gap?: number;
    padding?: number | { top: number; right: number; bottom: number; left: number };
    alignItems?: 'start' | 'center' | 'end' | 'stretch';
    justifyContent?:
      | 'start'
      | 'center'
      | 'end'
      | 'space-between'
      | 'space-around'
      | 'space-evenly';
    wrap?: boolean;
    widthMode?: SizeMode;
    heightMode?: SizeMode;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    className?: string;
    text?: string; // for Text nodes
    visible?: boolean;
  };
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
  components: Record<string, ComponentDefinition>;
  guides: Guide[];
  ui?: {
    showRulers?: boolean;
    showGuides?: boolean;
    showSmartGuides?: boolean;
    showOutline?: boolean;
  };
  lastCommandId?: string;
}

export interface ComponentDefinition {
  id: string;
  name: string;
  root: ComponentNode;
  axes?: Record<string, string[]>;
  rules?: Array<{
    when: Record<string, string>;
    node: string;
    patch: Partial<ComponentNode>;
  }>;
}

export interface InstanceNode extends ComponentNode {
  type: 'Instance';
  componentId: string;
  variant?: Record<string, string>;
  overrides?: Record<string, Partial<ComponentNode>>;
}
