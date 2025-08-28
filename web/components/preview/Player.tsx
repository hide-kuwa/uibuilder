'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { findNode } from '@/lib/tree';
import type { ComponentNode, InstanceNode, PrototypeLink } from '@/types/editor';
import { resolveVariant } from '@/lib/variantResolver';
import { applyOverrides } from '@/lib/overrideMerge';
import { resolveBinding } from '@/lib/binding/resolve';
import { PresenterHUD } from '@/components/preview/PresenterHUD';
import { buildPoseMap, diffPoses, easeStandard } from '@/lib/animate/smart';
import { buildCombinedCss } from '@/lib/interactionCss';
import type { Effect } from '@/types/interactions';
import { useInteractionRegistry } from '@/store/interactionRegistry';

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
  const { presets, projectDefaultPresetIds } = useInteractionRegistry();
  const ownIds: string[] =
    (node.props?.presetIds || (node.props?.presetId ? [node.props.presetId] : [])) as string[];
  const ids = ownIds.length ? ownIds : projectDefaultPresetIds;
  const chosen = presets.filter((p) => ids.includes(p.id));
  const inlineHover = node.props?.hoverEffects as Effect[] | undefined;
  const inlineMs = node.props?.hoverTransitionMs as number | undefined;
  const css = buildCombinedCss(node.id, chosen, inlineHover, inlineMs);
  const link = node.prototypeLink;
  const handleClick = (e: any) => {
    if (!link) return;
    e.stopPropagation();
    const trig = link.trigger?.type || 'click';
    if (trig === 'click') onLink(link);
  };
  const handleHover = (e: any) => {
    if (!link) return;
    if (link.trigger?.type === 'hover') {
      e.stopPropagation();
      onLink(link);
    }
  };
  useEffect(() => {
    if (!link || link.trigger?.type !== 'delay') return;
    const id = setTimeout(() => onLink(link), link.trigger.ms ?? 300);
    return () => clearTimeout(id);
  }, [link, onLink]);
  if (node.type === 'Image') {
    return (
      <div
        style={style}
        data-node-id={node.id}
        data-node-type={node.type}
        data-node-name={(node as any).props?.name}
        onClick={handleClick}
        onMouseEnter={handleHover}
        className={link ? 'cursor-pointer' : undefined}
      >
        <div className="w-full h-full bg-gray-300" />
        {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      </div>
    );
  }
  if (node.type === 'Text') {
    return (
      <div
        style={style}
        data-node-id={node.id}
        data-node-type={node.type}
        data-node-name={(node as any).props?.name}
        onClick={handleClick}
        onMouseEnter={handleHover}
        className={link ? 'cursor-pointer' : undefined}
      >
        {node.props?.text}
        {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      </div>
    );
  }
  return (
    <div
      style={style}
      data-node-id={node.id}
      data-node-type={node.type}
      data-node-name={(node as any).props?.name}
      onClick={handleClick}
      onMouseEnter={handleHover}
      className={link ? 'cursor-pointer' : undefined}
    >
      {node.children?.map((c) => (
        <NodeRenderer key={c.id} node={c} onLink={onLink} />
      ))}
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
    </div>
  );
}

export default function Player() {
  const tree = useEditorStore((s) => s.tree);
  const frames = tree;
  const [history, setHistory] = useState<string[]>(() => (frames[0] ? [frames[0].id] : []));
  const [overlay, setOverlay] = useState<string | null>(null);
  const [tr, setTr] = useState<
    | { fromId: string; toId: string; kind: 'instant' | 'dissolve'; t0: number; dur: number }
    | null
  >(null);
  const rafRef = useRef<number | null>(null);
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

  const doBack = (kind: 'instant' | 'dissolve' = 'dissolve') => {
    if (overlay) setOverlay(null);
    else
      setHistory((h) => {
        if (h.length <= 1) return h;
        startTransition(h[h.length - 1], h[h.length - 2], kind);
        return h.slice(0, -1);
      });
  };

  const goForward = (kind: 'instant' | 'dissolve') => {
    if (overlay) {
      setOverlay(null);
      return;
    }
    const nav = activeLinks.find((x) => x.link.kind === 'navigate' && x.link.targetId);
    if (nav?.link.targetId) {
      setHistory((h) => {
        const fromId = h[h.length - 1];
        const anim = nav.link.animation === 'instant' ? 'instant' : kind;
        startTransition(fromId, nav.link.targetId!, anim);
        return [...h, nav.link.targetId!];
      });
      return;
    }
    const ov = activeLinks.find((x) => x.link.kind === 'overlay' && x.link.targetId);
    if (ov?.link.targetId) {
      setOverlay(ov.link.targetId!);
      return;
    }
    const idx = frames.findIndex((f) => f.id === currentId);
    const next = frames[(idx + 1) % frames.length];
    if (next)
      setHistory((h) => {
        const fromId = h[h.length - 1];
        startTransition(fromId, next.id, kind);
        return [...h, next.id];
      });
  };

  const handleLink = (l: PrototypeLink) => {
    if (l.kind === 'navigate')
      setHistory((h) => {
        const fromId = h[h.length - 1];
        const anim = l.animation === 'instant' ? 'instant' : 'dissolve';
        startTransition(fromId, l.targetId, anim);
        return [...h, l.targetId];
      });
    else if (l.kind === 'overlay') setOverlay(l.targetId);
    else if (l.kind === 'back') doBack(l.animation === 'instant' ? 'instant' : 'dissolve');
  };

  function startTransition(fromId: string, toId: string, kind: 'instant' | 'dissolve') {
    if (kind === 'instant') {
      setTr(null);
      return;
    }
    try {
      const fromNode = findNode(tree, fromId);
      const toNode = findNode(tree, toId);
      if (fromNode && toNode) {
        const before = buildPoseMap(fromNode);
        const after = buildPoseMap(toNode);
        // Future use: per-node interpolation
        void diffPoses(before, after);
      }
    } catch {
      // ignore errors
    }
    setTr({ fromId, toId, kind, t0: performance.now(), dur: 200 });
  }

  const progress = useTransitionProgress(tr);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault();
        doBack('dissolve');
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goForward('dissolve');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, overlay, frames, activeLinks]);

  if (!current) return null;
  return (
    <div className="relative w-full h-full" data-actions-enabled="true">
      <PresenterHUD
        title={(current as any).name ?? current.id}
        index={currentIndex}
        total={frames.length}
        overlayOpen={!!overlay}
        onBack={() => doBack('dissolve')}
        onForward={() => goForward('dissolve')}
      />
      {tr && tr.kind === 'dissolve' && (
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 1 - progress }}>
          <NodeRenderer node={findNode(tree, tr.fromId)!} onLink={handleLink} />
        </div>
      )}
      <div className="absolute inset-0" style={{ opacity: tr?.kind === 'dissolve' ? progress : 1 }}>
        <NodeRenderer node={current} onLink={handleLink} />
      </div>
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

function useTransitionProgress(tr: { t0: number; dur: number; kind: 'instant' | 'dissolve' } | null) {
  const [p, setP] = useState(1);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (!tr || tr.kind === 'instant') {
      setP(1);
      return;
    }
    const loop = () => {
      const now = performance.now();
      const raw = Math.min(1, (now - tr.t0) / tr.dur);
      const eased = easeStandard(raw);
      setP(eased);
      if (raw < 1) raf.current = requestAnimationFrame(loop);
      else if (raf.current) cancelAnimationFrame(raf.current);
    };
    setP(0);
    raf.current = requestAnimationFrame(loop);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [tr]);
  return p;
}
