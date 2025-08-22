'use client'
import { Button } from '../ui/Button'

export function UIKitShowcase() {
  return (
    <div className="flex gap-2">
      <Button>Default</Button>
      <Button tone="primary">Primary</Button>
      <Button tone="success">Success</Button>
      <Button tone="warn">Warn</Button>
      <Button tone="danger">Danger</Button>
    </div>
  )
}
