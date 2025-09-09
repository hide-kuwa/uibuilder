// apps/builder/types/repeat.ts
export type RepeatNode = {
  kind: 'Repeat'
  id: string
  dataPath: string
  itemKey?: string
  children?: any[]
}

