'use client'

import React, { useMemo } from 'react'
import type { ComponentNode, Bindings, Binding } from '@chizu/types'
import { entries as registryEntries } from '@chizu/registry'
import CanvasRoot from '@/components/canvas/CanvasRoot'
import Repeat from '@/components/runtime/Repeat'

export type RuntimeValue = {
  page?: Record<string, any>
  frame?: Record<string, any>
  app?: Record<string, any>
  api?: Record<string, any>
}

type CanvasRendererProps = {
  tree: ComponentNode[]
  runtime?: RuntimeValue
  builderManifest?: ComponentNode[] | null
  isMetaMode?: boolean
  className?: string
  pageId?: string
}

const FACTORY_MANIFEST: ComponentNode[] = [
  {
    id: 'factory-frame',
    type: 'Frame_Basic',
    slots: {
      header: [
        {
          id: 'factory-nav',
          type: 'TopNav',
        },
      ],
      sidebar: [
        {
          id: 'factory-pref-list',
          type: 'PrefList',
        },
      ],
      content: [
        {
          id: 'factory-hero',
          type: 'Hero',
          props: { title: 'Safe Mode' },
        },
        {
          id: 'factory-text',
          type: 'Text',
          props: {
            text: 'Builder manifest could not be loaded. Showing fallback layout.',
          },
        },
      ],
      footer: [],
    },
  },
]

const SLOT_ROOT_ID = 'page.root'

const separatorStyle: React.CSSProperties = { height: 8, margin: '-4px 0', opacity: 0 }

