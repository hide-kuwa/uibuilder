import { CSSProperties } from 'react';
export { BacklinkList } from './components/BacklinkList.js';
export { NodeInspector } from './components/NodeInspector.js';
export { GridSheet } from './components/GridSheet.js';
export { GridSheetV2 } from './components/GridSheetV2.js';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { LineageGraph } from '@chizu/types/lineage';
import '@chizu/types/gridsheet';

type Props$1 = {
    selectedId?: string;
    showRounding?: boolean;
};
declare function NodeInspectorV2({ selectedId, showRounding }: Props$1): react_jsx_runtime.JSX.Element;

type Props = {
    highlightPath?: string[];
};
declare function TraceGraph({ highlightPath }: Props): react_jsx_runtime.JSX.Element;

declare function TraceLegend({ graph }: {
    graph: LineageGraph;
}): react_jsx_runtime.JSX.Element;

type Row = {
    id: string;
    amount: number;
    memo?: string;
};
type Match = {
    leftId: string;
    rightId: string;
    score: number;
};
declare function RecoPanel({ left, right, matches, onConfirm, }: {
    left: Row[];
    right: Row[];
    matches: Match[];
    onConfirm?: (m: Match) => void;
}): react_jsx_runtime.JSX.Element;

declare function PublishSummary({ flags, onLockToggle, }: {
    flags: {
        rounded?: boolean;
        taxAdjust?: boolean;
        manualAdjust?: boolean;
    };
    onLockToggle?: (next: 'Draft' | 'Published') => void;
}): react_jsx_runtime.JSX.Element;

declare const entries: any;
declare const R: any;

declare function getSchema(type: string): any;
declare function mergeHoverStyle(el: JSX.Element, preset?: {
    base?: CSSProperties;
    hover?: CSSProperties;
    transition?: string;
}): JSX.Element;

export { NodeInspectorV2, PublishSummary, R, RecoPanel, TraceGraph, TraceLegend, R as default, entries, getSchema, mergeHoverStyle };
