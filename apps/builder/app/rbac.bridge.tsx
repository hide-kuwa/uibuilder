// apps/builder/app/rbac.bridge.tsx
'use client'
import { useEffect } from 'react'

declare global {
  interface Window {
    __rbacWrapped?: boolean
    currentUserRole?: 'owner' | 'maintainer' | 'reviewer'
  }
}

const isDev = process.env.NODE_ENV !== 'production'

type Role = 'owner' | 'maintainer' | 'reviewer'
const DEFAULT_ROLE: Role = 'owner'
const allowMap: Record<Role, string[]> = {
  owner: ['*'],
  maintainer: ['Lineage', 'Publish', 'Reco', 'Reco+', 'Snippets', 'DS', 'DS+'],
  reviewer: ['Lineage', 'Snippets'],
}

type RightPaneTabRenderer = () => Element | DocumentFragment | JSX.Element | null | void

type RightPaneTabPayload = {
  key?: string
  label?: string
  render?: RightPaneTabRenderer
  [key: string]: unknown
}

type NormalizedRightPaneTab = {
  key: string
  label: string
  render: RightPaneTabRenderer
  original: RightPaneTabPayload
}

type RegisterRightPaneTab = (...args: any[]) => void

type RbacOptions = Record<string, unknown>
type Unmount = () => void

type RbacAPI = {
  mount?: (container: Element | DocumentFragment, props?: RbacOptions) => { unmount?: () => void } | void
  render?: (container: Element | DocumentFragment, props?: RbacOptions) => Element | DocumentFragment | JSX.Element | null | void
}

const DEFAULT_UNMOUNT: Unmount = () => {}

export default function RbacBridge() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.__rbacWrapped) return
    const orig = window.registerRightPaneTab as RegisterRightPaneTab | undefined
    if (typeof orig !== 'function') return
    window.__rbacWrapped = true

    window.registerRightPaneTab = (payload: unknown) => {
      const normalized = normalizeRightPaneTab(payload)
      if (!normalized) {
        logDevWarn('Unsupported tab payload received', payload)
        callOriginal(orig, payload, null)
        return
      }

      const { key, label, original } = normalized
      const role = (window.currentUserRole ?? DEFAULT_ROLE) as Role
      const allow = allowMap[role] || []
      const permitted = allow.includes('*') || allow.includes(label) || allow.includes(key)
      if (!permitted) {
        logDevWarn('Blocked right pane tab for role', { role, key, label })
        return
      }

      callOriginal(orig, original, normalized)
    }
  }, [])
  return null
}

/**
 * [append-only] RBAC ブリッジの idempotent & safety メモ
 *
 * - 右ペインのタブ登録は `RbacBridge` で wrap して一度だけ通す。
 * - `window.currentUserRole` は 'owner' | 'maintainer' | 'reviewer' などを想定。
 * - 許可ロールは allowMap（append-only で拡張）で制御。
 * - registerRightPaneTab の object / 3-args 両シグネチャに対応。
 * - 開発時の確認: DevTools で `window.currentUserRole = 'reviewer'` を設定してフィルタ挙動を確認。
 */

export function mountRBAC(
  container: Element | DocumentFragment | null,
  props?: RbacOptions
): Unmount {
  if (!container || typeof window === 'undefined') return DEFAULT_UNMOUNT
  const api = getAPI()
  if (!api || typeof api.mount !== 'function') {
    logDevWarn('RBAC mount API is unavailable')
    return DEFAULT_UNMOUNT
  }

  const result = api.mount(container, props)
  const maybeUnmount = result && typeof result === 'object' ? (result as any).unmount : undefined
  if (typeof maybeUnmount === 'function') {
    return () => {
      try {
        maybeUnmount()
      } catch (err) {
        logDevWarn('RBAC unmount handler threw', err)
      }
    }
  }
  return DEFAULT_UNMOUNT
}

export function renderRBAC(
  container: Element | DocumentFragment | null,
  props?: RbacOptions
): Element | null {
  if (!container || typeof window === 'undefined') return null
  const fallback = container instanceof Element ? container : firstElementChildOf(container)
  const api = getAPI()
  if (!api || typeof api.render !== 'function') {
    logDevWarn('RBAC render API is unavailable')
    return fallback
  }

  const out = api.render(container, props)
  if (out instanceof Element) return out
  if (out && out instanceof DocumentFragment) {
    return firstElementChildOf(out) ?? fallback
  }
  if (out == null) return fallback

  logDevWarn('RBAC render API returned an unexpected value', out)
  return fallback
}

function logDevWarn(message: string, detail?: unknown) {
  if (!isDev) return
  if (detail !== undefined) {
    console.warn('[RBAC]', message, detail)
  } else {
    console.warn('[RBAC]', message)
  }
}

function normalizeRightPaneTab(input: unknown): NormalizedRightPaneTab | null {
  if (!input || typeof input !== 'object') return null
  const candidate = input as RightPaneTabPayload
  const key = typeof candidate.key === 'string' && candidate.key.trim() ? candidate.key.trim() : undefined
  const labelSource = typeof candidate.label === 'string' && candidate.label.trim() ? candidate.label.trim() : undefined
  const label = labelSource ?? key
  const render = typeof candidate.render === 'function' ? candidate.render : undefined
  if (!key || !label || !render) return null
  return { key, label, render, original: candidate }
}

function callOriginal(orig: RegisterRightPaneTab, payload: unknown, normalized: NormalizedRightPaneTab | null) {
  const fn = orig as any
  try {
    fn(payload)
    return
  } catch {}

  if (normalized) {
    try {
      fn(normalized.original)
      return
    } catch {}
    try {
      fn(normalized.key, normalized.label, normalized.render)
      return
    } catch {}
  }

  if (payload && typeof payload === 'object') {
    const maybe = payload as any
    if (typeof maybe.key === 'string' && typeof maybe.label === 'string' && typeof maybe.render === 'function') {
      try {
        fn(maybe.key, maybe.label, maybe.render)
        return
      } catch {}
    }
  }

  logDevWarn('registerRightPaneTab passthrough failed', payload)
}

function firstElementChildOf(node: Element | DocumentFragment): Element | null {
  if (node instanceof Element) return node.firstElementChild
  return node.firstElementChild
}

function getAPI(): RbacAPI | undefined {
  if (typeof window === 'undefined') return undefined
  return window.__rbac as RbacAPI | undefined
}
