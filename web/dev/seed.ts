'use client'
import { useEditorStore } from '@/store/editorStore'

type Node = {
  id: string
  name?: string
  type: 'frame' | 'text' | 'image'
  style?: Partial<Record<'left'|'top'|'width'|'height'|'backgroundColor'|'color'|'borderColor'|'borderRadius'|'opacity'|'position', any>>
  props?: any
  children?: Node[]
}

/** n個の矩形フレームをグリッド状にばらまく（描画/ヒットテスト用のダミー） */
export function makeGridDoc(n = 100, cell = 160): Node[] {
  const cols = Math.max(1, Math.floor(Math.sqrt(n)))
  const rows = Math.ceil(n / cols)
  const nodes: Node[] = []
  let i = 0
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (i >= n) break
      const left = x * cell
      const top = y * cell
      nodes.push({
        id: `node_${i}`,
        name: `Rect ${i}`,
        type: 'frame',
        style: {
          left,
          top,
          width: 120 + ((i * 7) % 16),
          height: 72 + ((i * 11) % 18),
          backgroundColor: i % 5 === 0 ? '#0ea5e9' : '#1f2937',
          borderColor: '#475569',
          borderRadius: (i * 3) % 12,
          opacity: 1,
          position: 'absolute',
        },
        children: [
          {
            id: `label_${i}`,
            type: 'text',
            name: `Label ${i}`,
            style: { left: 8, top: 8, width: 100, height: 16, color: '#e2e8f0', position: 'absolute' },
            props: { text: `#${i}` },
          },
        ],
      })
      i++
    }
  }
  return nodes
}

/** 少量のコンポーネント定義をダミー生成（React Codegen 等の試験用） */
export function makeDummyComponents() {
  return {
    btn: {
      id: 'comp_btn',
      name: 'Button',
      props: [
        { id: 'label', name: 'label', type: 'text', defaultValue: 'Click me', targetPath: 'root.children[0].props.text' },
        { id: 'primary', name: 'isPrimary', type: 'boolean', defaultValue: true, targetPath: 'root.style.backgroundColor' },
      ],
      root: {
        id: 'root',
        type: 'frame',
        style: { width: 120, height: 36, backgroundColor: '#0ea5e9', borderRadius: 8, position: 'relative' },
        children: [
          { id: 'l', type: 'text', style: { left: 12, top: 9, width: 96, height: 18 }, props: { text: 'Click me' } },
        ],
      },
    },
  } as any
}

/** ストアへシード投入（tree/selected を上書きし、dirty/pending を進める） */
export function seedToStore(count: number) {
  const tree = makeGridDoc(count)
  useEditorStore.setState((prev: any) => ({
    ...prev,
    tree,
    selectedIds: [],
    dirtyNodes: {},
    pendingVersion: (prev?.pendingVersion ?? 0) + 1,
    components: { ...(prev?.components ?? {}), ...makeDummyComponents() },
  }))
}

/** 復旧ダイアログを強制的に出したいときの“クラッシュ演出”（テスト用） */
export function markPreviousCrashedForTest() {
  try {
    localStorage.setItem('ui.session.alive', '1') // 前回終了時に落ちた扱い
  } catch {}
}
