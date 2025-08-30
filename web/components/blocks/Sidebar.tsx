import { PropsWithChildren } from 'react'
import type { BuilderNodeMeta } from '@/types/builder'

export function Sidebar({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <aside className={className}>{children}</aside>
}

export const SidebarMeta: BuilderNodeMeta = {
  displayName: 'Sidebar',
  defaultSize: { w: 240, h: 600 },
  resizable: true,
  snap: 'grid',
  allowChildren: true,
}
