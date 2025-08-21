import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface Layout {
  x: number
  y: number
  w: number
  h: number
  rotation: number
}

export interface ComponentNode {
  id: string
  type: string
  props?: Record<string, any>
  bindings?: Record<string, PropBinding>
  variants?: { hover?: { className?: string } }
  children?: ComponentNode[]
  isContainer?: boolean
  layout?: Layout
  name?: string
  hidden?: boolean
  locked?: boolean
}

export interface PropBinding {
  source: string
  endpoint: string
  path: string
  fallback?: string
}

export interface Guide {
  type: 'h' | 'v'
  pos: number
}

interface EditorState {
  tree: ComponentNode[]
  selectedComponentId: string | null
  selectedIds: string[]
  hoverPreview: boolean
  inspectorTab: 'default' | 'hover'
  guides: Guide[]
}

interface EditorActions {
  selectComponent: (id: string | null) => void
  setSelectedIds: (ids: string[]) => void
  moveComponent: (dragId: string, parentId: string | null, index: number) => void
  moveNode: (from: number[], to: number[]) => void
  addComponent: (type: string) => string
  duplicateComponent: (id: string) => void
  deleteComponent: (id: string | string[]) => void
  groupSelected: () => void
  ungroup: (groupId: string) => void
  pushHistory: (t: ComponentNode[]) => void
  undo: () => void
  redo: () => void
  loadTemplate: (t: ComponentNode[]) => void
  setHoverPreview: (v: boolean) => void
  setInspectorTab: (t: 'default' | 'hover') => void
  setLayout: (id: string, layout: Partial<Layout>) => void
  setProp: (id: string, prop: string, value: any) => void
  setNodeName: (id: string, name: string) => void
  setHidden: (id: string, hidden: boolean) => void
  setLocked: (id: string, locked: boolean) => void
  addGuide: (g: Guide) => void
  updateGuide: (index: number, pos: number) => void
  removeGuide: (index: number) => void
}

interface EditorContextValue {
  state: EditorState
  actions: EditorActions
}

const EditorContext = createContext<EditorContextValue | undefined>(undefined)

