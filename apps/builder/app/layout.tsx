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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ja"><body style={{margin:0,fontFamily:'ui-sans-serif'}}><RegisterLineageTabOnce /><RecoEventsBridge /><AutosaveBadge /><RecoPersistBridge /><BindingsEventsBridge /><RegisterDsTestTabOnce /><RegisterDsTestPlusTabOnce /><RbacBridge /><ExportHashBadge /><ExportHashCopyHotkey /><RegisterLineageStickyHighlightOnce />{children}</body></html>
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
