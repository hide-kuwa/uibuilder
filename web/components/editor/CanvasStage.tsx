'use client';
import { useEditorStore } from '@/store/editorStore';
import SelectionBox from './SelectionBox';
import ResizeHandles from './ResizeHandles';
import SVGLayer from './SVGLayer';
import PathEditorOverlay from './PathEditorOverlay';
import PenTool from './tools/PenTool';
import ImageView from './ImageView';
import type { ComponentNode, InstanceNode, PathNode, ImageNode } from '@/types/editor';
import { sizeStyle } from '@/lib/flex';
import { resolveVariant } from '@/lib/variantResolver';
import { applyOverrides } from '@/lib/overrideMerge';
import ZoomControls from './ZoomControls';
import { wheelRouter } from '@/lib/input/wheelRouter';
import * as zoom from '@/lib/zoom';
import { useRef } from 'react';
import { saveImage } from '@/lib/assets';

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
  const style: any = {};
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
    return (
      <div style={style}>
        {asset && <ImageView node={node as ImageNode} meta={asset} />}
      </div>
    );
  }

  if (layout === 'auto') {
    return (
      <div
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
  return (
    <div
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

  const panning = useRef(false);
  const last = useRef({ x: 0, y: 0, t: 0, vx: 0, vy: 0 });

  const handleFiles = async (files: FileList) => {
    for (const file of Array.from(files)) {
      const meta = await saveImage(file);
      useEditorStore.getState().addImageNode(meta);
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    panning.current = true;
    last.current = { x: e.clientX, y: e.clientY, t: performance.now(), vx: 0, vy: 0 };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!panning.current) return;
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
    if (panning.current) {
      panning.current = false;
      zoom.panWithInertia(last.current.vx, last.current.vy);
    }
  };

  return (
    <div
      className="relative bg-gray-900 overflow-hidden"
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
      onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
      }}
      onDragOver={(e) => e.preventDefault()}
      onPaste={(e) => {
        if (e.clipboardData.files?.length) handleFiles(e.clipboardData.files);
      }}
      onPointerDown={activeTool === 'pen' ? undefined : onPointerDown}
      onPointerMove={activeTool === 'pen' ? undefined : onPointerMove}
      onPointerUp={activeTool === 'pen' ? undefined : onPointerUp}
    >
      {tree.map((n) => (
        <NodeView key={n.id} node={n} components={components} />
      ))}
      <SVGLayer />
      <PathEditorOverlay />
      {activeTool === 'pen' && <PenTool />}
      {prefs.showLayoutGrid && (
        <div className="absolute inset-0 pointer-events-none layout-grid" />
      )}
      {prefs.showPixelGrid && (
        <div className="absolute inset-0 pointer-events-none pixel-grid" />
      )}
      {selected.length === 1 && <SelectionBox />}
      {selected.length === 1 && <ResizeHandles />}
      <div className="absolute top-2 right-2"><ZoomControls /></div>
    </div>
  );
}
