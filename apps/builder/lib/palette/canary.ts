// side-effect only: seed a fallback registry on the client if nothing is registered yet
if (typeof window !== 'undefined') {
  const w = window as any
  const exists = Array.isArray(w.__componentRegistry) && w.__componentRegistry.length > 0
  if (!exists) {
    w.__componentRegistry = [
      { id: 'button', label: 'Button', icon: '⏺', hint: 'Clickable button' },
      { id: 'frame',  label: 'Frame',  icon: '▭', hint: 'Container frame' },
      { id: 'image',  label: 'Image',  icon: '🖼️', hint: 'Image node' },
      { id: 'text',   label: 'Text',   icon: '𝚃', hint: 'Text node' },
    ]
  }
}
// exported only to make tree-shaking keep this file; do not render it.
export const paletteCanary = true

