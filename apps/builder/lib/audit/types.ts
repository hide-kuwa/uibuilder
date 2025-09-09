// apps/builder/lib/audit/types.ts
export type AuditKind = 'contrast' | 'fontVariety' | 'grid8' | 'alignment' | 'a11yHeading'

export type AuditIssue = {
  id: string
  kind: AuditKind
  nodeId: string
  slug: string
  message: string
  payload?: Record<string, any>
  scoreImpact?: number
}

