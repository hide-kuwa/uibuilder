export type ComponentNode = {
  id: string
  children?: ComponentNode[]
  [key: string]: any
}

export function findNode(
  tree: ComponentNode[],
  id: string,
  parent: ComponentNode | null = null,
): { node: ComponentNode; parent: ComponentNode | null; index: number } | null {
  for (let i = 0; i < tree.length; i++) {
    const n = tree[i]
    if (n.id === id) return { node: n, parent, index: i }
    if (n.children) {
      const found = findNode(n.children, id, n)
      if (found) return found
    }
  }
  return null
}

export function insertNode(
  tree: ComponentNode[],
  parentId: string | null,
  node: ComponentNode,
  index?: number,
): ComponentNode[] {
  if (parentId === null) {
    const t = tree.slice()
    if (index === undefined || index < 0 || index > t.length) t.push(node)
    else t.splice(index, 0, node)
    return t
  }
  return tree.map((n) => {
    if (n.id === parentId) {
      const children = n.children ? n.children.slice() : []
      if (index === undefined || index < 0 || index > children.length)
        children.push(node)
      else children.splice(index, 0, node)
      return { ...n, children }
    }
    if (n.children) {
      return { ...n, children: insertNode(n.children, parentId, node, index) }
    }
    return n
  })
}

export function removeNode(
  tree: ComponentNode[],
  nodeId: string,
): { newTree: ComponentNode[]; removed?: ComponentNode } {
  let removed: ComponentNode | undefined
  function helper(nodes: ComponentNode[]): ComponentNode[] {
    return nodes
      .map((n) => {
        if (n.id === nodeId) {
          removed = n
          return null
        }
        if (n.children) {
          const childRes = helper(n.children)
          if (childRes !== n.children) return { ...n, children: childRes }
        }
        return n
      })
      .filter(Boolean) as ComponentNode[]
  }
  const newTree = helper(tree)
  return { newTree, removed }
}

export function moveNode(
  tree: ComponentNode[],
  nodeId: string,
  targetParentId: string | null,
  targetIndex: number,
): ComponentNode[] {
  const { newTree, removed } = removeNode(tree, nodeId)
  if (!removed) return tree
  return insertNode(newTree, targetParentId, removed, targetIndex)
}

