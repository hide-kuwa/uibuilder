import type { BuilderNodeMeta } from '@/types/builder'

export function Header({ text, level = 1, className }: { text: string; level?: number; className?: string }) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  return <Tag className={className}>{text}</Tag>
}

export const HeaderMeta: BuilderNodeMeta = {
  displayName: 'Header',
  defaultSize: { w: 960, h: 64 },
  resizable: false,
  snap: 'grid',
}
