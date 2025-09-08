// apps/builder/app/rbac.bridge.tsx
'use client'
import { useEffect } from 'react'

declare global {
  interface Window {
    registerRightPaneTab?: (key: string, label: string, render: any) => void
    __rbacWrapped?: boolean
    currentUserRole?: 'owner' | 'maintainer' | 'reviewer'
  }
}

const DEFAULT_ROLE: NonNullable<typeof window.currentUserRole> = 'owner'
const allowMap: Record<'owner' | 'maintainer' | 'reviewer', string[]> = {
  owner: ['*'],
  maintainer: ['Lineage', 'Publish', 'Reco', 'Reco+', 'Snippets', 'DS', 'DS+'],
  reviewer: ['Lineage', 'Snippets'],
}

export default function RbacBridge() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.__rbacWrapped) return
    const orig = window.registerRightPaneTab
    if (typeof orig !== 'function') return
    window.__rbacWrapped = true

    window.registerRightPaneTab = (key: string, label: string, render: any) => {
      const role = window.currentUserRole || DEFAULT_ROLE
      const allow = allowMap[role] || []
      const permitted = allow.includes('*') || allow.includes(label) || allow.includes(key)
      if (!permitted) {
        console.info('[rbac] blocked tab', { role, key, label })
        return
      }
      // call-through supporting both signature styles
      try { (orig as any)({ key, label, render }) } catch { try { (orig as any)(key, label, render) } catch {} }
    }
  }, [])
  return null
}

/**
 * [append-only] RBAC ブリッジの idempotent & セーフティノート
 *
 * - 右ペインのタブ登録は `RbacBridge` が wrap して一度だけ通す。
 * - `window.currentUserRole` が 'owner' | 'maintainer' | 'reviewer' などの値を取りうる想定。
 * - 許可ロールは内部の allowMap（append-only で拡張可）で制御。
 * - registerRightPaneTab の 2 形態（object / 3-args）どちらもサポートするが、
 *   実行は一度きり（window.__tab_*_registered と併用可）。
 * - 開発時の確認：DevTools で
 *     window.currentUserRole = 'reviewer'
 *   としてフィルタ挙動を確認、完了後に 'owner' に戻す。
 */

