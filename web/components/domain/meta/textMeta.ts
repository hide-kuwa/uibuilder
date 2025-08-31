import type { BuilderMeta } from '@/types/propertySchema'
export const TEXT_META: BuilderMeta = {
  displayName: 'Text',
  propertySchema: [
    { id: 'text', label: 'Text', kind: 'string', default: 'Lorem ipsum', bindable: true },
    { id: 'size', label: 'Size', kind: 'select', options: [
      { label: 'Sm', value: 'sm' },
      { label: 'Base', value: 'base' },
      { label: 'Lg', value: 'lg' },
      { label: 'Xl', value: 'xl' },
    ], default: 'base' },
    { id: 'color', label: 'Color', kind: 'color', default: '#111827' },
    { id: 'bold', label: 'Bold', kind: 'boolean', default: false },
  ],
}
