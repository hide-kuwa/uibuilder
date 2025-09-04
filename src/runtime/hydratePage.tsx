import React from 'react';

export interface BuilderNode {
  id: string;
  type: string;
  props?: Record<string, any>;
  children?: BuilderNode[];
}

export interface ThemeTokens {
  [key: string]: any;
}

export interface PageSnapshot {
  version: number;
  pageId: string;
  layoutId: string;
  effectiveTheme: ThemeTokens;
  nodes: BuilderNode[];
  timestamp: number;
}

export type ComponentRegistry = Record<string, React.ComponentType<any>>;

function applyTheme(theme: ThemeTokens, el: HTMLElement) {
  const vars: Record<string, string> = {};
  const { colors = {}, radius = {}, spacing = {}, typography = {} } = theme as any;
  Object.entries(colors).forEach(([k, v]) => (vars[`--color-${k}`] = String(v)));
  Object.entries(radius).forEach(([k, v]) => (vars[`--radius-${k}`] = String(v)));
  Object.entries(spacing).forEach(([k, v]) => (vars[`--space-${k}`] = String(v)));
  if (typography.fontFamily) vars['--font-family'] = typography.fontFamily;
  if (typography.baseSize) vars['--font-size-base'] = typography.baseSize;
  if (typography.headingScale) vars['--heading-scale'] = String(typography.headingScale);
  if (typography.weightRegular) vars['--font-weight-regular'] = String(typography.weightRegular);
  if (typography.weightBold) vars['--font-weight-bold'] = String(typography.weightBold);
  for (const [key, value] of Object.entries(vars)) {
    el.style.setProperty(key, value);
  }
}

function renderNode(node: BuilderNode, registry: ComponentRegistry): React.ReactNode {
  const Comp = registry[node.type];
  if (!Comp) return null;
  const children = node.children?.map((c) => renderNode(c, registry));
  return React.createElement(Comp, { key: node.id, ...(node.props || {}) }, children);
}

export function hydratePage(snapshot: PageSnapshot, registry: ComponentRegistry): React.ReactElement {
  if (typeof document !== 'undefined') {
    applyTheme(snapshot.effectiveTheme, document.documentElement);
  }
  return <>{snapshot.nodes.map((n) => renderNode(n, registry))}</>;
}
