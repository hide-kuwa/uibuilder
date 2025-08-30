import { PropsWithChildren } from 'react'
import type { BuilderNodeMeta } from '@/types/builder'

export function Hud({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <div className={className}>{children}</div>
}

export const HudMeta: BuilderNodeMeta = {
  displayName: 'HUD',
  defaultSize: { w: 280, h: 44 },
  resizable: false,
  snap: 'grid',
  allowChildren: true,
}
