import React from 'react';

export type ComponentCategory = 'action' | 'visual' | 'functional' | 'layout';

export interface RegisteredComponent {
  id: string;
  name: string;
  type: ComponentCategory;
  icon: React.ReactNode;
  tags: string[];
  description: string;
  preview?: () => JSX.Element;
  defaultProps?: Record<string, any>;
  component: React.ComponentType<any>;
}

const registry: Record<string, RegisteredComponent> = {};

export function registerComponent(
  component: React.ComponentType<any>,
  meta: Omit<RegisteredComponent, 'component'>
) {
  registry[meta.id] = { ...meta, component };
}

export function getRegisteredComponents(type?: ComponentCategory): RegisteredComponent[] {
  const comps = Object.values(registry);
  return type ? comps.filter((c) => c.type === type) : comps;
}

export function getRegisteredComponent(id: string): RegisteredComponent | undefined {
  return registry[id];
}

export function getComponentById(id: string): React.ComponentType<any> | undefined {
  return registry[id]?.component;
}