export const EditorProvider: React.FC<{ initialTree?: ComponentNode[]; children: ReactNode }> = ({
  initialTree = [],
  children
}) => {
  const [tree, setTree] = useState<ComponentNode[]>(initialTree)
  const [history, setHistory] = useState<ComponentNode[][]>([initialTree])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [hoverPreview, setHoverPreview] = useState(false)
  const [inspectorTab, setInspectorTab] = useState<'default' | 'hover'>('default')
  const [guides, setGuides] = useState<Guide[]>([])
  const selectedComponentId = selectedIds[0] || null

  const pushHistory = (t: ComponentNode[]) => {
    setTree(t)
    setHistory(h => [...h.slice(0, historyIndex + 1), t])
    setHistoryIndex(i => i + 1)
  }

  const undo = () => {
    if (historyIndex === 0) return
    const idx = historyIndex - 1
    setHistoryIndex(idx)
    setTree(history[idx])
  }

  const redo = () => {
    if (historyIndex >= history.length - 1) return
    const idx = historyIndex + 1
    setHistoryIndex(idx)
    setTree(history[idx])
  }

  const loadTemplate = (t: ComponentNode[]) => {
    setTree(t)
    setHistory([t])
    setHistoryIndex(0)
  }

  const selectComponent = (id: string | null) => setSelectedIds(id ? [id] : [])
  const setSelectedIdsAction = (ids: string[]) => setSelectedIds(ids)

  const moveComponent = (dragId: string, parentId: string | null, index: number) => {
    const t = moveNodeById(tree, dragId, parentId, index)
    pushHistory(t)
  }

  const moveNode = (from: number[], to: number[]) => {
    setTree(prev => moveByPath(prev, from, to))
  }

  const defaultLayout = (): Layout => ({
    x: 40,
    y: 40,
    w: 320,
    h: 180,
    rotation: 0
  })

  const addComponent = (type: string): string => {
    const id = Math.random().toString(36).slice(2, 10)
    const node: ComponentNode = {
      id,
      type,
      isContainer: ['Sidebar', 'Section', 'Window'].includes(type),
      layout: defaultLayout()
    }
    setTree(prev => {
      return insertAt(prev, [prev.length], node)
    })
    return id
  }

  const duplicateComponent = (id: string) => {
    const t = duplicateNode(tree, id)
    pushHistory(t)
  }

  const deleteComponent = (id: string | string[]) => {
    if (Array.isArray(id)) {
      let t = tree
      for (const i of id) t = deleteNode(t, i)
      pushHistory(t)
      setSelectedIds([])
    } else {
      const t = deleteNode(tree, id)
      pushHistory(t)
      setSelectedIds(prev => prev.filter(v => v !== id))
    }
  }

  const groupSelected = () => {
    if (selectedIds.length < 2) return
    const paths = selectedIds
      .map(id => findPath(tree, id))
      .filter((p): p is number[] => !!p)
    if (paths.length !== selectedIds.length) return
    const parentPath = paths[0].slice(0, -1)
    if (!paths.every(p => p.slice(0, -1).every((v, i) => v === parentPath[i]))) return
    const nodes = paths.map(p => getNode(tree, p)!)
    const rects = nodes.map(n => n.layout || { x: 40, y: 40, w: 320, h: 180, rotation: 0 })
    const minX = Math.min(...rects.map(r => r.x))
    const minY = Math.min(...rects.map(r => r.y))
    const maxX = Math.max(...rects.map(r => r.x + r.w))
    const maxY = Math.max(...rects.map(r => r.y + r.h))
    const adjusted = nodes.map(n => {
      const l = n.layout || { x: 40, y: 40, w: 320, h: 180, rotation: 0 }
      return { ...n, layout: { ...l, x: l.x - minX, y: l.y - minY } }
    })
    let t = tree
    paths
      .sort((a, b) => b[b.length - 1] - a[a.length - 1])
      .forEach(p => {
        const res = removeAt(t, p)
        t = res.nodes
      })
    const insertIndex = Math.min(...paths.map(p => p[p.length - 1]))
    const groupId = Math.random().toString(36).slice(2, 10)
    const groupNode: ComponentNode = {
      id: groupId,
      type: 'Group',
      isContainer: true,
      layout: { x: minX, y: minY, w: maxX - minX, h: maxY - minY, rotation: 0 },
      children: adjusted
    }
    t = insertAt(t, [...parentPath, insertIndex], groupNode)
    pushHistory(t)
    setSelectedIds([groupId])
  }

  const ungroup = (groupId: string) => {
    const path = findPath(tree, groupId)
    if (!path) return
    const node = getNode(tree, path)
    if (!node || !node.children) return
    const groupLayout = node.layout || { x: 40, y: 40, w: 320, h: 180, rotation: 0 }
    const parentPath = path.slice(0, -1)
    const index = path[path.length - 1]
    const { nodes: without } = removeAt(tree, path)
    let t = without
    node.children.forEach((child, i) => {
      const l = child.layout || { x: 40, y: 40, w: 320, h: 180, rotation: 0 }
      const adjusted = {
        ...child,
        layout: { ...l, x: l.x + groupLayout.x, y: l.y + groupLayout.y, rotation: l.rotation ?? 0 }
      }
      t = insertAt(t, [...parentPath, index + i], adjusted)
    })
    pushHistory(t)
    setSelectedIds(node.children.map(c => c.id))
  }

  const setLayout = (id: string, layout: Partial<Layout>) => {
    setTree(prev => setNodeLayout(prev, id, layout))
  }

  const setProp = (id: string, prop: string, value: any) => {
    setTree(prev => setNodeProp(prev, id, prop, value))
  }

  const setNodeName = (id: string, name: string) => {
    setTree(prev => setNodeData(prev, id, { name }))
  }

  const setHidden = (id: string, hidden: boolean) => {
    setTree(prev => setNodeData(prev, id, { hidden }))
  }

  const setLocked = (id: string, locked: boolean) => {
    setTree(prev => setNodeData(prev, id, { locked }))
  }

  const addGuide = (g: Guide) => {
    setGuides(prev => [...prev, g])
  }

  const updateGuide = (index: number, pos: number) => {
    setGuides(prev => prev.map((g, i) => (i === index ? { ...g, pos } : g)))
  }

  const removeGuide = (index: number) => {
    setGuides(prev => prev.filter((_, i) => i !== index))
  }

  const value: EditorContextValue = {
    state: { tree, selectedComponentId, selectedIds, hoverPreview, inspectorTab, guides },
    actions: {
      selectComponent,
      setSelectedIds: setSelectedIdsAction,
      moveComponent,
      moveNode,
      addComponent,
      duplicateComponent,
      deleteComponent,
      groupSelected,
      ungroup,
      pushHistory,
      undo,
      redo,
      loadTemplate,
      setHoverPreview,
      setInspectorTab,
      setLayout,
      setProp,
      setNodeName,
      setHidden,
      setLocked,
      addGuide,
      updateGuide,
      removeGuide
    }
  }

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}

export const useEditorState = () => {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('useEditorState must be used within EditorProvider')
  return ctx.state
}

export const useEditorActions = () => {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('useEditorActions must be used within EditorProvider')
  return ctx.actions
}

function cloneNode(node: ComponentNode): ComponentNode {
  return { ...node, children: node.children ? node.children.map(cloneNode) : undefined }
}

function deleteNode(nodes: ComponentNode[], id: string): ComponentNode[] {
  return nodes
    .filter(n => n.id !== id)
    .map(n => (n.children ? { ...n, children: deleteNode(n.children, id) } : n))
}

