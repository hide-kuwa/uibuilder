import { Text } from '@/components/domain/Text'
import { TEXT_META } from '@/components/domain/meta/textMeta'

const UiText = {
  key: 'ui.text',
  meta: {
    displayName: TEXT_META.displayName,
    defaultW: 160,
    defaultH: 40,
    propertySchema: TEXT_META.propertySchema,
  },
  render: Text,
}

export default UiText
