import type { FC, ReactNode } from "react";
import { z } from "zod";
import type { DataBindings } from "@data";

export type EventsMap = Record<string, z.ZodTypeAny>;

export interface RegisteredComp<TProps = any> {
  id: string;
  displayName: string;
  icon?: ReactNode | string;
  tags?: string[];
  propsSchema: z.ZodType<TProps>;
  defaultProps: TProps;
  events?: EventsMap;
  load: () => Promise<FC<TProps & { tabId?: string }>>;
}

export type Registry = Record<string, RegisteredComp<any>>;

export type PropValue =
  | string
  | number
  | boolean
  | { __expr: string };

export type ComponentNode = {
  id: string;
  componentId: string;
  props: Record<string, PropValue>;
  /** user-defined expression props retained separately from serializable props */
  userCode?: Record<string, string>;
  children?: ComponentNode[];
  locked?: boolean;
  dataBindings?: DataBindings;
};
