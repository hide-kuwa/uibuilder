import { PropsWithChildren } from 'react'
import type { BuilderNodeMeta } from '@/types/builder'

export function Container({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <div className={className}>{children}</div>
}

export const ContainerMeta: BuilderNodeMeta = {
  displayName: 'Container',
  defaultSize: { w: 320, h: 200 },
  resizable: true,
  snap: 'grid',
  allowChildren: true,
}
