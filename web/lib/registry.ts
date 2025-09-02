import type { ComponentMeta } from '@/types/builder';

export type RegistryItem = {
  meta: ComponentMeta;
  Render: any;
};

export const registry: Record<string, RegistryItem> = {};

export function register(item: RegistryItem) {
  registry[item.meta.id] = item;
}

export function getDef(key: string): RegistryItem | undefined {
  return registry[key];
}

export function listComponentOptions() {
  return Object.values(registry).map((r) => ({
    key: r.meta.id,
    label: r.meta.displayName,
    group: r.meta.group,
  }));
}

export function listDefs() {
  return listComponentOptions();
}

// default components for tests and initial usage
const DEFAULT_COMPONENTS: Array<{ id: string; name: string }> = [
  { id: 'ui.header', name: 'Header' },
  { id: 'ui.footer', name: 'Footer' },
  { id: 'ui.sidebar', name: 'Sidebar' },
  { id: 'ui.text', name: 'Text' },
  { id: 'ui.card', name: 'Card' },
  { id: 'ui.panel', name: 'Panel' },
  { id: 'ui.hud', name: 'HUD' },
];

DEFAULT_COMPONENTS.forEach((c) => {
  register({
    meta: {
      id: c.id,
      displayName: c.name,
      props: [],
      allowChildren: false,
      defaultW: 160,
      defaultH: 40,
    },
    Render: () => null,
  });
});
