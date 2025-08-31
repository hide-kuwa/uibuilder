import type { BuilderMeta } from '@/types/propertySchema'
export const HEADER_META: BuilderMeta = {
  displayName: 'Header',
  propertySchema: [
    { id: 'title', label: 'Title', kind: 'string', default: 'Header', bindable: true },
    { id: 'subtitle', label: 'Subtitle', kind: 'string', default: '', bindable: true },
    { id: 'align', label: 'Align', kind: 'select', options: [
      { label: 'Left', value: 'left' },
      { label: 'Center', value: 'center' },
      { label: 'Right', value: 'right' },
    ], default: 'left' },
  ],
}
