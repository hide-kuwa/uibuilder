export type NodeIR = {
  id: string
  type: string
  props: Record<string, any>
  children: NodeIR[]
}
