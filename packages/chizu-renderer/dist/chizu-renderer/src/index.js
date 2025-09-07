import React from 'react';
import { getRef, evalFormula } from './runtime';
export { generatePageCode } from './codegen';
export { RuntimeProvider, useFlowRuntime, getRef, evalFormula } from './runtime';
export function resolveBinding(runtime, nodeId, props, bindings) {
    if (!bindings)
        return props;
    const out = { ...props };
    for (const [prop, b] of Object.entries(bindings)) {
        try {
            const ins = (b.inputs ?? []).map((r) => getRef(runtime, r.scope, r.path));
            const val = b.formula?.expr ? evalFormula(b.formula.expr, ins) : ins[0];
            if (val !== undefined)
                out[prop] = val;
        }
        catch (err) {
            console.warn(`[binding:${nodeId}.${prop}]`, err);
        }
    }
    return out;
}
export function Slot({ nodes }) {
    return React.createElement(React.Fragment, null, nodes.map((N, i) => React.createElement(React.Fragment, { key: i }, N())));
}
export function applyHover(el, hoverPresetId, presets) {
    if (!hoverPresetId)
        return el;
    const preset = presets?.[hoverPresetId];
    if (!preset)
        return el;
    // lazy require to avoid circular ESM issues
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const REG = require('@chizu/registry');
    return REG.mergeHoverStyle(el, preset);
}
// Accept single or multiple preset ids; apply in order (later wins on overlaps)
export function applyHoverFlexible(el, presetIdOrIds, presets) {
    if (!presetIdOrIds)
        return el;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const REG = require('@chizu/registry');
    const ids = Array.isArray(presetIdOrIds) ? presetIdOrIds : [presetIdOrIds];
    let node = el;
    for (const id of ids) {
        const p = presets?.[id];
        if (p)
            node = REG.mergeHoverStyle(node, p);
    }
    return node;
}
