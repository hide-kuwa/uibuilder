'use client';
import { useEditorStore } from '@/store/editorStore';
import SelectionOutline from './SelectionOutline';
import ResizeHandles from './ResizeHandles';
import SVGLayer from './SVGLayer';
import PathEditorOverlay from './PathEditorOverlay';
import PenTool from './tools/PenTool';
import ImageView from './ImageView';
import TextView from './TextView';
import TextEditor from './TextEditor';
import ImageCropOverlay from './ImageCropOverlay';
import type { ComponentNode, InstanceNode, PathNode, ImageNode, TextNode } from '@/types/editor';
import { sizeStyle } from '@/lib/flex';
import { resolveVariant } from '@/lib/variantResolver';
import { applyOverrides } from '@/lib/overrideMerge';
import ZoomControls from './ZoomControls';
import { wheelRouter } from '@/lib/input/wheelRouter';
import * as zoom from '@/lib/zoom';
import { useRef, useState, useEffect } from 'react';
import { saveImageMulti } from '@/lib/assets';
import DropOverlay from './DropOverlay';
import MarqueeZoom from './MarqueeZoom';
import Minimap from '@/components/hud/Minimap';

function NodeView({
  node,
  components,
  parentLayout,
  parentAxis,
}: {
  node: ComponentNode;
  components: Record<string, any>;
  parentLayout?: string;
  parentAxis?: 'horizontal' | 'vertical';
}) {
  const hoverId = useEditorStore((s) => s.hoverId);
  const pressId = useEditorStore((s) => s.pressId);
  const setHover = useEditorStore((s) => s.setHover);
  const setPress = useEditorStore((s) => s.setPress);
  if (node.type === 'Path') {
    return null;
  }
  if (node.type === 'Instance') {
    const inst = node as InstanceNode;
    const def = components[inst.componentId];
    if (def) {
      let resolved = resolveVariant(def, inst.variant);
      if (inst.overrides) resolved = applyOverrides(resolved, inst.overrides);
      resolved.props = { ...(resolved.props || {}), ...(inst.props || {}) };
      return (
        <NodeView
          node={resolved}
          components={components}
          parentLayout={parentLayout}
          parentAxis={parentAxis}
        />
      );
    }
  }
  const style: any = {
    transition: 'opacity var(--motion-fast) var(--easing-standard), transform var(--motion-fast) var(--easing-standard)',
    opacity: hoverId === node.id ? 1 : 0.85,
    transform: pressId === node.id ? 'scale(0.98)' : undefined,
  };
  const layout = node.props?.layout || 'free';
  if (node.props?.visible === false) style.display = 'none';
  if (layout === 'auto') {
    style.display = 'flex';
    style.flexDirection = node.props?.axis === 'horizontal' ? 'row' : 'column';
    if (node.props?.gap !== undefined) style.gap = node.props.gap;
    if (node.props?.padding !== undefined) {
      const p = node.props.padding;
      if (typeof p === 'number') style.padding = p;
      else
        style.padding = `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`;
    }
    if (node.props?.alignItems) style.alignItems = node.props.alignItems;
    if (node.props?.justifyContent)
      style.justifyContent = node.props.justifyContent;
    if (node.props?.wrap) style.flexWrap = 'wrap';
  } else {
    style.position = parentLayout === 'auto' ? 'absolute' : 'absolute';
    style.left = node.props?.x || 0;
    style.top = node.props?.y || 0;
    Object.assign(style, sizeStyle(node, parentAxis));
  }

  if (node.type === 'Image') {
    const asset = useEditorStore(
      (s) => (node.props as any).assetId && s.assets?.images[(node.props as any).assetId]
    );
    const common = {
      onPointerEnter: () => setHover(node.id),
      onPointerLeave: () => {
        setHover(null);
        setPress(null);
      },
      onPointerDown: (e: React.PointerEvent) => {
        setPress(node.id);
        e.stopPropagation();
      },
      onPointerUp: () => setPress(null),
    };
    return (
      <div {...common} style={style}>
        {asset && <ImageView node={node as ImageNode} meta={asset} />}
      </div>
    );
  }

  if (node.type === 'Text') {
    const t = node as TextNode;
    return (
      <>
        <TextView node={t} />
        {t.edit?.active && <TextEditor node={t} />}
      </>
    );
  }

  if (layout === 'auto') {
    const common = {
      onPointerEnter: () => setHover(node.id),
      onPointerLeave: () => {
        setHover(null);
        setPress(null);
      },
      onPointerDown: (e: React.PointerEvent) => {
        setPress(node.id);
        e.stopPropagation();
      },
      onPointerUp: () => setPress(null),
    };
    return (
      <div
        {...common}
        className="border border-gray-700 text-xs text-white"
        style={style}
      >
        {node.props?.text}
        {node.children?.map((c) => (
          <NodeView
            key={c.id}
            node={c}
            components={components}
            parentLayout={layout}
            parentAxis={node.props?.axis}
          />
        ))}
      </div>
    );
  }
  const common = {
    onPointerEnter: () => setHover(node.id),
    onPointerLeave: () => {
      setHover(null);
      setPress(null);
    },
    onPointerDown: (e: React.PointerEvent) => {
      setPress(node.id);
      e.stopPropagation();
    },
    onPointerUp: () => setPress(null),
  };
  return (
    <div
      {...common}
      className="border border-gray-700 text-xs text-white"
      style={style}
    >
      {node.props?.text || node.type}
      {node.children?.map((c) => (
        <NodeView
          key={c.id}
          node={c}
          components={components}
          parentLayout={layout}
          parentAxis={node.props?.axis}
        />
      ))}
    </div>
  );
}

