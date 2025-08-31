import type { BuilderMeta } from '@/types/propertySchema'
export const CARD_META: BuilderMeta = {
  displayName: 'Card',
  propertySchema: [
    { id: 'title', label: 'Title', kind: 'string', default: 'Card Title', bindable: true },
    { id: 'body', label: 'Body', kind: 'string', default: 'Card body', bindable: true },
  ],
}
