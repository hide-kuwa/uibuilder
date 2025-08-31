import Header from '@/components/domain/Header'
import { HEADER_META } from '@/components/domain/meta/headerMeta'

const UiHeader = {
  key: 'ui.header',
  meta: {
    displayName: HEADER_META.displayName,
    defaultW: 160,
    defaultH: 40,
    propertySchema: HEADER_META.propertySchema,
  },
  render: Header,
}

export default UiHeader
