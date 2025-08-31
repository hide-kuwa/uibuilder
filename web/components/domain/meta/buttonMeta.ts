import type { BuilderMeta } from '@/types/propertySchema'
export const BUTTON_META: BuilderMeta = {
  displayName: 'Button',
  propertySchema: [
    { id: 'label', label: 'Label', kind: 'string', default: 'Button', bindable: true },
    { id: 'variant', label: 'Variant', kind: 'select', options: [
      { label: 'Primary', value: 'primary' },
      { label: 'Secondary', value: 'secondary' },
      { label: 'Ghost', value: 'ghost' },
    ], default: 'primary' },
    { id: 'href', label: 'Href', kind: 'string', placeholder: 'https://', bindable: true },
    { id: 'disabled', label: 'Disabled', kind: 'boolean', default: false },
  ],
}
