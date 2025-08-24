'use client';
import { useEffect, useMemo, useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { findNode } from '@/lib/tree';
import type { ComponentNode, InstanceNode, PrototypeLink } from '@/types/editor';
import { resolveVariant } from '@/lib/variantResolver';
import { applyOverrides } from '@/lib/overrideMerge';
import { resolveBinding } from '@/lib/binding/resolve';
import { PresenterHUD } from '@/components/preview/PresenterHUD';

function NodeRenderer({ node, onLink }: { node: ComponentNode; onLink: (l: PrototypeLink) => void }) {
  const components = useEditorStore((s) => s.components);
  if (node.type === 'Instance') {
    const inst = node as InstanceNode;
    const def = components[inst.defId || inst.componentId];
    if (!def) return null;
    let resolved = resolveVariant(def, inst.variantProps);
    if (inst.propValues)
      resolved = resolveBinding(resolved, def.props, inst.propValues || {});
    if (inst.overrides) resolved = applyOverrides(resolved, inst.overrides);
    resolved.props = { ...(resolved.props || {}), ...(inst.props || {}) };
    return <NodeRenderer node={resolved} onLink={onLink} />;
  }
  const layout = node.props?.layout || 'free';
  const style: any = {};
  if (layout === 'auto') {
    style.display = 'flex';
    style.flexDirection = node.props?.axis === 'horizontal' ? 'row' : 'column';
    if (node.props?.gap !== undefined) style.gap = node.props.gap;
  } else {
    style.position = 'absolute';
    style.left = node.props?.x || 0;
    style.top = node.props?.y || 0;
  }
  if (node.props?.w !== undefined) style.width = node.props.w;
  if (node.props?.h !== undefined) style.height = node.props.h;
  const link = node.prototypeLink;
  const handle = (e: any) => {
    e.stopPropagation();
    if (link) onLink(link);
  };
  if (node.type === 'Image') {
    return (
      <div style={style} onClick={handle} className={link ? 'cursor-pointer' : undefined}>
        <div className="w-full h-full bg-gray-300" />
      </div>
    );
  }
  if (node.type === 'Text') {
    return (
      <div style={style} onClick={handle} className={link ? 'cursor-pointer' : undefined}>
        {node.props?.text}
      </div>
    );
  }
  return (
    <div style={style} onClick={handle} className={link ? 'cursor-pointer' : undefined}>
      {node.children?.map((c) => (
        <NodeRenderer key={c.id} node={c} onLink={onLink} />
      ))}
    </div>
  );
}

export default function Player() {
  const tree = useEditorStore((s) => s.tree);
  const frames = tree;
  const [history, setHistory] = useState<string[]>(() => (frames[0] ? [frames[0].id] : []));
  const [overlay, setOverlay] = useState<string | null>(null);
  const currentId = history[history.length - 1];
  const current = findNode(tree, currentId) as ComponentNode | null;

  const activeLinks = useMemo(() => {
    if (!current) return [] as { node: ComponentNode; link: PrototypeLink }[];
    const arr: { node: ComponentNode; link: PrototypeLink }[] = [];
    const walk = (n: ComponentNode) => {
      const link = (n as any).prototypeLink as PrototypeLink | undefined;
      if (link) arr.push({ node: n, link });
      if (n.children) (n.children as ComponentNode[]).forEach(walk);
    };
    walk(current);
    return arr;
  }, [current]);

  const currentIndex = Math.max(0, frames.findIndex((f) => f.id === currentId));

  const doBack = () => {
    if (overlay) setOverlay(null);
    else setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
  };

  const goForward = () => {
    if (overlay) {
      setOverlay(null);
      return;
    }
    const nav = activeLinks.find((x) => x.link.kind === 'navigate' && x.link.targetId);
    if (nav?.link.targetId) {
      setHistory((h) => [...h, nav.link.targetId!]);
      return;
    }
    const ov = activeLinks.find((x) => x.link.kind === 'overlay' && x.link.targetId);
    if (ov?.link.targetId) {
      setOverlay(ov.link.targetId!);
      return;
    }
    const idx = frames.findIndex((f) => f.id === currentId);
    const next = frames[(idx + 1) % frames.length];
    if (next) setHistory((h) => [...h, next.id]);
  };

  const handleLink = (l: PrototypeLink) => {
    if (l.kind === 'navigate') setHistory((h) => [...h, l.targetId]);
    else if (l.kind === 'overlay') setOverlay(l.targetId);
    else if (l.kind === 'back') doBack();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault();
        doBack();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goForward();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, overlay, frames, activeLinks]);

  if (!current) return null;
  return (
    <div className="relative w-full h-full">
      <PresenterHUD
        title={(current as any).name ?? current.id}
        index={currentIndex}
        total={frames.length}
        overlayOpen={!!overlay}
        onBack={doBack}
        onForward={goForward}
      />
      <NodeRenderer node={current} onLink={handleLink} />
      {overlay && (
        <div
          className="absolute inset-0 bg-black/50 flex items-center justify-center"
          onClick={() => setOverlay(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <NodeRenderer node={findNode(tree, overlay)!} onLink={handleLink} />
          </div>
        </div>
      )}
    </div>
  );
}
