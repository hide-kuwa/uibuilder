import { useBuilderStore } from '@/store/builderStore'

type Box = { x: number; y: number; w: number; h: number }
type AlignMode = 'left' | 'hcenter' | 'right' | 'top' | 'vcenter' | 'bottom'
type DistMode = 'hgap' | 'vgap'
type Anchor = 'first' | 'selection'

function snap(v: number, grid: number) {
  if (!grid || grid <= 1) return Math.round(v)
  return Math.round(v / grid) * grid
}

function getBox(n: any): Box | null {
  const p = (n?.props ?? {}) as any
  const pv = (n?.propValues ?? {}) as any
  const x = (typeof n.x === 'number' ? n.x : (typeof p.x === 'number' ? p.x : (typeof pv.x === 'number' ? pv.x : null)))
  const y = (typeof n.y === 'number' ? n.y : (typeof p.y === 'number' ? p.y : (typeof pv.y === 'number' ? pv.y : null)))
  const w = (typeof n.w === 'number' ? n.w : (typeof p.w === 'number' ? p.w : (typeof pv.w === 'number' ? pv.w : null)))
  const h = (typeof n.h === 'number' ? n.h : (typeof p.h === 'number' ? p.h : (typeof pv.h === 'number' ? pv.h : null)))
  if (x == null || y == null || w == null || h == null) return null
  return { x, y, w, h }
}

function setXY(n: any, x: number, y: number) {
  if (typeof n.x === 'number') { n.x = x } else if (n.props && typeof n.props.x === 'number') { n.props.x = x } else if (n.propValues && typeof n.propValues.x === 'number') { n.propValues.x = x } else { n.props = { ...(n.props||{}), x } }
  if (typeof n.y === 'number') { n.y = y } else if (n.props && typeof n.props.y === 'number') { n.props.y = y } else if (n.propValues && typeof n.propValues.y === 'number') { n.propValues.y = y } else { n.props = { ...(n.props||{}), y } }
}

function findNodesByIds(tree: any[], ids: string[]) {
  const set = new Set(ids)
  const out: any[] = []
  const q: any[] = [...tree]
  while (q.length) {
    const n = q.shift()
    if (!n) continue
    if (set.has(n.id)) out.push(n)
    if (n.children && Array.isArray(n.children)) q.push(...n.children)
  }
  return out
}

function bounds(boxes: Box[]) {
  const xs = boxes.map(b=>b.x)
  const ys = boxes.map(b=>b.y)
  const rs = boxes.map(b=>b.x + b.w)
  const bs = boxes.map(b=>b.y + b.h)
  const minX = Math.min(...xs), minY = Math.min(...ys)
  const maxR = Math.max(...rs), maxB = Math.max(...bs)
  return { minX, minY, maxR, maxB, cx: (minX + maxR)/2, cy: (minY + maxB)/2 }
}

export function alignSelected(mode: AlignMode, anchor: Anchor = 'first') {
  const s = useBuilderStore.getState()
  const ids = s.selectedIds || []
  if ((ids?.length || 0) < 2) return
  const nodes = findNodesByIds(s.tree, ids)
  const items = nodes.map(n => ({ n, b: getBox(n) })).filter(x => x.b) as { n:any; b:Box }[]
  if (items.length < 2) return
  const grid = s.meta?.gridSize ?? 1
  let ax = 0, ay = 0, ar = 0, ab = 0, acx = 0, acy = 0
  if (anchor === 'first') {
    const ref = items[0].b
    ax = ref.x; ay = ref.y; ar = ref.x + ref.w; ab = ref.y + ref.h; acx = ref.x + ref.w/2; acy = ref.y + ref.h/2
  } else {
    const bd = bounds(items.map(i=>i.b))
    ax = bd.minX; ay = bd.minY; ar = bd.maxR; ab = bd.maxB; acx = bd.cx; acy = bd.cy
  }
  ;(useBuilderStore.getState() as any).apply((draft:any)=>{
    for (let i=0;i<items.length;i++){
      const it = items[i]
      let nx = it.b.x, ny = it.b.y
      if (mode === 'left') nx = ax
      if (mode === 'hcenter') nx = acx - it.b.w/2
      if (mode === 'right') nx = ar - it.b.w
      if (mode === 'top') ny = ay
      if (mode === 'vcenter') ny = acy - it.b.h/2
      if (mode === 'bottom') ny = ab - it.b.h
      nx = snap(nx, grid); ny = snap(ny, grid)
      const q:any[] = draft.tree.slice()
      while (q.length) {
        const dn = q.pop()
        if (!dn) continue
        if (dn.id === it.n.id) { setXY(dn, nx, ny); break }
        if (dn.children) q.push(...dn.children)
      }
    }
  })
}

export function distributeSelected(mode: DistMode, anchor: Anchor = 'selection') {
  const s = useBuilderStore.getState()
  const ids = s.selectedIds || []
  if ((ids?.length || 0) < 3) return
  const nodes = findNodesByIds(s.tree, ids)
  const items = nodes.map(n => ({ n, b: getBox(n) })).filter(x => x.b) as { n:any; b:Box }[]
  if (items.length < 3) return
  const grid = s.meta?.gridSize ?? 1
  if (mode === 'hgap') {
    const arr = items.slice().sort((a,b)=>a.b.x - b.b.x)
    const bd = anchor === 'selection' ? bounds(arr.map(i=>i.b)) : { minX: arr[0].b.x, maxR: arr[arr.length-1].b.x + arr[arr.length-1].b.w }
    const span = bd.maxR - bd.minX
    const widths = arr.reduce((t,i)=>t+i.b.w,0)
    const gap = (span - widths)/(arr.length-1)
    let cursor = bd.minX
    ;(useBuilderStore.getState() as any).apply((draft:any)=>{
      for (let i=0;i<arr.length;i++){
        const it = arr[i]
        const nx = i===0 ? it.b.x : cursor
        const ny = it.b.y
        const q:any[] = draft.tree.slice()
        while (q.length) {
          const dn = q.pop()
          if (!dn) continue
          if (dn.id === it.n.id) { setXY(dn, snap(nx,grid), snap(ny,grid)); break }
          if (dn.children) q.push(...dn.children)
        }
        cursor = nx + it.b.w + gap
      }
    })
  } else {
    const arr = items.slice().sort((a,b)=>a.b.y - b.b.y)
    const first = arr[0], last = arr[arr.length-1]
    const minY = anchor === 'selection' ? Math.min(...arr.map(i=>i.b.y)) : first.b.y
    const maxB = anchor === 'selection' ? Math.max(...arr.map(i=>i.b.y + i.b.h)) : (last.b.y + last.b.h)
    const span = maxB - minY
    const heights = arr.reduce((t,i)=>t+i.b.h,0)
    const gap = (span - heights)/(arr.length-1)
    let cursor = minY
    ;(useBuilderStore.getState() as any).apply((draft:any)=>{
      for (let i=0;i<arr.length;i++){
        const it = arr[i]
        const nx = it.b.x
        const ny = i===0 ? it.b.y : cursor
        const q:any[] = draft.tree.slice()
        while (q.length) {
          const dn = q.pop()
          if (!dn) continue
          if (dn.id === it.n.id) { setXY(dn, snap(nx,grid), snap(ny,grid)); break }
          if (dn.children) q.push(...dn.children)
        }
        cursor = ny + it.b.h + gap
      }
    })
  }
}

