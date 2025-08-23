export type LayoutMode = "free" | "auto";
export type Axis = "horizontal" | "vertical";
export type SizeMode = "HUG" | "FIXED" | "FILL";

export type ConstraintH = "LEFT" | "RIGHT" | "LEFT_RIGHT" | "CENTER" | "SCALE";
export type ConstraintV = "TOP" | "BOTTOM" | "TOP_BOTTOM" | "CENTER" | "SCALE";

export interface Constraints {
  horizontal: ConstraintH;
  vertical: ConstraintV;
}

export type GridKind = "COLUMNS" | "ROWS" | "GRID";

export interface LayoutGridBase {
  id: string;
  kind: GridKind;
  visible?: boolean;
  color?: string;
  opacity?: number;
}

export interface ColumnsGrid extends LayoutGridBase {
  kind: "COLUMNS";
  count: number;
  type: "stretch" | "center" | "left" | "right";
  gutter: number;
  margin?: number;
  offset?: number;
}

export interface RowsGrid extends LayoutGridBase {
  kind: "ROWS";
  count: number;
  type: "stretch" | "center" | "top" | "bottom";
  gutter: number;
  margin?: number;
  offset?: number;
}

export interface SquareGrid extends LayoutGridBase {
  kind: "GRID";
  size: number;
  offset?: number;
}

export type LayoutGrid = ColumnsGrid | RowsGrid | SquareGrid;

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

// v5 review & comments types
export type ReviewStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "CHANGES_REQUESTED"
  | "APPROVED";
export type ThreadStatus = "OPEN" | "RESOLVED" | "REOPENED" | "DRAFT";
export type AnchorKind = "PIN" | "RECT" | "NODE";

export interface CommentUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface CommentMessage {
  id: string;
  userId: string;
  createdAt: number;
  text: string;
  mentions?: string[];
  reactions?: Record<"+1" | "heart", string[]>;
}

export interface Anchor {
  kind: AnchorKind;
  nodeId?: string;
  x?: number;
  y?: number;
  rect?: { x: number; y: number; w: number; h: number };
  transform?: number[];
}

export interface CommentThread {
  id: string;
  status: ThreadStatus;
  anchor: Anchor;
  messages: CommentMessage[];
  resolvedBy?: string;
  resolvedAt?: number;
}

export interface Guide {
  id: string;
  axis: "x" | "y";
  pos: number;
  locked?: boolean;
  label?: string;
}

export interface PathPoint {
  id: string;
  x: number;
  y: number;
  in?: { x: number; y: number };
  out?: { x: number; y: number };
  corner?: boolean;
}

export type Cap = "butt" | "round" | "square";
export type Join = "miter" | "round" | "bevel";
export type FillRule = "nonzero" | "evenodd";

export interface PathProps {
  fill?: string;
  fillOpacity?: number;
  fillRule?: FillRule;
  stroke?: string;
  strokeOpacity?: number;
  strokeWidth?: number;
  strokeCap?: Cap;
  strokeJoin?: Join;
  miterLimit?: number; // 1..∞, default 4
  dash?: number[]; // e.g. [8,4,2]
  dashOffset?: number; // px
}

export interface PathNode extends ComponentNode {
  type: "Path";
  /** When true, this node acts as a mask for subsequent siblings */
  isMask?: boolean;
  closed: boolean;
  points: PathPoint[];
  subpaths?: PathPoint[][];
  props?: ComponentNode["props"] & PathProps;
}

export interface FrameNode extends ComponentNode {
  type: "Frame";
  /** Frame can also be used as a mask, clipping by its bounds */
  isMask?: boolean;
}

export interface AssetMeta {
  id: string;
  mime: string;
  w: number;
  h: number;
  size: number;
  hash: string;
  createdAt: number;
}

export interface ImageProps extends ComponentNode["props"] {
  assetId: string;
  fit?: "contain" | "cover" | "fill";
  position?: { x: number; y: number };
  isMask?: boolean;
}

export interface ImageNode extends ComponentNode {
  type: "Image";
  props: ImageProps;
}

export type MaskTarget = "vector" | "frame" | "image";

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
    padding?:
      | number
      | { top: number; right: number; bottom: number; left: number };
    alignItems?: "start" | "center" | "end" | "stretch";
    justifyContent?:
      | "start"
      | "center"
      | "end"
      | "space-between"
      | "space-around"
      | "space-evenly";
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
    constraints?: Constraints;
    layoutGrids?: LayoutGrid[];
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
  camera: Camera;
  meta: { version: number; updatedAt: number };
  components: Record<string, ComponentDefinition>;
  guides: Guide[];
  assets?: { images: Record<string, AssetMeta> };
  vector?: {
    selection?: { pathId?: string; pointIds?: string[] };
    draft?: { pathId: string; points: PathPoint[] };
  };
  ui?: {
    showRulers?: boolean;
    showGuides?: boolean;
    showSmartGuides?: boolean;
    showOutline?: boolean;
    activeTool?: "select" | "pen";
  };
  prefs?: {
    showLayoutGrid?: boolean;
    showPixelGrid?: boolean;
    snapToPixel?: boolean;
  };
  lastCommandId?: string;
  review: {
    status: ReviewStatus;
    requireApprovedToShare: boolean;
  };
  comments: {
    threads: Record<string, CommentThread>;
    users: Record<string, CommentUser>;
    draft?: { anchor?: Anchor; text?: string };
    filter?: { status?: ThreadStatus[]; onlySelection?: boolean };
  };
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
  type: "Instance";
  componentId: string;
  variant?: Record<string, string>;
  overrides?: Record<string, Partial<ComponentNode>>;
}

// v6 data binding and action types

export type DataSourceKind = "rest" | "graphql" | "mock";

export interface DataEndpoint {
  id: string;
  name: string;
  kind: DataSourceKind;
  baseUrl?: string;
  path?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean>;
  body?: any;
  graphQL?: {
    endpoint: string;
    query: string;
    variables?: Record<string, any>;
  };
  mock?: { data: any };
  ttlSec?: number;
  transform?: string;
  enabled?: boolean;
}

export interface BindingExpr {
  expr: string;
  sourceId?: string;
  fallback?: any;
}

export type EventName =
  | "onClick"
  | "onChange"
  | "onMount"
  | "onUnmount"
  | "onSubmit"
  | "onKeyDown"
  | "onKeyUp";

export type ActionKind =
  | "navigate"
  | "openUrl"
  | "setState"
  | "emit"
  | "callApi"
  | "showToast"
  | "openModal";

export interface ActionSpec {
  id: string;
  kind: ActionKind;
  if?: string;
  params?: Record<string, any>;
}

export interface NodeEvents {
  [K in EventName]?: ActionSpec[];
}

// extend ComponentNode with new bindings and events
export interface ComponentNode {
  bindings?: Record<string, BindingExpr>;
  events?: NodeEvents;
}

export interface VariablesState {
  [key: string]: any;
}

export interface DataState {
  endpoints: Record<string, DataEndpoint>;
  cache: Record<string, { data: any; at: number }>;
}

export interface EditorState {
  data?: DataState;
  vars?: VariablesState;
}
