import React from 'react';

export interface RegisteredComponent {
  name: string;
  component: React.ComponentType<any>;
}

const registry: Record<string, RegisteredComponent> = {};

export function registerComponent(component: React.ComponentType<any>, meta: { name: string }) {
  registry[meta.name] = { name: meta.name, component };
}

export function getRegisteredComponents(): RegisteredComponent[] {
  return Object.values(registry);
}

export function getComponentByName(name: string): React.ComponentType<any> | undefined {
  return registry[name]?.component;
}

