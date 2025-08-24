import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { produceWithPatches } from "immer";
import type {
  EditorState,
  ComponentNode,
  ComponentDefinition,
  InstanceNode,
  SizeMode,
  Guide,
  ReviewStatus,
  Anchor,
  CommentThread,
  Camera,
  PathNode,
  PathPoint,
  PathProps,
  ImageNode,
  AssetMeta,
  ImageProps,
  TextNode,
  TextStyle,
  TextResizeMode,
  TextStyleDef,
  TextSelection,
  TextRun,
} from "@/types/editor";
import { idbStorage } from "@/lib/idb";
import { initPersist, schedulePersist } from "@/lib/persist";
import { push, undo as undoStack, redo as redoStack } from "./undoRedo";
import { resolveVariant } from "@/lib/variantResolver";
import { applyOverrides } from "@/lib/overrideMerge";
import { MIN_ZOOM, MAX_ZOOM } from "@/lib/layout/constants";
import { reflectHandle } from "@/lib/vector/bezier";
import { flattenPath } from "@/lib/vector/flatten";
import {
  booleanCombine as combinePolys,
  BooleanOp,
} from "@/lib/vector/boolean";
import { saveImage, loadImage } from "@/lib/assets";
import { computeDominantColor } from "@/lib/color/dominant";
import { nanoid } from "nanoid";
import { layoutText } from "@/lib/text/layout";
import { applyRun, removeRun } from "@/lib/text/rangeOps";

const updateUsageCounts = (draft: EditorState) => {
  const counts: Record<string, number> = {};
  const walk = (nodes: ComponentNode[]) => {
    for (const n of nodes) {
      if ((n as any).type === "Instance") {
        const compId = (n as InstanceNode).componentId;
        counts[compId] = (counts[compId] || 0) + 1;
      }
      if ((n as any).children) walk((n as any).children!);
    }
  };
  walk(draft.tree);
  Object.keys(draft.components).forEach((id) => {
    draft.components[id].usageCount = counts[id] || 0;
  });
};

interface EditorActions {
  select: (ids: string[] | ((prev: string[]) => string[])) => void;
  setHover: (id: string | null) => void;
  setPress: (id: string | null) => void;
  updateNode: (id: string, patch: Partial<ComponentNode>) => void;
  moveNode: (
    id: string,
    dx: number,
    dy: number,
    opts?: { snap?: boolean },
  ) => void;
  resizeNode: (id: string, next: { w?: number; h?: number }) => void;
  rotateNode: (id: string, deg: number) => void;
  duplicate: (ids?: string[]) => void;
  remove: (ids?: string[]) => void;
  addImageAsset: (meta: AssetMeta) => void;
  removeImageAsset: (id: string) => void;
  addImageNode: (meta: AssetMeta, opts?: { x?: number; y?: number }) => string;
  updateImageNode: (id: string, patch: Partial<ImageProps>) => void;
  replaceImageAsset: (
    nodeId: string,
    newAssetId: string,
    opts?: { preserveCrop?: boolean; fitPolicy?: 'keep' | 'cover' | 'contain' },
  ) => void;
  placeImages: (
    assets: { id: string; w: number; h: number }[],
    opts?: { grid?: { cols?: number; gap?: number }; start?: { x: number; y: number } },
  ) => string[];
  placeFromClipboard: (blob: Blob) => Promise<string>;
  undo: () => void;
  redo: () => void;
  makeAutoLayout: (frameId?: string) => void;
  removeAutoLayout: (frameId?: string) => void;
  reorderChild: (parentId: string, from: number, to: number) => void;
  setLayoutProps: (
    id: string,
    patch: Partial<NonNullable<ComponentNode["props"]>>,
  ) => void;
  setSizeMode: (
    id: string,
    axis: "w" | "h",
    mode: SizeMode,
    value?: number,
  ) => void;
  // Components
  createComponentFromSelection: (name?: string) => void;
  deleteComponent: (componentId: string) => void;
  renameComponent: (componentId: string, name: string) => void;
  createInstance: (componentId: string, pos?: { x: number; y: number }) => void;
  detachInstance: (nodeId: string) => void;
  swapInstance: (nodeId: string, nextComponentId: string) => void;
  // v3 additions
  align: (
    kind: "left" | "right" | "top" | "bottom" | "centerH" | "centerV",
  ) => void;
  distribute: (kind: "h" | "v", space?: number) => void;
  reorder: (kind: "front" | "back" | "forward" | "backward") => void;
  addGuide: (g: Omit<Guide, "id">) => void;
  moveGuide: (id: string, pos: number) => void;
  removeGuide: (id: string) => void;
  toggleRulers: () => void;
  toggleGuides: () => void;
  toggleOutline: () => void;
  toggleLayoutGrid: () => void;
  toggleSnapToPixel: () => void;
  togglePreferences: () => void;
  setPrefs: (patch: Partial<EditorState['prefs']>) => void;
  ensureDominantColor: (assetId: string) => Promise<string>;
  booleanCombine: (
    op: BooleanOp,
    ids: string[],
    opts?: { replace?: boolean; flatness?: number; simplify?: number },
  ) => string;
  setLastCommand: (id: string) => void;
  addRecentCommand: (id: string) => void;
  setCamera: (cam: Partial<Camera>) => void;
  tweenCamera: (
    cam: Camera | Partial<Camera>,
    opts?: { duration?: number },
  ) => void;
  centerOn: (pt: { x: number; y: number }) => void;
  getViewportRect: () => { x: number; y: number; w: number; h: number };
  getSelectionBounds: () => {
    x: number;
    y: number;
    w: number;
    h: number;
  } | null;
  logDev: (entry: { ts: number; type: string; payload: any }) => void;
  clearDevLog: () => void;
  // Variants
  defineVariantAxis: (
    componentId: string,
    axis: string,
    values: string[],
  ) => void;
  setVariantRule: (
    componentId: string,
    rule: {
      when: Record<string, string>;
      node: string;
      patch: Partial<ComponentNode>;
    },
  ) => void;
  removeVariantRule: (componentId: string, index: number) => void;
  setInstanceVariant: (nodeId: string, axis: string, value: string) => void;
  // Overrides
  setInstanceOverride: (
    nodeId: string,
    targetId: string,
    patch: Partial<ComponentNode>,
  ) => void;
  resetInstanceOverride: (nodeId: string, targetId?: string) => void;
  // v5 comments and review
  startPinAnnotation: () => void;
  startRectAnnotation: () => void;
  placeAnnotationAt: (pt: { x: number; y: number }) => void;
  cancelAnnotation: () => void;
  createThread: (anchor: Anchor, text: string) => void;
  replyThread: (threadId: string, text: string) => void;
  resolveThread: (threadId: string, byUserId: string) => void;
  reopenThread: (threadId: string) => void;
  addReaction: (threadId: string, msgId: string, kind: "+1" | "heart") => void;
  removeReaction: (
    threadId: string,
    msgId: string,
    kind: "+1" | "heart",
    userId: string,
  ) => void;
  setCommentsFilter: (
    filter: Partial<EditorState["comments"]["filter"]>,
  ) => void;
  setReviewStatus: (s: ReviewStatus) => void;
  toggleRequireApprovedToShare: () => void;
  // Vector
  addPath: (path: PathNode) => void;
  setPathProps: (id: string, patch: Partial<PathProps>) => void;
  selectPath: (id: string | null, pointIds?: string[]) => void;
  setPoints: (id: string, pts: PathPoint[]) => void;
  startPen: () => void;
  placePoint: (pt: {
    x: number;
    y: number;
    in?: { x: number; y: number };
    out?: { x: number; y: number };
    corner?: boolean;
  }) => void;
  deleteLast: () => void;
  closePath: () => void;
  cancelPen: () => void;
  movePoint: (id: string, to: { x: number; y: number }) => void;
  moveHandle: (
    id: string,
    kind: "in" | "out",
    to: { x: number; y: number },
    opts?: { break?: boolean },
  ) => void;
  addPointOnSegment: (pathId: string, segIndex: number, t: number) => void;
  toggleCorner: (id: string) => void;
  toggleMask: (nodeId: string, enabled?: boolean) => void;
  startCrop: (nodeId: string) => void;
  updateCrop: (patch: Partial<CropDraft['rect']>) => void;
  commitCrop: () => void;
  cancelCrop: () => void;
  // Text actions
  setActiveTool: (tool: EditorState['ui']['activeTool']) => void;
  addText: (opts: { x: number; y: number; text?: string; style?: TextStyle }) => string;
  updateText: (id: string, text: string) => void;
  setTextStyle: (id: string, patch: Partial<TextStyle>) => void;
  toggleEditText: (id: string, active?: boolean) => void;
  setTextResizeMode: (id: string, mode: TextResizeMode) => void;
  createTextStyle: (name: string, style: TextStyle) => string;
  updateTextStyle: (id: string, style: TextStyle) => void;
  applyTextStyle: (nodeId: string, styleId: string) => void;
  detachTextStyle: (nodeId: string) => void;
  removeTextStyle: (id: string) => void;
  syncTextStyles: (styleId: string) => void;
  setTextSelection: (sel: EditorState['textSel']) => void;
  clearTextSelection: () => void;
  updateTextRuns: (id: string, runs: TextRun[]) => void;
  applyRunStyle: (
    id: string,
    range: { from: number; to: number },
    style: Partial<TextStyle> & { link?: string },
  ) => void;
  removeRunStyle: (
    id: string,
    range: { from: number; to: number },
    keys: (keyof TextStyle | 'link')[],
  ) => void;
  toggleRunStyle: (
    id: string,
    range: { from: number; to: number },
    style: Partial<TextStyle> & { link?: string },
  ) => void;
}

