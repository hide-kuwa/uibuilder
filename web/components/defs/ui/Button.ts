import { Button } from '@/components/domain/Button'
import { BUTTON_META } from '@/components/domain/meta/buttonMeta'

const UiButton = {
  key: 'ui.button',
  meta: {
    displayName: BUTTON_META.displayName,
    defaultW: 160,
    defaultH: 40,
    propertySchema: BUTTON_META.propertySchema,
  },
  render: Button,
}

export default UiButton
