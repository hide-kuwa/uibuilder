import type { ReactNode } from 'react';
export type SlotName = string;
export interface SlotSpec {
    name: SlotName;
    accepts?: string[];
    maxChildren?: number;
    required?: boolean;
}
export interface Variant {
    className?: string;
    style?: Record<string, string>;
    props?: Record<string, any>;
}
export type BindingScope = 'local' | 'page' | 'frame' | 'app' | 'api';
export interface BindingRef {
    scope: BindingScope;
    path: string;
}
export interface Formula {
    expr: string;
}
export interface Binding {
    inputs: BindingRef[];
    formula?: Formula;
    debounceMs?: number;
    explanation?: string;
}
export type Bindings = Record<string, Binding>;
export interface ComponentNode {
    id: string;
    type: string;
    props?: Record<string, any>;
    bindings?: Bindings;
    variants?: Record<string, Variant>;
    children?: ComponentNode[];
    slots?: Record<SlotName, ComponentNode[]>;
    meta?: {
        name?: string;
        locked?: boolean;
        componentRefId?: string;
    };
}
export interface Frame {
    id: string;
    name: string;
    slots: SlotSpec[];
    theme?: string;
    version?: string;
}
export interface Page {
    id: string;
    title: string;
    frameId?: string;
    content: ComponentNode[];
    slotAssignments?: Record<SlotName, ComponentNode[]>;
    meta?: {
        pathname?: string;
        og?: {
            title?: string;
            description?: string;
            imageUrl?: string;
        };
        tags?: string[];
    };
    version?: string;
}
export interface JSONSchema {
    type: 'object';
    properties: Record<string, JSONSchemaProperty>;
    required?: string[];
}
export interface JSONSchemaProperty {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    title?: string;
    enum?: string[];
    default?: any;
}
export interface RegistryEntry {
    id: string;
    displayName: string;
    category?: string;
    icon?: string;
    propsSchema: JSONSchema;
    eventsSchema?: JSONSchema;
    styleSchema?: JSONSchema;
    slotSchema?: SlotSpec[];
    render: (props: any, slots?: Record<SlotName, ComponentNode[]>) => ReactNode;
}
export interface HoverPreset {
    id: string;
    name: string;
    base?: React.CSSProperties;
    hover?: React.CSSProperties;
    transition?: string;
}
export interface DataSource {
    key: string;
    url: string;
    ttlSec?: number;
}
