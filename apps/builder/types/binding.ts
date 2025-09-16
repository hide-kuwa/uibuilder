// apps/builder/types/binding.ts
export type BindingSource = {
  kind: 'local' | 'global' | 'api'
  path: string
}

