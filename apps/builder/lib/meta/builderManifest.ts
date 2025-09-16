import type { ComponentNode, Page } from '@chizu/types'

export type BuilderManifest = Page

const leftSidebarPlaceholder: ComponentNode = {
  id: 'builder-left-placeholder',
  type: 'Text',
  props: { text: 'Left Sidebar' },
}

const canvasPlaceholder: ComponentNode = {
  id: 'builder-canvas-placeholder',
  type: 'Text',
  props: { text: 'Canvas Area' },
}

const rightPanelPlaceholder: ComponentNode = {
  id: 'builder-right-placeholder',
  type: 'Text',
  props: { text: 'Right Panel' },
}

export const DEFAULT_BUILDER_MANIFEST: BuilderManifest = {
  id: 'builder-ui',
  title: 'Builder UI Layout',
  frameId: 'frame-builder',
  content: [canvasPlaceholder],
  slotAssignments: {
    leftSidebar: [leftSidebarPlaceholder],
    rightPanel: [rightPanelPlaceholder],
  },
}
