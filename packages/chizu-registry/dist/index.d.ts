import { CSSProperties } from 'react';
export { BacklinkList } from './components/BacklinkList.js';
export { NodeInspector } from './components/NodeInspector.js';
export { GridSheet } from './components/GridSheet.js';
export { GridSheetV2 } from './components/GridSheetV2.js';
import 'react/jsx-runtime';
import '@chizu/types/gridsheet';

declare const entries: any;
declare const R: any;

declare function getSchema(type: string): any;
declare function mergeHoverStyle(el: JSX.Element, preset?: {
    base?: CSSProperties;
    hover?: CSSProperties;
    transition?: string;
}): JSX.Element;

export { R, R as default, entries, getSchema, mergeHoverStyle };
