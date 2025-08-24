export type LayoutMode = "free" | "auto";
export type Axis = "horizontal" | "vertical";
export type SizeMode = "HUG" | "FIXED" | "FILL";
export type AlignMain = "start" | "center" | "end" | "space-between";
export type AlignCross = "start" | "center" | "end" | "stretch";

export interface LayoutProps {
  enabled: boolean;
  axis: Axis;
  gap: number;
  padding: { top: number; right: number; bottom: number; left: number };
  alignMain: AlignMain;
  alignCross: AlignCross;
  wrap?: boolean;
  maxPerLine?: number;
}

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
  dominant?: string;
  lastUsedAt?: number;
}

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-burn'
  | 'color-dodge'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion';

export interface ImageAdjustments {
  brightness?: number; // 0..2, default 1
  contrast?: number; // 0..2, default 1
  saturation?: number; // 0..2, default 1
  hue?: number; // -180..180 deg, default 0
  blur?: number; // 0..50 px, default 0
  opacity?: number; // 0..1, default 1
}

export interface ImageProps extends ComponentNode["props"] {
  assetId: string;
  fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
  position?: { x: number; y: number };
  /** When true, this image acts as a mask for subsequent siblings */
  isMask?: boolean;
  crop?: { x: number; y: number; w: number; h: number };
  adjustments?: ImageAdjustments;
  blend?: BlendMode; // default 'normal'
}

export interface ImageNode extends ComponentNode {
  type: "Image";
  props: ImageProps;
}

export type TextResizeMode = "AUTO_WIDTH" | "AUTO_HEIGHT" | "FIXED";

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight?: number;
  lineHeight?: "AUTO" | { px: number };
  letterSpacing?: { unit: "PERCENT" | "PX"; value: number };
  color?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  uppercase?: boolean;
}

export interface TextRun {
  from: number;
  to: number;
  style: Partial<TextStyle> & { link?: string };
}

export interface TextNode extends ComponentNode {
  type: "Text";
  text: string;
  style: TextStyle;
  edit?: { active: boolean };
  resizeMode?: TextResizeMode;
  runs?: TextRun[];
  styleRef?: string;
}

export interface TextStyleDef {
  id: string;
  name: string;
  style: TextStyle;
}

export interface TextSelection {
  nodeId: string | null;
  start: number;
  end: number;
  rect?: { x: number; y: number; w: number; h: number };
}

export type MaskTarget = "vector" | "frame" | "image";

export interface ComponentNode {
  id: string;
  type: string; // 'Frame' | 'Rect' | 'Text' | 'Instance' etc
  name?: string;
  /** Stable identifier for swap/override mapping */
  stableKey?: string;
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
    maxPerLine?: number;
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
  /** When this node represents a Component or Instance, reference definition id */
  defId?: string;
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
  pressId: string | null;
  camera: Camera;
  meta: { version: number; updatedAt: number };
  components: Record<string, ComponentDef>;
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
    activeTool?: "select" | "pen" | "text" | string;
    showPreferences?: boolean;
  };
  prefs?: {
    showImageBadges?: boolean;
    reduceMotion?: boolean;
    snapPx?: number;
    showGrid?: boolean;
    showPerfHud?: boolean;
  };
  textSel?: TextSelection;
  styles: { text: Record<string, TextStyleDef> };
  lastCommandId?: string;
  devLog?: { ts: number; type: string; payload: any }[];
  recentCommands?: string[];
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
  variantSets: Record<string, VariantSet>;
}

// Component Props (ユーザー定義プロパティ)
export interface ComponentProp {
  id: string;
  name: string;
  type: "boolean" | "text" | "number" | "color";
  defaultValue?: any;
  targetPath?: string;
}

// Variant Props & Definitions
export type VariantPropType = 'TEXT' | 'BOOLEAN' | 'NUMBER' | 'ENUM'

export interface VariantPropDef {
  name: string
  type: VariantPropType
  options?: string[]
  default?: string | number | boolean
}

export interface VariantDef {
  id: string
  name: string
  props: Record<string, string | number | boolean>
  rootId: string
}

export interface VariantSet {
  id: string
  defId: string
  propDefs: VariantPropDef[]
  variants: VariantDef[]
}

export interface ComponentDefinition {
  id: string;
  name: string;
  /** id of the root Frame node in the document tree */
  rootId: string;
  /** creation timestamp */
  createdAt: number;
  // legacy fields kept for backward compatibility
  root?: ComponentNode;
  usageCount?: number;
  /** timestamp of last instance placement */
  lastUsedAt?: number;
  props?: ComponentProp[]; // インスタンスに渡せる props
  axes?: Record<string, string[]>;
  rules?: Array<{
    when: Record<string, string>;
    node: string;
    patch: Partial<ComponentNode>;
  }>;
  variantSetId?: string; // variant 設定
}
export type ComponentDef = ComponentDefinition;

// Simple override map (details to be defined in later versions)
export type OverrideMap = {
  text?: Record<string, { text: string }>;
  image?: Record<string, { assetId: string }>;
  visible?: Record<string, boolean>;
  style?: Record<string, { fill?: string; stroke?: string; opacity?: number }>;
};

export interface InstanceNode extends FrameNode {
  type: 'Instance';
  /** component definition id */
  defId: string;
  /** legacy alias */
  componentId?: string;
  variantProps?: Record<string, string | number | boolean>; // バリアント
  overrides?: OverrideMap; // オーバーライド
  propValues?: Record<string, any>; // ComponentProp の値
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
