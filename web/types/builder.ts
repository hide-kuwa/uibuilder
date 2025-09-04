import type React from 'react';

export type PropMeta = {
  id: string;
  label: string;
  control: string;
  default?: any;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ label: string; value: string }>;
};

export type ComponentMeta = {
  id: string;
  displayName: string;
  group?: string;
  icon?: string;
  props: PropMeta[];
  allowChildren?: boolean;
  preferredSize?: { width: number; height: number };
  defaultW?: number;
  defaultH?: number;
  /** classification tags for search or filtering */
  tags?: string[];
  /** short description shown in libraries */
  description?: string;
  /** optional preview component rendered in libraries */
  preview?: () => JSX.Element;
  /** default props applied on insert */
  defaultProps?: Record<string, any>;
};

export type RendererProps = {
  nodeId: string;
  values: any;
};