function duplicateNode(nodes: ComponentNode[], id: string): ComponentNode[] {
  const result: ComponentNode[] = []
  for (const n of nodes) {
    if (n.id === id) {
      result.push(n)
      const copy = cloneNode(n)
      copy.id = `${n.id}_copy_${Math.random().toString(36).slice(2, 8)}`
      if (!copy.layout) copy.layout = { x: 40, y: 40, w: 320, h: 180, rotation: 0 }
      result.push(copy)
    } else if (n.children) {
      result.push({ ...n, children: duplicateNode(n.children, id) })
    } else {
      result.push(n)
    }
  }
  return result
}

function removeNodeById(nodes: ComponentNode[], id: string): { nodes: ComponentNode[]; removed?: ComponentNode } {
  const result: ComponentNode[] = []
  let removed: ComponentNode | undefined
  for (const n of nodes) {
    if (n.id === id) {
      removed = n
      continue
    }
    if (n.children) {
      const res = removeNodeById(n.children, id)
      if (res.removed) {
        removed = res.removed
        result.push({ ...n, children: res.nodes })
      } else {
        result.push(n)
      }
    } else {
      result.push(n)
    }
  }
  return { nodes: result, removed }
}

function insertNode(nodes: ComponentNode[], parentId: string | null, index: number, node: ComponentNode): ComponentNode[] {
  if (parentId === null) {
    const arr = [...nodes]
    arr.splice(index, 0, node)
    return arr
  }
  return nodes.map(n => {
    if (n.id === parentId) {
      const children = n.children ? [...n.children] : []
      children.splice(index, 0, node)
      return { ...n, children }
    }
    if (n.children) {
      return { ...n, children: insertNode(n.children, parentId, index, node) }
    }
    return n
  })
}

function moveNodeById(nodes: ComponentNode[], dragId: string, parentId: string | null, index: number): ComponentNode[] {
  const { nodes: without, removed } = removeNodeById(nodes, dragId)
  if (!removed) return nodes
  return insertNode(without, parentId, index, removed)
}

function findPath(nodes: ComponentNode[], id: string, path: number[] = []): number[] | null {
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i]
    const p = [...path, i]
    if (n.id === id) return p
    if (n.children) {
      const res = findPath(n.children, id, p)
      if (res) return res
    }
  }
  return null
}

function getNode(nodes: ComponentNode[], path: number[]): ComponentNode | undefined {
  let arr = nodes
  let cur: ComponentNode | undefined
  for (let i = 0; i < path.length; i++) {
    cur = arr[path[i]]
    if (!cur) return undefined
    arr = cur.children || []
  }
  return cur
}

function removeAt(nodes: ComponentNode[], path: number[]): { nodes: ComponentNode[]; removed?: ComponentNode } {
  const [idx, ...rest] = path
  const arr = [...nodes]
  if (rest.length === 0) {
    const [removed] = arr.splice(idx, 1)
    return { nodes: arr, removed }
  }
  const child = arr[idx]
  const res = removeAt(child.children || [], rest)
  arr[idx] = { ...child, children: res.nodes }
  return { nodes: arr, removed: res.removed }
}

function insertAt(nodes: ComponentNode[], path: number[], node: ComponentNode): ComponentNode[] {
  const [idx, ...rest] = path
  const arr = [...nodes]
  if (rest.length === 0) {
    arr.splice(idx, 0, node)
    return arr
  }
  const child = arr[idx]
  const children = insertAt(child.children || [], rest, node)
  arr[idx] = { ...child, children }
  return arr
}

function adjust(from: number[], to: number[]): number[] {
  if (from.length === to.length && from.slice(0, -1).every((v, i) => v === to[i]) && to[to.length - 1] > from[from.length - 1]) {
    const a = [...to]
    a[a.length - 1]--
    return a
  }
  return to
}

function moveByPath(nodes: ComponentNode[], from: number[], to: number[]): ComponentNode[] {
  const { nodes: without, removed } = removeAt(nodes, from)
  if (!removed) return nodes
  return insertAt(without, adjust(from, to), removed)
}

function setNodeProp(nodes: ComponentNode[], id: string, prop: string, value: any): ComponentNode[] {
  return nodes.map(n => {
    if (n.id === id) {
      const props = { ...(n.props || {}) }
      if (value === undefined) delete props[prop]
      else props[prop] = value
      return { ...n, props }
    }
    if (n.children) return { ...n, children: setNodeProp(n.children, id, prop, value) }
    return n
  })
}

function setNodeLayout(nodes: ComponentNode[], id: string, layout: Partial<Layout>): ComponentNode[] {
  return nodes.map(n => {
    if (n.id === id) {
      const next = { ...(n.layout || { x: 40, y: 40, w: 320, h: 180, rotation: 0 }), ...layout }
      return { ...n, layout: next }
    }
    if (n.children) return { ...n, children: setNodeLayout(n.children, id, layout) }
    return n
  })
}

function setNodeData(
  nodes: ComponentNode[],
  id: string,
  data: Partial<ComponentNode>
): ComponentNode[] {
  return nodes.map(n => {
    if (n.id === id) return { ...n, ...data }
    if (n.children) return { ...n, children: setNodeData(n.children, id, data) }
    return n
  })
}

