export {}
declare global {
  interface Window {
    registerRightPaneTab?: (tab: { key: string; label: string; render: () => JSX.Element }) => void
    __chizuSel?: string
    __reco?: { left?: any[]; right?: any[] }
    getRecoRows?: () => { left: any[]; right: any[] } | undefined
  }
}

// append-only: bindings events typings
declare interface Window {
  __bindingsInsert?: { key?: string; formula: string }
  __setBindingFormula?: (v: string) => void
}
