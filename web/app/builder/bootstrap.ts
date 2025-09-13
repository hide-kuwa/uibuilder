import { installMutBridge } from '@/adapters/installMutBridge'
import { useEditorStore } from '@/store/editorStore'

function getNodeById(id: string): any {
  const { tree } = useEditorStore.getState() as any
  const stack: any[] = [...(tree || [])]
  while (stack.length) {
    const n = stack.shift()
    if (!n) continue
    if (n.id === id) return n
    if (n.children) stack.unshift(...n.children)
  }
  return null
}

installMutBridge({
  getSelectedIds: () => (useEditorStore.getState() as any).selectedIds || [],
  getNodeById,
  updateNode: (id, patch) => (useEditorStore.getState() as any).updateNode(id, patch),
})

