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
  { id: 'pastel', name: 'Pastel', tokens: {
    'color-bg': '#fdf2f8', 'color-fg': '#1f2937', 'color-accent': '#f472b6', 'radius': '12px'
  }},
  { id: 'slate', name: 'Slate', tokens: {
    'color-bg': '#0f172a', 'color-fg': '#e2e8f0', 'color-accent': '#38bdf8', 'radius': '10px'
  }},
  { id: 'forest', name: 'Forest', tokens: {
    'color-bg': '#0b1d14', 'color-fg': '#e8f5e9', 'color-accent': '#34d399', 'radius': '10px'
  }},
  { id: 'amber', name: 'Amber', tokens: {
    'color-bg': '#1f1300', 'color-fg': '#fffbeb', 'color-accent': '#f59e0b', 'radius': '12px'
  }},
  { id: 'neon', name: 'Neon', tokens: {
    'color-bg': '#0a0a0a', 'color-fg': '#ecfeff', 'color-accent': '#22d3ee', 'radius': '16px'
  }},
  // add more presets here ...
]
