export type ThemePreset = {
  id: string; name: string; tokens: Record<string, string>
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'light', name: 'Light', tokens: {
    'color-bg': '#ffffff', 'color-fg': '#111827', 'color-accent': '#2563eb', 'radius': '8px'
  }},
  { id: 'dark', name: 'Dark', tokens: {
    'color-bg': '#0b0f1a', 'color-fg': '#e5e7eb', 'color-accent': '#60a5fa', 'radius': '8px'
  }},
  { id: 'hc', name: 'High Contrast', tokens: {
    'color-bg': '#000', 'color-fg': '#fff', 'color-accent': '#ff0', 'radius': '0px'
  }},
  // add more presets here ...
]

