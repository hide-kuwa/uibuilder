export type Project = {
  schemaVersion: number
  meta?: { id?: string; name?: string }
  designTokens?: Record<string, any>
  elements: any[]
  assets?: any[]
}
