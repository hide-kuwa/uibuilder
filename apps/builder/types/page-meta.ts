// apps/builder/types/page-meta.ts
export type PageMeta = {
  slug: string
  title: string
  tags: string[]
  description?: string
  hidden?: boolean
  updatedAt: string // ISO
  contentHash?: string
}

