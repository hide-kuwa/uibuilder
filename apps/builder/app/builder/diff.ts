import type { ComponentNode, Page } from '@chizu/types'
import type { SlotName } from './constants'

const ALL_SLOTS: SlotName[] = ['header', 'sidebar', 'content', 'footer', 'leftSidebar', 'rightPanel']

function indexById(nodes: ComponentNode[] = []) {
  const map = new Map<string, ComponentNode>()
  nodes.forEach((node) => map.set(node.id, node))
  return map
}

function ids(nodes: ComponentNode[] = []) {
  return nodes.map((node) => node.id)
}

function diffArrays<T>(before: T[], after: T[]) {
  const beforeSet = new Set(before)
  const afterSet = new Set(after)
  const added = [...afterSet].filter((value) => !beforeSet.has(value))
  const removed = [...beforeSet].filter((value) => !afterSet.has(value))
  const same = [...afterSet].filter((value) => beforeSet.has(value))
  return { added, removed, same }
}

function shallowEqual(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function diffPropsBindings(oldNode?: ComponentNode, newNode?: ComponentNode) {
  const changes: Array<{ key: string; from: any; to: any; kind: 'prop' | 'binding' }> = []
  if (!oldNode || !newNode) return changes

  const propKeys = new Set([
    ...Object.keys(oldNode.props ?? {}),
    ...Object.keys(newNode.props ?? {}),
  ])
  propKeys.forEach((key) => {
    const before = oldNode.props?.[key]
    const after = newNode.props?.[key]
    if (!shallowEqual(before, after)) {
      changes.push({ key, from: before, to: after, kind: 'prop' })
    }
  })

  const bindingKeys = new Set([
    ...Object.keys(oldNode.bindings ?? {}),
    ...Object.keys(newNode.bindings ?? {}),
  ])
  bindingKeys.forEach((key) => {
    const before = oldNode.bindings?.[key]
    const after = newNode.bindings?.[key]
    if (!shallowEqual(before, after)) {
      changes.push({ key, from: before, to: after, kind: 'binding' })
    }
  })

  return changes
}

export function getSlotNodes(page: Page, slot: SlotName): ComponentNode[] {
  if (slot === 'content' || slot === 'canvas') {
    return page.content ?? []
  }
  return page.slotAssignments?.[slot] ?? []
}

export function diffPage(oldPage: Page, newPage: Page, oldFrameId: string, newFrameId: string) {
  const slotDiffs = ALL_SLOTS.map((slot) => {
    const beforeNodes = getSlotNodes(oldPage, slot)
    const afterNodes = getSlotNodes(newPage, slot)
    const beforeIds = ids(beforeNodes)
    const afterIds = ids(afterNodes)
    const { added, removed, same } = diffArrays(beforeIds, afterIds)
    const beforeMap = indexById(beforeNodes)
    const afterMap = indexById(afterNodes)
    const moved: string[] = []
    same.forEach((id) => {
      if (beforeIds.indexOf(id) !== afterIds.indexOf(id)) {
        moved.push(id)
      }
    })
    const modified = same
      .map((id) => ({ id, changes: diffPropsBindings(beforeMap.get(id), afterMap.get(id)) }))
      .filter((entry) => entry.changes.length > 0)

    return { slot, added, removed, moved, modified }
  })

  const titleChanged = !shallowEqual(oldPage.title, newPage.title)
  const frameChanged = oldFrameId !== newFrameId
  return { titleChanged, frameChanged, slotDiffs }
}
