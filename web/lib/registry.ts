import React from 'react';
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
import PlaceGallery from '@/components/travel/PlaceGallery';
import POIMap from '@/components/travel/POIMap';
import CostSplit from '@/components/travel/CostSplit';
import JapanMapEnumSVG from '@/components/travel/JapanMapEnumSVG';
import BackgroundGradient from '@/components/design/BackgroundGradient';
import Section from '@/components/design/Section';
import Hero from '@/components/typography/Hero';
import { MapThemeProvider } from '@/contexts/MapThemeContext';
import AnimeOnMount from '@/components/anim/AnimeOnMount';
import AnimeOnView from '@/components/anim/AnimeOnView';
import InteractiveWrapper from '@/components/interactive/InteractiveWrapper';

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
    tags: ['layout', 'container'],
    description: 'Generic container card.',
    preview: () => <Card />,
    defaultProps: {},
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
    tags: ['visual'],
    description: 'Header section for trips.',
    preview: () => <TripHeader />,
    defaultProps: {},
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
    id: 'JapanMapEnumSVG',
    displayName: 'JapanMapEnumSVG',
    props: [],
    allowChildren: false,
    defaultW: 560,
    defaultH: 360,
  },
  Render: JapanMapEnumSVG,
});

register({
  meta: {
    id: 'BackgroundGradient',
    displayName: 'BackgroundGradient',
    props: [],
    allowChildren: true,
    defaultW: 720,
    defaultH: 480,
  },
  Render: BackgroundGradient,
});

register({
  meta: {
    id: 'Section',
    displayName: 'Section',
    props: [],
    allowChildren: true,
    defaultW: 720,
    defaultH: 480,
  },
  Render: Section,
});

register({
  meta: {
    id: 'Hero',
    displayName: 'Hero',
    props: [],
    allowChildren: false,
    defaultW: 560,
    defaultH: 200,
  },
  Render: Hero,
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

register({
  meta: {
    id: 'PlaceGallery',
    displayName: 'PlaceGallery',
    props: [],
    allowChildren: false,
    defaultW: 560,
    defaultH: 360,
  },
  Render: PlaceGallery,
});

register({
  meta: {
    id: 'POIMap',
    displayName: 'POIMap',
    props: [],
    allowChildren: false,
    defaultW: 560,
    defaultH: 360,
  },
  Render: POIMap,
});

register({
  meta: {
    id: 'CostSplit',
    displayName: 'CostSplit',
    props: [],
    allowChildren: false,
    defaultW: 420,
    defaultH: 240,
  },
  Render: CostSplit,
});

register({
  meta: {
    id: 'MapThemeProvider',
    displayName: 'MapThemeProvider',
    props: [],
    allowChildren: true,
    defaultW: 100,
    defaultH: 100,
  },
  Render: MapThemeProvider,
});

export const REGISTRY = {
  Card: { component: Card, displayName: 'Card' },
  PrefShareBar: { component: PrefShareBar, displayName: 'PrefShareBar' },
  PrefGridMap: { component: PrefGridMap, displayName: 'PrefGridMap' },
  SaveMapBar: { component: SaveMapBar, displayName: 'SaveMapBar' },
  DownloadPNG: { component: DownloadPNG, displayName: 'DownloadPNG' },
  PrefEnumLegend: { component: PrefEnumLegend, displayName: 'PrefEnumLegend' },
  PrefEnumGridMap: { component: PrefEnumGridMap, displayName: 'PrefEnumGridMap' },
  JapanMapEnumSVG: { component: JapanMapEnumSVG, displayName: 'JapanMapEnumSVG' },
  BackgroundGradient: { component: BackgroundGradient, displayName: 'BackgroundGradient' },
  Section: { component: Section, displayName: 'Section' },
  Hero: { component: Hero, displayName: 'Hero' },
  PrefEnumShareBar: { component: PrefEnumShareBar, displayName: 'PrefEnumShareBar' },
  SaveMapBarEnum: { component: SaveMapBarEnum, displayName: 'SaveMapBarEnum' },
  PlaceGallery: { component: PlaceGallery, displayName: 'PlaceGallery' },
  POIMap: { component: POIMap, displayName: 'POIMap' },
  CostSplit: { component: CostSplit, displayName: 'CostSplit' },
  MapThemeProvider: { component: MapThemeProvider, displayName: 'MapThemeProvider' },
  AnimeOnMount: { component: AnimeOnMount, displayName: 'AnimeOnMount' },
  AnimeOnView: { component: AnimeOnView, displayName: 'AnimeOnView' },
  InteractiveWrapper: { component: InteractiveWrapper, displayName: 'InteractiveWrapper' },
  ...(JapanMap ? { JapanMap: { component: JapanMap, displayName: 'JapanMap' } } : {}),
} as const;
