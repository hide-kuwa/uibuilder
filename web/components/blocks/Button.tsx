import type { BuilderNodeMeta } from '@/types/builder'

export function Button({ text, className, onClick }: { text: string; className?: string; onClick?: () => void }) {
  return (
    <button className={className} onClick={onClick}>
      {text}
    </button>
  )
}

export const ButtonMeta: BuilderNodeMeta = {
  displayName: 'Button',
  defaultSize: { w: 120, h: 40 },
  resizable: false,
  snap: 'grid',
  events: ['click'],
}
