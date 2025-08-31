import { useBuilderStore } from '@/store/builderStore'
import { useDesignTokens } from '@/store/designTokensStore'
import { useDataSources } from '@/store/dataBindingStore'

export function hydrateProjectStores(p: any) {
  const meta = p?.meta || {}
  const elements = Array.isArray(p?.elements) ? p.elements : []
  useBuilderStore.setState({ elements, meta })
  if (p?.designTokens) useDesignTokens.getState().replaceAll(p.designTokens)
  if (p?.dataSources) useDataSources.getState().replaceAll(p.dataSources)
}
