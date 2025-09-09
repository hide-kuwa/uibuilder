// --- append-only ---
import { RegisterLineageTabOnce } from './lineage.register'
// --- append-only ---
import { RecoEventsBridge } from './reco.events-bridge'
// --- append-only ---
import { AutosaveBadge } from '@/components/AutosaveBadge'
import RecoPersistBridge from './reco.persist-bridge'
import BindingsEventsBridge from './bindings.events-bridge'
import { RegisterDsTestTabOnce } from './lineage.register'
import { RegisterDsTestPlusTabOnce } from './lineage.register'
import RbacBridge from './rbac.bridge'
// append-only mount: Export contentHash indicator
import ExportHashBadge from './ExportHashBadge'
// append-only mount: hotkey helper for exporting hash copy
import ExportHashCopyHotkey from './ExportHashCopyHotkey'
import RegisterLineageStickyHighlightOnce from './lineage.highlight.register'
// append-only mount: /events heartbeat badge
import EventStreamHealth from './EventStreamHealth'
// append-only: provide binding resolve bridge for previews
import '@/lib/binding/resolve'
import EnvToggle from '@/components/EnvToggle'
import PresetsTestIdE2E from '@/components/PresetsTestIdE2E'
import PerfPanel from '@/components/debug/PerfPanel'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ja"><body style={{margin:0,fontFamily:'ui-sans-serif'}}><RegisterLineageTabOnce /><RecoEventsBridge /><AutosaveBadge /><RecoPersistBridge /><BindingsEventsBridge /><RegisterDsTestTabOnce /><RegisterDsTestPlusTabOnce /><RbacBridge /><ExportHashBadge /><ExportHashCopyHotkey /><RegisterLineageStickyHighlightOnce /><EventStreamHealth /><div style={{position:'fixed',top:6,right:8,zIndex:50}}><EnvToggle /></div><PresetsTestIdE2E />{process.env.NEXT_PUBLIC_E2E === '1' && <PerfPanel />}{children}</body></html>
}

// --- append-only: Tag the Presets tab with a test id for E2E
if (typeof window !== 'undefined') {
  const tagPresets = () => {
    try {
      const tabs = Array.from(document.querySelectorAll('[role="tab"], button, a, div')) as HTMLElement[]
      for (const el of tabs) {
        const txt = (el.textContent || '').trim()
        if (txt === 'Presets' && !el.getAttribute('data-testid')) {
          el.setAttribute('data-testid', 'tab-presets')
          break
        }
      }
    } catch {}
  }
  const mo = new MutationObserver(() => tagPresets())
  mo.observe(document.documentElement, { childList: true, subtree: true })
  setTimeout(tagPresets, 0)
}

/**
 * [append-only] Register mounts memo
 *
 * - 本レイアウト下で各種 Register* コンポーネントを「一度だけ」マウントする。
 * - それぞれの内部で window.__tab_*_registered を用いたガードを実施しているため、
 *   ホットリロードや再描画でもタブ重複は発生しない前提。
 * - 追加の Register を増やす場合は：
 *   1) 新規の *.register.tsx を作成（append-only）
 *   2) 内部でグローバルガードを実装（上記パターンに倣う）
 *   3) ここに <YourNewRegisterOnce /> を追記してマウント
 */

// append-only: reserved hook slot

// --- append-only: reset scroll on right-pane tab changes ---
// data-panel 要素が差し替わった際にスクロール位置をリセットして、常に上部から表示する
if (typeof window !== 'undefined') {
  const __rightPaneScrollResetObserver = new MutationObserver(() => {
    const panels = document.querySelectorAll('[data-panel]')
    panels.forEach((el) => {
      if (el instanceof HTMLElement) {
        // レイアウト確定後にリセット（ちらつき防止）
        requestAnimationFrame(() => { el.scrollTop = 0 })
      }
    })
  })
  // パネルは動的に差し替わるため、body 全体を監視（軽量変化のみ）
  __rightPaneScrollResetObserver.observe(document.body, { childList: true, subtree: true })
}
