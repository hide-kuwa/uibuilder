export type NodeIR = {
  id: string
  type: string
  props: Record<string, any>
  children: NodeIR[]
  name?: string
  hidden?: boolean
  locked?: boolean
}
