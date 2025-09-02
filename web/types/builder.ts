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
};

export type RendererProps = {
  nodeId: string;
  values: any;
};
