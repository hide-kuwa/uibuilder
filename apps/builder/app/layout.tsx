// --- append-only ---
import { RegisterLineageTabOnce } from './lineage.register'
// --- append-only ---
import { RecoEventsBridge } from './reco.events-bridge'
// --- append-only ---
import { AutosaveBadge } from '@/components/AutosaveBadge'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ja"><body style={{margin:0,fontFamily:'ui-sans-serif'}}><RegisterLineageTabOnce /><RecoEventsBridge /><AutosaveBadge />{children}</body></html>
}

// append-only: reserved hook slot
