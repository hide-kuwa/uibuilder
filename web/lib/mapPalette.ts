export type MapPalette = {
  id: string; name: string;
  none: string; want: string; visited: string; lived: string; stroke: string;
  bgFrom: string; bgTo: string;
}
export const MAP_PALETTES: Record<string, MapPalette> = {
  default: { id:'default', name:'Default',
    none:'#F7F7F7', want:'#f59e0b', visited:'#3b82f6', lived:'#ef4444', stroke:'#e5e7eb',
    bgFrom:'#ffffff', bgTo:'#f4f6f8',
  },
  ocean: { id:'ocean', name:'Ocean',
    none:'#F6FAFF', want:'#0ea5e9', visited:'#2563eb', lived:'#0f766e', stroke:'#dbeafe',
    bgFrom:'#eef6ff', bgTo:'#eaf2fb',
  },
  sakura: { id:'sakura', name:'Sakura',
    none:'#FFF7FA', want:'#fb7185', visited:'#f472b6', lived:'#db2777', stroke:'#fecdd3',
    bgFrom:'#fff1f2', bgTo:'#ffe4e6',
  },
}
export const getMapPalette = (id?: string) =>
  MAP_PALETTES[id ?? 'default'] ?? MAP_PALETTES.default
