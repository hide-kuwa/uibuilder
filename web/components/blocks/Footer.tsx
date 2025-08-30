import { PropsWithChildren } from 'react'
import type { BuilderNodeMeta } from '@/types/builder'

export function Footer({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <footer className={className}>{children}</footer>
}

export const FooterMeta: BuilderNodeMeta = {
  displayName: 'Footer',
  defaultSize: { w: 960, h: 56 },
  resizable: false,
  snap: 'grid',
}