interface EditorPersistState {
  saveQueue: number[];
  lastSavedAt: number | null;
  isOffline: boolean;
}

export interface CropDraft {
  nodeId: string;
  rect: { x: number; y: number; w: number; h: number };
}

function findNode(nodes: ComponentNode[], id: string): ComponentNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const c = findNode(n.children, id);
      if (c) return c;
    }
  }
  return null;
}

function findNodeWithParent(
  nodes: ComponentNode[],
  id: string,
  parent: ComponentNode | null = null,
): { node: ComponentNode; parent: ComponentNode | null; index: number } | null {
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (n.id === id) return { node: n, parent, index: i };
    if (n.children) {
      const c = findNodeWithParent(n.children, id, n);
      if (c) return c;
    }
  }
  return null;
}

function uuid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function lerp(
  a: { x: number; y: number },
  b: { x: number; y: number },
  t: number,
) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

export const useEditorStore = create<
  EditorState & EditorActions & EditorPersistState
>()(
  persist(
    (set, get) => {
      const apply = (recipe: (draft: EditorState) => void) => {
        const [next, patches, inverse] = produceWithPatches(get(), recipe);
        push(patches, inverse);
        set(next);
        schedulePersist();
      };

      return {
        tree: [],
        selectedIds: [],
        hoverId: null,
        pressId: null,
        camera: { x: 0, y: 0, zoom: 1 },
        meta: { version: 1, updatedAt: Date.now() },
        components: {},
        guides: [],
        assets: { images: {} },
        vector: { selection: {} },
        cropDraft: undefined,
        ui: {
          showRulers: false,
          showGuides: true,
          showSmartGuides: true,
          showOutline: false,
          activeTool: "select",
          showPreferences: false,
        },
        prefs: {
          showImageBadges: true,
          reduceMotion: false,
          snapPx: 4,
          showGrid: false,
          showPerfHud: false,
        },
        lastCommandId: undefined,
        devLog: [],
        recentCommands: [],
        review: { status: "DRAFT", requireApprovedToShare: false },
        comments: { threads: {}, users: {} },
        styles: { text: {} },
        textSel: undefined,
        saveQueue: [],
        lastSavedAt: null,
        isOffline: false,
        setHover(id) {
          set({ hoverId: id });
        },
        setPress(id) {
          set({ pressId: id });
        },
        select(ids) {
          set((state) => ({
            selectedIds:
              typeof ids === "function" ? ids(state.selectedIds) : ids,
          }));
        },
        updateNode(id, patch) {
          apply((draft) => {
            const node = findNode(draft.tree, id);
            if (node) Object.assign(node, patch);
          });
        },
        moveNode(id, dx, dy) {
          apply((draft) => {
            const node = findNode(draft.tree, id);
            if (node) {
              node.props = node.props || {};
              node.props.x = (node.props.x || 0) + dx;
              node.props.y = (node.props.y || 0) + dy;
            }
          });
        },
        resizeNode(id, next) {
          apply((draft) => {
            const node = findNode(draft.tree, id);
            if (node) {
              node.props = node.props || {};
              if (next.w !== undefined) node.props.w = next.w;
              if (next.h !== undefined) node.props.h = next.h;
            }
          });
        },
        rotateNode(id, deg) {
          apply((draft) => {
            const node = findNode(draft.tree, id);
            if (node) {
              node.props = node.props || {};
              node.props.rotation = deg;
            }
          });
        },
        duplicate(ids) {
          apply((draft) => {
            const targets = ids ?? draft.selectedIds;
            const touched = new Set<string>();
            const collect = (n: ComponentNode) => {
              if ((n as any).type === "Instance")
                touched.add((n as InstanceNode).componentId);
              if (n.children) n.children.forEach(collect);
            };
            targets.forEach((id) => {
              const node = findNode(draft.tree, id);
              if (node) {
                collect(node);
                const copy: ComponentNode = JSON.parse(JSON.stringify(node));
                copy.id = Math.random().toString(36).slice(2);
                draft.tree.push(copy);
                draft.selectedIds = [copy.id];
              }
            });
            touched.forEach((cid) => {
              const def = draft.components[cid];
              if (def) def.lastUsedAt = Date.now();
            });
            updateUsageCounts(draft);
          });
        },
        remove(ids) {
          apply((draft) => {
            const targets = ids ?? draft.selectedIds;
            const removeRec = (nodes: ComponentNode[]): ComponentNode[] =>
              nodes.filter((n) => {
                if (targets.includes(n.id)) return false;
                if (n.children) n.children = removeRec(n.children);
                return true;
              });
            draft.tree = removeRec(draft.tree);
            draft.selectedIds = [];
            updateUsageCounts(draft);
          });
        },
        addImageAsset(meta) {
          apply((draft) => {
            draft.assets = draft.assets || { images: {} };
            draft.assets.images[meta.id] = meta;
          });
        },
        removeImageAsset(id) {
          apply((draft) => {
            if (draft.assets?.images) delete draft.assets.images[id];
          });
        },
        addImageNode(meta, opts) {
          const id = uuid();
          const rect = get().getViewportRect();
          const pos = {
            x: opts?.x ?? rect.x + rect.w / 2 - meta.w / 2,
            y: opts?.y ?? rect.y + rect.h / 2 - meta.h / 2,
          };
          apply((draft) => {
            draft.assets = draft.assets || { images: {} };
            draft.assets.images[meta.id] = meta;
            const node: ImageNode = {
              id,
              type: "Image",
              props: {
                x: pos.x,
                y: pos.y,
                w: meta.w,
                h: meta.h,
                assetId: meta.id,
                fit: "contain",
                position: { x: 0.5, y: 0.5 },
              },
            };
            draft.tree.push(node);
            draft.selectedIds = [id];
          });
          return id;
        },
        updateImageNode(id, patch) {
          apply((draft) => {
            const node = findNode(draft.tree, id) as ImageNode | null;
            if (node && node.type === "Image") {
              node.props = { ...node.props, ...patch } as ImageProps;
            }
          });
        },
        replaceImageAsset(nodeId, newAssetId) {
          apply((draft) => {
            const node = findNode(draft.tree, nodeId) as ImageNode | null;
            if (node && node.type === "Image") {
              if (node.props) (node.props as any).assetId = newAssetId;
            }
          });
        },
        placeImages(assets, opts) {
          const ids: string[] = [];
          const cols = opts?.grid?.cols ?? 4;
          const gap = opts?.grid?.gap ?? 16;
          const rect = get().getViewportRect();
          const startX = opts?.start?.x ?? rect.x;
          const startY = opts?.start?.y ?? rect.y;
          apply((draft) => {
            draft.assets = draft.assets || { images: {} };
            assets.forEach((meta, i) => {
              draft.assets.images[meta.id] = meta;
              const short = Math.min(meta.w, meta.h);
              const scale = 240 / short;
              const w = meta.w * scale;
              const h = meta.h * scale;
              const col = i % cols;
              const row = Math.floor(i / cols);
              const x = startX + col * (w + gap);
              const y = startY + row * (h + gap);
              const id = uuid();
              const node: ImageNode = {
                id,
                type: "Image",
                props: {
                  x,
                  y,
                  w,
                  h,
                  assetId: meta.id,
                  fit: "contain",
                  position: { x: 0.5, y: 0.5 },
                },
              };
              draft.tree.push(node);
              ids.push(id);
            });
            if (ids.length) draft.selectedIds = [ids[ids.length - 1]];
          });
          return ids;
        },
        async placeFromClipboard(blob) {
          const meta = await saveImage(blob);
          return get().addImageNode(meta);
        },
        makeAutoLayout(frameId) {
          apply((draft) => {
            const target = frameId
              ? findNode(draft.tree, frameId)
              : findNode(draft.tree, draft.selectedIds[0]);
            if (target) {
              target.props = target.props || {};
              target.props.layout = "auto";
              if (!target.props.axis) target.props.axis = "vertical";
            }
          });
        },
        removeAutoLayout(frameId) {
          apply((draft) => {
            const target = frameId
              ? findNode(draft.tree, frameId)
              : findNode(draft.tree, draft.selectedIds[0]);
            if (target && target.props) {
              target.props.layout = "free";
            }
          });
        },
        reorderChild(parentId, from, to) {
          apply((draft) => {
            const parent = parentId
              ? findNode(draft.tree, parentId)
              : ({ children: draft.tree } as ComponentNode);
            if (parent && parent.children) {
              const c = parent.children.splice(from, 1)[0];
              parent.children.splice(to, 0, c);
            }
          });
        },
        setLayoutProps(id, patch) {
          apply((draft) => {
            const node = findNode(draft.tree, id);
            if (node) {
              node.props = { ...(node.props || {}), ...patch };
            }
          });
        },
        setSizeMode(id, axis, mode, value) {
          apply((draft) => {
            const node = findNode(draft.tree, id);
            if (!node) return;
            node.props = node.props || {};
            if (axis === "w") {
              node.props.widthMode = mode;
              if (mode === "FIXED" && value !== undefined) node.props.w = value;
            } else {
              node.props.heightMode = mode;
              if (mode === "FIXED" && value !== undefined) node.props.h = value;
            }
          });
        },
        createComponentFromSelection(name) {
          apply((draft) => {
            const sel = draft.selectedIds[0];
            const res = findNodeWithParent(draft.tree, sel);
            if (!res) return;
            const { node, parent, index } = res;
            const compId = Math.random().toString(36).slice(2);
            draft.components[compId] = {
              id: compId,
              name: name || node.name || "Component",
              root: node,
              usageCount: 0,
              lastUsedAt: Date.now(),
            } as ComponentDefinition;
            const instId = Math.random().toString(36).slice(2);
            const instance: InstanceNode = {
              id: instId,
              type: "Instance",
              componentId: compId,
              props: { ...node.props },
            };
            if (parent && parent.children) parent.children[index] = instance;
            else draft.tree[index] = instance;
            draft.selectedIds = [instId];
            updateUsageCounts(draft);
          });
        },
        deleteComponent(componentId) {
          apply((draft) => {
            delete draft.components[componentId];
          });
        },
        renameComponent(componentId, name) {
          apply((draft) => {
            const c = draft.components[componentId];
            if (c) c.name = name;
          });
        },
        createInstance(componentId, pos) {
          apply((draft) => {
            const def = draft.components[componentId];
            if (!def) return;
            const id = Math.random().toString(36).slice(2);
            const inst: InstanceNode = {
              id,
              type: "Instance",
              componentId,
              variant: {},
              overrides: {},
              props: { x: pos?.x || 0, y: pos?.y || 0 },
            };
            def.usageCount = (def.usageCount || 0) + 1;
            def.lastUsedAt = Date.now();
            draft.tree.push(inst);
            draft.selectedIds = [id];
          });
        },
        detachInstance(nodeId) {
          apply((draft) => {
            const res = findNodeWithParent(draft.tree, nodeId);
            if (!res) return;
            const inst = res.node as InstanceNode;
            const def = draft.components[inst.componentId];
            if (!def) return;
            let resolved = resolveVariant(def, inst.variant);
            if (inst.overrides) {
              resolved = applyOverrides(resolved, inst.overrides);
            }
            if (res.parent && res.parent.children)
              res.parent.children[res.index] = resolved;
            else draft.tree[res.index] = resolved;
            updateUsageCounts(draft);
          });
        },
        swapInstance(nodeId, nextComponentId) {
          apply((draft) => {
            const inst = findNode(draft.tree, nodeId) as InstanceNode | null;
            if (!inst) return;
            inst.componentId = nextComponentId;
            const def = draft.components[nextComponentId];
            if (def) def.lastUsedAt = Date.now();
            if (def?.axes) {
              inst.variant = inst.variant || {};
              // remove axes not in new component
              Object.keys(inst.variant).forEach((k) => {
                if (!def.axes || !def.axes[k]) delete inst.variant![k];
              });
              Object.entries(def.axes).forEach(([k, vals]) => {
                if (!inst.variant![k]) inst.variant![k] = vals[0];
              });
            }
            updateUsageCounts(draft);
          });
        },
        align(kind) {
          // TODO: implement alignment logic
        },
        distribute(kind, space) {
          // TODO: implement distribution logic
        },
        reorder(kind) {
          // TODO: implement reorder logic
        },
        addGuide(g) {
          apply((draft) => {
            draft.guides.push({
              id: Math.random().toString(36).slice(2),
              ...g,
            });
          });
        },
        moveGuide(id, pos) {
          apply((draft) => {
            const guide = draft.guides.find((gg) => gg.id === id);
            if (guide) guide.pos = pos;
          });
        },
        removeGuide(id) {
          apply((draft) => {
            draft.guides = draft.guides.filter((g) => g.id !== id);
          });
        },
        toggleRulers() {
          apply((draft) => {
            draft.ui = draft.ui || {};
            draft.ui.showRulers = !draft.ui.showRulers;
          });
        },
        toggleGuides() {
          apply((draft) => {
            draft.ui = draft.ui || {};
            draft.ui.showGuides = !draft.ui.showGuides;
          });
        },
        toggleOutline() {
          apply((draft) => {
            draft.ui = draft.ui || {};
            draft.ui.showOutline = !draft.ui.showOutline;
          });
        },
        toggleLayoutGrid() {
          apply((draft) => {
            draft.prefs = draft.prefs || {};
            draft.prefs.showGrid = !draft.prefs.showGrid;
          });
        },
        toggleSnapToPixel() {
          apply((draft) => {
            draft.prefs = draft.prefs || {};
            draft.prefs.snapPx = draft.prefs.snapPx ? 0 : 4;
          });
        },
        togglePreferences() {
          apply((draft) => {
            draft.ui = draft.ui || {};
            draft.ui.showPreferences = !draft.ui.showPreferences;
          });
        },
        setPrefs(patch) {
          apply((draft) => {
            draft.prefs = { ...(draft.prefs || {}), ...patch };
          });
        },
        async ensureDominantColor(assetId) {
          const asset = get().assets.images?.[assetId];
          if (asset?.dominant) return asset.dominant;
          const blob = await loadImage(assetId);
          if (!blob) return '#000000';
          const color = await computeDominantColor(blob);
          apply((draft) => {
            draft.assets.images[assetId].dominant = color;
          });
          return color;
        },
        booleanCombine(op, ids, opts) {
          const flat = opts?.flatness ?? 0.5;
          const replace = opts?.replace ?? false;
          const list = ids.length ? ids : get().selectedIds;
          if (list.length < 2) return "";
          let acc = flattenPath(
            findNode(get().tree, list[0]) as PathNode,
            flat,
          );
          let rings: ReturnType<typeof combinePolys> = acc.map((pl) => ({
            points: pl.points,
            outer: true,
          }));
          for (let i = 1; i < list.length; i++) {
            const nodeB = findNode(get().tree, list[i]) as PathNode;
            if (!nodeB) continue;
            const polyB = flattenPath(nodeB, flat);
            rings = combinePolys(op, acc, polyB);
            acc = rings.map((r) => ({ points: r.points, closed: true }));
          }
          if (!rings.length) return "";
          const newId = uuid();
          const subpaths = rings.map((r) =>
            r.points.map((pt) => ({ id: uuid(), x: pt.x, y: pt.y, corner: true })),
          );
          apply((draft) => {
            draft.tree.push({
              id: newId,
              type: "Path",
              closed: true,
              points: subpaths[0] || [],
              subpaths,
              props: { fillRule: "evenodd" },
            });
            if (replace) {
              draft.tree = draft.tree.filter((n) => !list.includes(n.id));
            }
          });
          return newId;
        },
        setLastCommand(id) {
          set({ lastCommandId: id });
        },
        logDev(entry) {
          set((state) => ({ devLog: [...(state.devLog || []), entry] }));
        },
        clearDevLog() {
          set({ devLog: [] });
        addRecentCommand(id) {
          set((state) => ({
            recentCommands: [id, ...state.recentCommands.filter((c) => c !== id)].slice(0, 10),
          }));
        },
        setCamera(cam) {
          set((state) => {
            const next = { ...state.camera, ...cam };
            if (next.zoom !== undefined) {
              next.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next.zoom));
            }
            return { camera: next };
          });
        },
        tweenCamera(cam) {
          const state = get();
          const next = { ...state.camera, ...cam } as Camera;
          if (next.zoom !== undefined) {
            next.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next.zoom));
          }
          set({ camera: next });
        },
        centerOn(pt) {
          const cam = get().camera;
          const vw = window.innerWidth / cam.zoom;
          const vh = window.innerHeight / cam.zoom;
          set({ camera: { ...cam, x: pt.x - vw / 2, y: pt.y - vh / 2 } });
        },
        getViewportRect() {
          const { camera } = get();
          const w = window.innerWidth;
          const h = window.innerHeight;
          return {
            x: camera.x,
            y: camera.y,
            w: w / camera.zoom,
            h: h / camera.zoom,
          };
        },
        getSelectionBounds() {
          const { selectedIds, tree } = get();
          if (!selectedIds.length) return null;
          const boxes = selectedIds
            .map((id) => {
              const n = findNode(tree, id);
              if (n?.props)
                return {
                  x: n.props.x || 0,
                  y: n.props.y || 0,
                  w: n.props.w || 0,
                  h: n.props.h || 0,
                };
              return null;
            })
            .filter(Boolean) as Array<{
            x: number;
            y: number;
            w: number;
            h: number;
          }>;
          const x1 = Math.min(...boxes.map((b) => b.x));
          const y1 = Math.min(...boxes.map((b) => b.y));
          const x2 = Math.max(...boxes.map((b) => b.x + b.w));
          const y2 = Math.max(...boxes.map((b) => b.y + b.h));
          return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
        },
        defineVariantAxis(componentId, axis, values) {
          apply((draft) => {
            const c = draft.components[componentId];
            if (!c) return;
            c.axes = c.axes || {};
            c.axes[axis] = values;
          });
        },
        setVariantRule(componentId, rule) {
          apply((draft) => {
            const c = draft.components[componentId];
            if (!c) return;
            c.rules = c.rules || [];
            c.rules.push(rule);
          });
        },
        removeVariantRule(componentId, index) {
          apply((draft) => {
            const c = draft.components[componentId];
            if (c?.rules) c.rules.splice(index, 1);
          });
        },
        setInstanceVariant(nodeId, axis, value) {
          apply((draft) => {
            const inst = findNode(draft.tree, nodeId) as InstanceNode | null;
            if (!inst) return;
            inst.variant = inst.variant || {};
            inst.variant[axis] = value;
          });
        },
        setInstanceOverride(nodeId, targetId, patch) {
          apply((draft) => {
            const inst = findNode(draft.tree, nodeId) as InstanceNode | null;
            if (!inst) return;
            inst.overrides = inst.overrides || {};
            const prev = inst.overrides[targetId] || {};
            inst.overrides[targetId] = { ...prev, ...patch };
          });
        },
        resetInstanceOverride(nodeId, targetId) {
          apply((draft) => {
            const inst = findNode(draft.tree, nodeId) as InstanceNode | null;
            if (!inst || !inst.overrides) return;
            if (targetId) delete inst.overrides[targetId];
            else inst.overrides = {};
          });
        },
        // --- v5 comments & review ---
        startPinAnnotation() {
          set((state) => ({
            comments: { ...state.comments, draft: { anchor: { kind: "PIN" } } },
          }));
        },
        startRectAnnotation() {
          set((state) => ({
            comments: {
              ...state.comments,
              draft: {
                anchor: { kind: "RECT", rect: { x: 0, y: 0, w: 0, h: 0 } },
              },
            },
          }));
        },
        placeAnnotationAt(pt) {
          set((state) => {
            const draft = state.comments.draft;
            if (draft?.anchor) {
              draft.anchor.x = pt.x;
              draft.anchor.y = pt.y;
            }
            return { comments: { ...state.comments, draft } };
          });
        },
        cancelAnnotation() {
          set((state) => ({
            comments: { ...state.comments, draft: undefined },
          }));
        },
        createThread(anchor, text) {
          set((state) => {
            const id = Math.random().toString(36).slice(2);
            const msgId = Math.random().toString(36).slice(2);
            const thread: CommentThread = {
              id,
              status: "OPEN",
              anchor,
              messages: [
                { id: msgId, userId: "local", createdAt: Date.now(), text },
              ],
            };
            return {
              comments: {
                ...state.comments,
                threads: { ...state.comments.threads, [id]: thread },
                draft: undefined,
              },
            };
          });
        },
        replyThread(threadId, text) {
          set((state) => {
            const thread = state.comments.threads[threadId];
            if (!thread) return { comments: state.comments } as any;
            const msgId = Math.random().toString(36).slice(2);
            thread.messages.push({
              id: msgId,
              userId: "local",
              createdAt: Date.now(),
              text,
            });
            return { comments: { ...state.comments } };
          });
        },
        resolveThread(threadId, byUserId) {
          set((state) => {
            const thread = state.comments.threads[threadId];
            if (thread) {
              thread.status = "RESOLVED";
              thread.resolvedBy = byUserId;
              thread.resolvedAt = Date.now();
            }
            return { comments: { ...state.comments } };
          });
        },
        reopenThread(threadId) {
          set((state) => {
            const thread = state.comments.threads[threadId];
            if (thread) thread.status = "REOPENED";
            return { comments: { ...state.comments } };
          });
        },
        addReaction(threadId, msgId, kind) {
          set((state) => {
            const msg = state.comments.threads[threadId]?.messages.find(
              (m) => m.id === msgId,
            );
            if (msg) {
              msg.reactions = msg.reactions || { "+1": [], heart: [] };
              const arr = msg.reactions[kind];
              if (!arr.includes("local")) arr.push("local");
            }
            return { comments: { ...state.comments } };
          });
        },
        removeReaction(threadId, msgId, kind, userId) {
          set((state) => {
            const msg = state.comments.threads[threadId]?.messages.find(
              (m) => m.id === msgId,
            );
            if (msg?.reactions?.[kind]) {
              msg.reactions[kind] = msg.reactions[kind].filter(
                (u) => u !== userId,
              );
            }
            return { comments: { ...state.comments } };
          });
        },
        setCommentsFilter(filter) {
          set((state) => ({
            comments: {
              ...state.comments,
              filter: { ...state.comments.filter, ...filter },
            },
          }));
        },
        setReviewStatus(s) {
          set((state) => ({ review: { ...state.review, status: s } }));
        },
        toggleRequireApprovedToShare() {
          set((state) => ({
            review: {
              ...state.review,
              requireApprovedToShare: !state.review.requireApprovedToShare,
            },
          }));
        },
        addPath(path) {
          apply((draft) => {
            path.props = {
              strokeCap: "butt",
              strokeJoin: "miter",
              miterLimit: 4,
              fillRule: "nonzero",
              ...path.props,
            };
            if (path.props.dash && path.props.dash.length === 0)
              path.props.dash = undefined;
            draft.tree.push(path);
          });
        },
        setPathProps(id, patch) {
          apply((draft) => {
            const node = findNode(draft.tree, id) as PathNode | null;
            if (!node || node.type !== "Path") return;
            node.props = { ...(node.props || {}) };
            for (const key of Object.keys(patch) as (keyof PathProps)[]) {
              const val = patch[key];
              if (key === "dash") {
                const arr =
                  val && val.length ? val.filter((n) => n > 0) : undefined;
                if (arr && arr.length) node.props[key] = arr as any;
                else delete node.props[key];
                continue;
              }
              if (val === undefined || val === null) delete node.props[key];
              else node.props[key] = val as any;
            }
            if (node.props.miterLimit === undefined) node.props.miterLimit = 4;
            if (node.props.fillRule === undefined)
              node.props.fillRule = "nonzero";
            if (node.props.strokeCap === undefined)
              node.props.strokeCap = "butt";
            if (node.props.strokeJoin === undefined)
              node.props.strokeJoin = "miter";
          });
        },
        selectPath(id, pointIds) {
          set((state) => ({
            selectedIds: id ? [id] : [],
            vector: { selection: { pathId: id || undefined, pointIds } },
          }));
        },
        setPoints(id, pts) {
          apply((draft) => {
            const node = findNode(draft.tree, id) as PathNode | null;
            if (node && node.type === "Path") {
              node.points = pts;
            }
          });
        },
        startPen() {
          set((state) => ({
            ui: { ...(state.ui || {}), activeTool: "pen" },
            vector: { ...(state.vector || {}), draft: undefined },
          }));
        },
        placePoint(pt) {
          apply((draft) => {
            draft.vector = draft.vector || {};
            if (!draft.vector.draft) {
              draft.vector.draft = { pathId: uuid(), points: [] };
            }
            const d = draft.vector.draft;
            const last = d.points[d.points.length - 1];
            if (!last || last.x !== pt.x || last.y !== pt.y) {
              d.points.push({
                id: uuid(),
                x: pt.x,
                y: pt.y,
                in: pt.in,
                out: pt.out,
                corner: pt.corner,
              });
            }
          });
        },
        deleteLast() {
          apply((draft) => {
            const d = draft.vector?.draft;
            if (d) {
              d.points.pop();
              if (d.points.length === 0) draft.vector!.draft = undefined;
            }
          });
        },
        closePath() {
          apply((draft) => {
            const d = draft.vector?.draft;
            if (!d) return;
            if (d.points.length < 2) {
              draft.vector!.draft = undefined;
              draft.ui = { ...(draft.ui || {}), activeTool: "select" };
              return;
            }
            const pts = d.points;
            const first = pts[0];
            const last = pts[pts.length - 1];
            const threshold = 6 / draft.camera.zoom;
            const dist = Math.hypot(last.x - first.x, last.y - first.y);
            const closed = dist <= threshold;
            if (closed) {
              last.x = first.x;
              last.y = first.y;
              if (pts.length > 1 && pts[pts.length - 1].id !== first.id) {
                pts.pop();
              }
            }
            draft.tree.push({
              id: d.pathId,
              type: "Path",
              closed,
              points: pts,
              props: { stroke: "#ffffff", fill: "none", strokeWidth: 1 },
            });
            draft.selectedIds = [d.pathId];
            draft.vector = { selection: { pathId: d.pathId } };
            draft.ui = { ...(draft.ui || {}), activeTool: "select" };
          });
        },
        cancelPen() {
          set((state) => ({
            ui: { ...(state.ui || {}), activeTool: "select" },
            vector: { ...(state.vector || {}), draft: undefined },
          }));
        },
        movePoint(id, to) {
          apply((draft) => {
            const update = (pts: PathPoint[]) => {
              const p = pts.find((q) => q.id === id);
              if (p) {
                const dx = to.x - p.x;
                const dy = to.y - p.y;
                p.x = to.x;
                p.y = to.y;
                if (p.in) {
                  p.in.x += dx;
                  p.in.y += dy;
                }
                if (p.out) {
                  p.out.x += dx;
                  p.out.y += dy;
                }
              }
            };
            draft.tree.forEach((n) => {
              if (n.type === "Path") update(n.points);
            });
            draft.vector?.draft && update(draft.vector.draft.points);
          });
        },
        moveHandle(id, kind, to, opts) {
          apply((draft) => {
            const update = (pts: PathPoint[]) => {
              const p = pts.find((q) => q.id === id);
              if (p) {
                (p as any)[kind] = { x: to.x, y: to.y };
                if (opts?.break) p.corner = true;
                if (!opts?.break && !p.corner) {
                  const other = kind === "in" ? "out" : "in";
                  (p as any)[other] = reflectHandle(
                    { x: p.x, y: p.y },
                    { x: to.x, y: to.y },
                  );
                }
              }
            };
            draft.tree.forEach((n) => {
              if (n.type === "Path") update(n.points);
            });
            draft.vector?.draft && update(draft.vector.draft.points);
          });
        },
        addPointOnSegment(pathId, segIndex, t) {
          apply((draft) => {
            const node = findNode(draft.tree, pathId) as PathNode | null;
            if (!node || node.type !== "Path") return;
            const pts = node.points;
            const a = pts[segIndex];
            const b = pts[(segIndex + 1) % pts.length];
            const p0 = a;
            const p1 = a.out || a;
            const p2 = b.in || b;
            const p3 = b;
            const a1 = lerp(p0, p1, t);
            const b1 = lerp(p1, p2, t);
            const c1 = lerp(p2, p3, t);
            const d1 = lerp(a1, b1, t);
            const e1 = lerp(b1, c1, t);
            const f1 = lerp(d1, e1, t);
            a.out = a1;
            b.in = c1;
            const newPt: PathPoint = {
              id: uuid(),
              x: f1.x,
              y: f1.y,
              in: d1,
              out: e1,
            };
            pts.splice(segIndex + 1, 0, newPt);
          });
        },
        toggleCorner(id) {
          apply((draft) => {
            const update = (pts: PathPoint[]) => {
              const p = pts.find((q) => q.id === id);
              if (p) {
                p.corner = !p.corner;
                if (!p.corner) {
                  if (p.out && !p.in) p.in = reflectHandle(p, p.out);
                  else if (p.in && !p.out) p.out = reflectHandle(p, p.in);
                  else if (p.in && p.out) {
                    p.in = reflectHandle(p, p.out);
                  }
                }
              }
            };
            draft.tree.forEach((n) => {
              if (n.type === "Path") update(n.points);
            });
            draft.vector?.draft && update(draft.vector.draft.points);
          });
        },
        toggleMask(nodeId, enabled) {
          apply((draft) => {
            const node = findNode(draft.tree, nodeId);
            if (node) {
              const next =
                enabled === undefined ? !(node as any).isMask : enabled;
              (node as any).isMask = next;
            }
          });
        },
        startCrop(nodeId) {
          apply((draft) => {
            const node = findNode(draft.tree, nodeId) as ImageNode | null;
            if (!node) return;
            const meta = draft.assets.images[node.props.assetId];
            const rect =
              node.props.crop || {
                x: 0,
                y: 0,
                w: meta?.w || node.props.w || 0,
                h: meta?.h || node.props.h || 0,
              };
            draft.cropDraft = { nodeId, rect };
            draft.ui = { ...(draft.ui || {}), activeTool: 'crop' };
          });
        },
        updateCrop(patch) {
          apply((draft) => {
            if (!draft.cropDraft) return;
            draft.cropDraft.rect = { ...draft.cropDraft.rect, ...patch };
          });
        },
        commitCrop() {
          apply((draft) => {
            if (!draft.cropDraft) return;
            const node = findNode(
              draft.tree,
              draft.cropDraft.nodeId,
            ) as ImageNode | null;
            if (node) {
              node.props = { ...node.props, crop: { ...draft.cropDraft.rect } };
            }
            draft.cropDraft = undefined;
            draft.ui = { ...(draft.ui || {}), activeTool: 'select' };
          });
        },
        cancelCrop() {
          apply((draft) => {
            draft.cropDraft = undefined;
            draft.ui = { ...(draft.ui || {}), activeTool: 'select' };
          });
        },
        // text actions implementations
        setActiveTool(tool) {
          set((state) => ({ ui: { ...(state.ui || {}), activeTool: tool } }));
        },
        addText({ x, y, text = '', style }) {
          const id = nanoid();
          apply((draft) => {
            draft.tree.push({
              id,
              type: 'Text',
              text,
              style: style || {
                fontFamily: 'sans-serif',
                fontSize: 16,
                letterSpacing: { unit: 'PERCENT', value: 0 },
              },
              props: { x, y, w: 0, h: 0 },
            } as TextNode);
            draft.selectedIds = [id];
          });
          return id;
        },
        updateText(id, text) {
          apply((draft) => {
            const n = findNode(draft.tree, id) as TextNode | null;
            if (n) {
              n.text = text;
              const size = layoutText(n);
              n.props = { ...(n.props || {}), w: size.w, h: size.h };
            }
          });
        },
        setTextStyle(id, patch) {
          apply((draft) => {
            const n = findNode(draft.tree, id) as TextNode | null;
            if (n) {
              Object.assign(n.style, patch);
              const size = layoutText(n);
              n.props = { ...(n.props || {}), w: size.w, h: size.h };
            }
          });
        },
        toggleEditText(id, active) {
          apply((draft) => {
            const n = findNode(draft.tree, id) as TextNode | null;
            if (n) n.edit = { active: active ?? !(n.edit?.active) };
          });
        },
        setTextResizeMode(id, mode) {
          apply((draft) => {
            const n = findNode(draft.tree, id) as TextNode | null;
            if (n) {
              n.resizeMode = mode;
              const size = layoutText(n);
              n.props = { ...(n.props || {}), w: size.w, h: size.h };
            }
          });
        },
        createTextStyle(name, style) {
          const id = nanoid();
          apply((draft) => {
            draft.styles.text[id] = { id, name, style };
          });
          return id;
        },
        updateTextStyle(id, style) {
          apply((draft) => {
            if (draft.styles.text[id]) draft.styles.text[id].style = style;
          });
          get().syncTextStyles(id);
        },
        applyTextStyle(nodeId, styleId) {
          apply((draft) => {
            const n = findNode(draft.tree, nodeId) as TextNode | null;
            const def = draft.styles.text[styleId];
            if (n && def) {
              n.styleRef = styleId;
              n.style = JSON.parse(JSON.stringify(def.style));
              const size = layoutText(n);
              n.props = { ...(n.props || {}), w: size.w, h: size.h };
            }
          });
        },
        detachTextStyle(nodeId) {
          apply((draft) => {
            const n = findNode(draft.tree, nodeId) as TextNode | null;
            if (n) n.styleRef = undefined;
          });
        },
        removeTextStyle(id) {
          apply((draft) => {
            delete draft.styles.text[id];
          });
        },
        syncTextStyles(styleId) {
          const def = get().styles.text[styleId];
          if (!def) return;
          apply((draft) => {
            const visit = (nodes: ComponentNode[]) => {
              nodes.forEach((n) => {
                if ((n as TextNode).type === 'Text') {
                  const t = n as TextNode;
                  if (t.styleRef === styleId) {
                    t.style = JSON.parse(JSON.stringify(def.style));
                    const size = layoutText(t);
                    t.props = { ...(t.props || {}), w: size.w, h: size.h };
                  }
                }
                if (n.children) visit(n.children);
              });
            };
            visit(draft.tree);
          });
        },
        setTextSelection(sel) {
          set({ textSel: sel });
        },
        clearTextSelection() {
          set({ textSel: undefined });
        },
        updateTextRuns(id, runs) {
          apply((draft) => {
            const n = findNode(draft.tree, id) as TextNode | null;
            if (n) n.runs = runs;
          });
        },
        applyRunStyle(id, range, style) {
          apply((draft) => {
            const n = findNode(draft.tree, id) as TextNode | null;
            if (!n) return;
            const from = Math.max(0, Math.min(range.from, range.to));
            const to = Math.min(n.text.length, Math.max(range.from, range.to));
            if (from === to) return;
            n.runs = n.runs?.filter((r) => !(r.from >= from && r.to <= to)) || [];
            n.runs.push({ from, to, style });
            n.runs.sort((a, b) => a.from - b.from);
          });
        },
        removeRunStyle(id, range, keys) {
          apply((draft) => {
            const n = findNode(draft.tree, id) as TextNode | null;
            if (!n) return;
            const from = Math.max(0, Math.min(range.from, range.to));
            const to = Math.min(n.text.length, Math.max(range.from, range.to));
            if (from === to) return;
            n.runs = removeRun(n.runs, from, to, keys);
          });
        },
        toggleRunStyle(id, range, style) {
          apply((draft) => {
            const n = findNode(draft.tree, id) as TextNode | null;
            if (!n) return;
            const from = Math.max(0, Math.min(range.from, range.to));
            const to = Math.min(n.text.length, Math.max(range.from, range.to));
            if (from === to) return;
            const applied = applyRun(n.runs, from, to, style);
            const same = JSON.stringify(applied) === JSON.stringify(n.runs || []);
            n.runs = same
              ? removeRun(n.runs, from, to, Object.keys(style) as (keyof TextStyle | 'link')[])
              : applied;
          });
        },
        undo() {
          set((state) => undoStack(state));
        },
        redo() {
          set((state) => redoStack(state));
        },
      };
    },
    {
      name: "uibuilder:editor",
      storage: createJSONStorage(() => idbStorage),
      version: 7,
      migrate: (persisted, version) => {
        if (!persisted) return persisted;
        const state = persisted as EditorState;
        if (version < 4) {
          const setLayout = (nodes: ComponentNode[]) => {
            nodes.forEach((n) => {
              n.props = n.props || {};
              if (!n.props.layout) n.props.layout = "free";
              if (n.children) setLayout(n.children);
            });
          };
          setLayout(state.tree);
        }
        if (version < 5) {
          if (!state.components) state.components = {} as any;
          const ensureVisible = (nodes: ComponentNode[]) => {
            nodes.forEach((n) => {
              if (!n.props) n.props = {};
              if (n.props.visible === undefined) n.props.visible = true;
              if (n.children) ensureVisible(n.children);
            });
          };
          ensureVisible(state.tree);
        }
        if (version < 6) {
          const migratePath = (nodes: ComponentNode[]) => {
            nodes.forEach((n) => {
              if (n.type === "Path") {
                n.props = n.props || {};
                if (n.props.miterLimit === undefined) n.props.miterLimit = 4;
                if (n.props.fillRule === undefined)
                  n.props.fillRule = "nonzero";
                if (n.props.strokeCap === undefined) n.props.strokeCap = "butt";
                if (n.props.strokeJoin === undefined)
                  n.props.strokeJoin = "miter";
                if (n.props.dash && n.props.dash.length) {
                  n.props.dash = n.props.dash.filter((d) => d > 0);
                  if (n.props.dash.length === 0) n.props.dash = undefined;
                }
              }
              if (n.children) migratePath(n.children);
            });
          };
          migratePath(state.tree);
        }
        if (version < 7) {
          if (!state.assets) state.assets = { images: {} } as any;
        }
        return state;
      },
    },
  ),
);

initPersist(useEditorStore);
