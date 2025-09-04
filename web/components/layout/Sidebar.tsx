import type { NestedMenuItem } from '../../../src/lib/router/scanRoutes'
import scanRoutes from '../../../src/lib/router/scanRoutes'
import type { FeatureKey } from '../../../src/stores/rbacStore'
import SidebarClient from './SidebarClient'

export interface SidebarProps {
  menuItems?: NestedMenuItem[]
  useAuto?: boolean
  rbacKeys?: Record<string, FeatureKey>
}

export default function Sidebar({ menuItems, useAuto, rbacKeys }: SidebarProps) {
  const items = useAuto || !menuItems ? scanRoutes() : menuItems
  return <SidebarClient items={items ?? []} rbacKeys={rbacKeys} />
}