function SlotContainer({
  slotId,
  nodeId,
  children,
  className,
  style,
}: {
  slotId: string
  nodeId: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const items = React.Children.toArray(children)
  const mergedClassName = className ? `relative ${className}` : 'relative'
  return (
    <div data-slot={slotId} data-node-id={nodeId} className={mergedClassName} style={style}>
      <div data-drop-sep="true" data-drop-before="true" data-child-index={0} style={separatorStyle} aria-hidden="true" />
      {items.map((child, index) => (
        <React.Fragment key={`slot-${nodeId}-${slotId}-${index}`}>
          {child}
          <div
            data-drop-sep="true"
            data-drop-before="true"
            data-child-index={index + 1}
            style={separatorStyle}
            aria-hidden="true"
          />
        </React.Fragment>
      ))}
    </div>
  )
}

type BindingScope = 'local' | 'page' | 'frame' | 'app' | 'api'

type RepeatNode = ComponentNode & { kind?: 'Repeat'; dataPath?: string; itemKey?: string }

function getRef(runtime: RuntimeValue, scope: BindingScope, path: string) {
  const root =
    scope === 'page'
      ? runtime.page
      : scope === 'frame'
      ? runtime.frame
      : scope === 'app'
      ? runtime.app
      : scope === 'api'
      ? runtime.api
      : undefined
  if (!root) return undefined
  if (!path) return root
  const parts = path.split('.').filter(Boolean)
  let cur: any = root
  for (const p of parts) {
    if (cur == null) return undefined
    cur = cur[p]
  }
  return cur
}

function evalFormula(expr: string, inputs: any[]) {
  // eslint-disable-next-line no-new-func
  const f = new Function('$0', '$1', '$2', '$3', '$4', `return (${expr})`)
  return f(inputs[0], inputs[1], inputs[2], inputs[3], inputs[4])
}

function resolveBindings(
  runtime: RuntimeValue,
  nodeId: string,
  props: Record<string, any>,
  bindings?: Bindings,
) {
  if (!bindings) return props
  const out: Record<string, any> = { ...props }
  for (const [prop, binding] of Object.entries(bindings)) {
    const b = binding as Binding
    try {
      const ins = (b.inputs ?? []).map((input) =>
        getRef(runtime, (input as any).scope as BindingScope, (input as any).path ?? ''),
      )
      const val = b.formula?.expr ? evalFormula(b.formula.expr, ins) : ins[0]
      if (val !== undefined) out[prop] = val
    } catch (err) {
      console.warn(`[binding:${nodeId}.${prop}]`, err)
    }
  }
  return out
}

function renderNode(node: ComponentNode, runtime: RuntimeValue): React.ReactNode {
  if (!node) return null
  const maybeRepeat = node as RepeatNode
  if (maybeRepeat.kind === 'Repeat') {
    const children = (maybeRepeat.children ?? []).map((child) => renderNode(child, runtime))
    return (
      <Repeat
        key={maybeRepeat.id}
        runtime={runtime}
        dataPath={maybeRepeat.dataPath}
        itemKey={maybeRepeat.itemKey}
        data={(maybeRepeat as any).data as any[]}
      >
        {children}
      </Repeat>
    )
  }

  const entry = (registryEntries as any)[node.type]
  if (!entry || typeof entry.render !== 'function') {
    return (
      <div
        key={node.id}
        style={{
          padding: '12px',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: 8,
          fontSize: 12,
          color: '#b91c1c',
        }}
      >
        Unknown component: {node.type}
      </div>
    )
  }

  const resolvedProps = resolveBindings(runtime, node.id, node.props ?? {}, node.bindings)
  const slotNodes = node.slots
    ? Object.fromEntries(
        Object.entries(node.slots).map(([slotName, slotChildren]) => {
          const renderedChildren = (slotChildren ?? []).map((child) => renderNode(child, runtime))
          return [
            slotName,
            [
              <SlotContainer key={`${node.id}:${slotName}`} slotId={slotName} nodeId={node.id}>
                {renderedChildren}
              </SlotContainer>,
            ],
          ]
        }),
      )
    : undefined
  const childNodes = (node.children ?? []).map((child) => renderNode(child, runtime))

  let rendered: React.ReactNode
  try {
    rendered = entry.render(resolvedProps, slotNodes, runtime)
  } catch (err) {
    console.error(`[render:${node.type}]`, err)
    rendered = (
      <div
        style={{
          padding: '12px',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: 8,
          fontSize: 12,
          color: '#b91c1c',
        }}
      >
        Render failed: {String(node.type)}
      </div>
    )
  }

  if (React.isValidElement(rendered) && childNodes.length > 0) {
    return (
      <React.Fragment key={node.id}>
        {React.cloneElement(rendered, rendered.props, (
          <>
            {rendered.props?.children}
            {childNodes}
          </>
        ))}
      </React.Fragment>
    )
  }

  if (childNodes.length > 0) {
    return (
      <React.Fragment key={node.id}>
        {rendered}
        {childNodes}
      </React.Fragment>
    )
  }

  return <React.Fragment key={node.id}>{rendered}</React.Fragment>
}

function isRenderableManifest(nodes: ComponentNode[] | null | undefined): nodes is ComponentNode[] {
  if (!Array.isArray(nodes)) return false
  const visit = (arr: ComponentNode[]): boolean => {
    for (const node of arr) {
      if (!node || typeof node !== 'object') return false
      const maybeRepeat = node as RepeatNode
      if (maybeRepeat.kind === 'Repeat') {
        if (maybeRepeat.children && !visit(maybeRepeat.children)) return false
        continue
      }
      if (typeof node.id !== 'string' || typeof node.type !== 'string') return false
      const entry = (registryEntries as any)[node.type]
      if (!entry || typeof entry.render !== 'function') return false
      if (node.children && !visit(node.children)) return false
      if (node.slots) {
        for (const slotChildren of Object.values(node.slots)) {
          if (slotChildren && !visit(slotChildren)) return false
        }
      }
    }
    return true
  }
  return visit(nodes)
}

export function CanvasRenderer({
  tree,
  runtime,
  builderManifest,
  isMetaMode = false,
  className,
  pageId,
}: CanvasRendererProps) {
  const runtimeValue = useMemo(() => runtime ?? {}, [runtime])

  const { nodesToRender, fallbackActive } = useMemo(() => {
    if (isMetaMode) {
      if (isRenderableManifest(builderManifest)) {
        return { nodesToRender: builderManifest, fallbackActive: false }
      }
      return { nodesToRender: FACTORY_MANIFEST, fallbackActive: true }
    }
    const base = Array.isArray(tree) ? tree : []
    return { nodesToRender: base, fallbackActive: false }
  }, [builderManifest, isMetaMode, tree])

  const canvasPageId = pageId ?? 'page-root'

  return (
    <CanvasRoot className={className} fallbackActive={fallbackActive} pageId={canvasPageId}>
      {fallbackActive ? (
        <div
          style={{
            marginBottom: 12,
            padding: '8px 12px',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 8,
            background: '#fff7ed',
            color: '#9a3412',
            fontSize: 12,
          }}
        >
          Safe Mode: Builder manifest fallback applied. Please review your saved layout.
        </div>
      ) : null}
      <SlotContainer slotId={SLOT_ROOT_ID} nodeId={canvasPageId} style={{ display: 'grid', gap: 12 }}>
        {nodesToRender.map((node) => renderNode(node, runtimeValue))}
      </SlotContainer>
    </CanvasRoot>
  )
}











