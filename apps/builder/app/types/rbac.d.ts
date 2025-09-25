export {}

type RBACOptions = Record<string, unknown>
type RightPaneTabRenderer = () => Element | DocumentFragment | JSX.Element | null | void

declare global {
  interface Window {
    __rbac?: {
      mount?: (
        container: Element | DocumentFragment,
        props?: RBACOptions
      ) => { unmount?: () => void } | void
      render?: (
        container: Element | DocumentFragment,
        props?: RBACOptions
      ) => Element | DocumentFragment | JSX.Element | null | void
    }
    registerRightPaneTab?: (
      tab:
        | string
        | ({
            key?: string
            label?: string
            render?: RightPaneTabRenderer
            [key: string]: unknown
          })
    ) => void
  }
}
