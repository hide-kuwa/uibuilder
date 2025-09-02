import type { ComponentMeta } from '@/types/builder';

export type RegistryItem = {
  meta: ComponentMeta;
  Render: any;
};

const REGISTRY: Record<string, RegistryItem> = {};

export function register(item: RegistryItem) {
  REGISTRY[item.meta.id] = item;
}

export function getDef(key: string): RegistryItem | undefined {
  return REGISTRY[key];
}

export function listComponentOptions() {
  return Object.values(REGISTRY).map((r) => ({
    key: r.meta.id,
    label: r.meta.displayName,
    group: r.meta.group,
  }));
}
