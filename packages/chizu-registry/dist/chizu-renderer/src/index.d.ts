import React from 'react';
import type { Bindings } from '@chizu/types';
export { generatePageCode } from './codegen';
export { RuntimeProvider, useFlowRuntime, getRef, evalFormula } from './runtime';
export declare function resolveBinding(runtime: any, nodeId: string, props: Record<string, any>, bindings?: Bindings): Record<string, any>;
export declare function Slot({ nodes }: {
    nodes: Array<() => React.ReactNode>;
}): React.FunctionComponentElement<{
    children?: React.ReactNode | undefined;
}>;
export type HoverPresetMap = Record<string, {
    base?: React.CSSProperties;
    hover?: React.CSSProperties;
    transition?: string;
}>;
export declare function applyHover(el: JSX.Element, hoverPresetId?: string, presets?: HoverPresetMap): any;
export declare function applyHoverFlexible(el: JSX.Element, presetIdOrIds: string | string[] | undefined, presets?: HoverPresetMap): JSX.Element;
