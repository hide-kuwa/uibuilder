import type { ComponentMeta } from '@/types/builder';
import Card from '@/components/Card';
import TripHeader from '@/components/travel/TripHeader';
import ItineraryTimeline from '@/components/travel/ItineraryTimeline';
import PrefShareBar from '@/components/travel/PrefShareBar';
import PrefGridMap from '@/components/travel/PrefGridMap';
import SaveMapBar from '@/components/travel/SaveMapBar';
import DownloadPNG from '@/components/util/DownloadPNG';
import PrefEnumLegend from '@/components/travel/PrefEnumLegend';
import PrefEnumGridMap from '@/components/travel/PrefEnumGridMap';
import PrefEnumShareBar from '@/components/travel/PrefEnumShareBar';
import SaveMapBarEnum from '@/components/travel/SaveMapBarEnum';

// JapanMap is optional (SVG variant lives in components/domain/maps)
let JapanMap: any = null;
try {
  JapanMap = require('@/components/domain/maps/JapanMap').default;
} catch {
  try {
    JapanMap = require('@/components/domain/JapanMap').default;
  } catch {}
}

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

register({
  meta: {
    id: 'Card',
    displayName: 'Card',
    props: [],
    allowChildren: true,
    defaultW: 240,
    defaultH: 160,
  },
  Render: Card,
});

register({
  meta: {
    id: 'TripHeader',
    displayName: 'TripHeader',
    props: [],
    allowChildren: false,
    defaultW: 320,
    defaultH: 80,
  },
  Render: TripHeader,
});

register({
  meta: {
    id: 'ItineraryTimeline',
    displayName: 'ItineraryTimeline',
    props: [],
    allowChildren: false,
    defaultW: 560,
    defaultH: 360,
  },
  Render: ItineraryTimeline,
});

if (JapanMap) {
  register({
    meta: {
      id: 'JapanMap',
      displayName: 'JapanMap',
      props: [],
      allowChildren: false,
      defaultW: 520,
      defaultH: 360,
    },
    Render: JapanMap,
  });
}

register({
  meta: {
    id: 'PrefShareBar',
    displayName: 'PrefShareBar',
    props: [],
    allowChildren: false,
    defaultW: 320,
    defaultH: 40,
  },
  Render: PrefShareBar,
});

register({
  meta: {
    id: 'PrefGridMap',
    displayName: 'PrefGridMap',
    props: [],
    allowChildren: false,
    defaultW: 560,
    defaultH: 360,
  },
  Render: PrefGridMap,
});

register({
  meta: {
    id: 'SaveMapBar',
    displayName: 'SaveMapBar',
    props: [],
    allowChildren: false,
    defaultW: 320,
    defaultH: 40,
  },
  Render: SaveMapBar,
});

register({
  meta: {
    id: 'DownloadPNG',
    displayName: 'DownloadPNG',
    props: [],
    allowChildren: false,
    defaultW: 160,
    defaultH: 40,
  },
  Render: DownloadPNG,
});

register({
  meta: {
    id: 'PrefEnumLegend',
    displayName: 'PrefEnumLegend',
    props: [],
    allowChildren: false,
    defaultW: 320,
    defaultH: 40,
  },
  Render: PrefEnumLegend,
});

register({
  meta: {
    id: 'PrefEnumGridMap',
    displayName: 'PrefEnumGridMap',
    props: [],
    allowChildren: false,
    defaultW: 560,
    defaultH: 360,
  },
  Render: PrefEnumGridMap,
});

register({
  meta: {
    id: 'PrefEnumShareBar',
    displayName: 'PrefEnumShareBar',
    props: [],
    allowChildren: false,
    defaultW: 320,
    defaultH: 40,
  },
  Render: PrefEnumShareBar,
});

register({
  meta: {
    id: 'SaveMapBarEnum',
    displayName: 'SaveMapBarEnum',
    props: [],
    allowChildren: false,
    defaultW: 320,
    defaultH: 40,
  },
  Render: SaveMapBarEnum,
});

export const REGISTRY = {
  Card: { component: Card, displayName: 'Card' },
  PrefShareBar: { component: PrefShareBar, displayName: 'PrefShareBar' },
  PrefGridMap: { component: PrefGridMap, displayName: 'PrefGridMap' },
  SaveMapBar: { component: SaveMapBar, displayName: 'SaveMapBar' },
  DownloadPNG: { component: DownloadPNG, displayName: 'DownloadPNG' },
  PrefEnumLegend: { component: PrefEnumLegend, displayName: 'PrefEnumLegend' },
  PrefEnumGridMap: { component: PrefEnumGridMap, displayName: 'PrefEnumGridMap' },
  PrefEnumShareBar: { component: PrefEnumShareBar, displayName: 'PrefEnumShareBar' },
  SaveMapBarEnum: { component: SaveMapBarEnum, displayName: 'SaveMapBarEnum' },
  ...(JapanMap ? { JapanMap: { component: JapanMap, displayName: 'JapanMap' } } : {}),
} as const;
