import type { BuilderNodeMeta } from '@/types/builder'

export function Text({ text, className }: { text: string; className?: string }) {
  return <div className={className}>{text}</div>
}

export const TextMeta: BuilderNodeMeta = {
  displayName: 'Text',
  defaultSize: { w: 200, h: 24 },
  resizable: false,
  snap: 'grid',
}