export default function CanvasStage() {
  const tree = useEditorStore((s) => s.tree);
  const selected = useEditorStore((s) => s.selectedIds);
  const components = useEditorStore((s) => s.components);
  const prefs = useEditorStore((s) => s.prefs || {});
  const activeTool = useEditorStore((s) => s.ui?.activeTool || 'select');
  const placeImages = useEditorStore((s) => s.placeImages);
  const replaceImageAsset = useEditorStore((s) => s.replaceImageAsset);
  const placeFromClipboard = useEditorStore((s) => s.placeFromClipboard);
  const addText = useEditorStore((s) => s.addText);
  const toggleEditText = useEditorStore((s) => s.toggleEditText);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);

  const panning = useRef(false);
  const last = useRef({ x: 0, y: 0, t: 0, vx: 0, vy: 0 });

  const [dragCount, setDragCount] = useState<number | null>(null);
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);

  const cursorMap: Record<string, string> = {
    pen: 'crosshair',
    crop: 'crosshair',
  };

  const handleFiles = async (files: FileList) => {
    const metas = await saveImageMulti(files);
    if (selected.length === 1 && files.length === 1) {
      useEditorStore.getState().addImageAsset(metas[0]);
      replaceImageAsset(selected[0], metas[0].id);
    } else {
      placeImages(metas);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 't' || e.key === 'T') {
        setActiveTool('text');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setActiveTool]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (activeTool === 'text') {
      const state = useEditorStore.getState();
      const x = state.camera.x + e.clientX / state.camera.zoom;
      const y = state.camera.y + e.clientY / state.camera.zoom;
      const id = addText({ x, y });
      toggleEditText(id, true);
      return;
    }
    if (e.shiftKey) {
      setMarqueeStart({ x: e.clientX, y: e.clientY });
      return;
    }
    panning.current = true;
    last.current = { x: e.clientX, y: e.clientY, t: performance.now(), vx: 0, vy: 0 };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!panning.current || marqueeStart) return;
    const now = performance.now();
    const state = useEditorStore.getState();
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    state.setCamera({
      x: state.camera.x - dx / state.camera.zoom,
      y: state.camera.y - dy / state.camera.zoom,
    });
    last.current.vx = dx / (now - last.current.t);
    last.current.vy = dy / (now - last.current.t);
    last.current.x = e.clientX;
    last.current.y = e.clientY;
    last.current.t = now;
  };

  const onPointerUp = () => {
    if (panning.current && !marqueeStart) {
      panning.current = false;
      zoom.panWithInertia(last.current.vx, last.current.vy);
    }
  };

  return (
    <div
      className="relative bg-gray-900 overflow-hidden"
      style={{ cursor: cursorMap[activeTool] || 'default' }}
      tabIndex={0}
      onWheel={(e) => {
        const act = wheelRouter(e);
        const state = useEditorStore.getState();
        if (act.type === 'zoom') zoom.zoomBy(act.factor, act.anchor);
        else
          state.setCamera({
            x: state.camera.x - act.dx,
            y: state.camera.y - act.dy,
          });
        e.preventDefault();
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        if (e.dataTransfer.items?.length) setDragCount(e.dataTransfer.items.length);
      }}
      onDragLeave={(e) => {
        if (e.target === e.currentTarget) setDragCount(null);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragCount(null);
        if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
      }}
      onDragOver={(e) => e.preventDefault()}
      onPaste={(e) => {
        const item = Array.from(e.clipboardData.items || []).find((i) =>
          i.type.startsWith('image/')
        );
        if (item) {
          const file = item.getAsFile();
          if (file) placeFromClipboard(file);
        }
      }}
      onPointerDown={activeTool === 'pen' ? undefined : onPointerDown}
      onPointerMove={activeTool === 'pen' ? undefined : onPointerMove}
      onPointerUp={activeTool === 'pen' ? undefined : onPointerUp}
    >
      {tree.map((n) => (
        <NodeView key={n.id} node={n} components={components} />
      ))}
      {dragCount !== null && <DropOverlay count={dragCount} />}
      {marqueeStart && (
        <MarqueeZoom start={marqueeStart} onEnd={() => setMarqueeStart(null)} />
      )}
      <SVGLayer />
      <PathEditorOverlay />
      <ImageCropOverlay />
      {activeTool === 'pen' && <PenTool />}
      {prefs.showGrid && (
        <div className="absolute inset-0 pointer-events-none layout-grid" />
      )}
      {selected.length === 1 && <SelectionOutline />}
      {selected.length === 1 && <ResizeHandles />}
      <div className="absolute top-2 right-2"><ZoomControls /></div>
      <div className="minimap"><Minimap /></div>
    </div>
  );
}
