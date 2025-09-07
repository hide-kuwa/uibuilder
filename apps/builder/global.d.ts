export {}
declare global {
  interface Window {
    registerRightPaneTab?: (tab: { key: string; label: string; render: () => JSX.Element }) => void
    __chizuSel?: string
    __reco?: { left?: any[]; right?: any[] }
    getRecoRows?: () => { left: any[]; right: any[] } | undefined
  }
}

