import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export async function GET() {
  const fallback = [
    { id: 'button', label: 'Button', icon: '⏺', hint: 'Clickable button' },
    { id: 'frame', label: 'Frame', icon: '▭', hint: 'Container frame' },
    { id: 'image', label: 'Image', icon: '🖼️', hint: 'Image node' },
    { id: 'text', label: 'Text', icon: '𝚃', hint: 'Text node' },
  ]
  return NextResponse.json(fallback)
}
