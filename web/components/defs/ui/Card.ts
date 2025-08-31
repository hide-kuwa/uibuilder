import Card from '@/components/domain/Card'
import { CARD_META } from '@/components/domain/meta/cardMeta'

const UiCard = {
  key: 'ui.card',
  meta: {
    displayName: CARD_META.displayName,
    defaultW: 160,
    defaultH: 40,
    propertySchema: CARD_META.propertySchema,
  },
  render: Card,
}

export default UiCard
