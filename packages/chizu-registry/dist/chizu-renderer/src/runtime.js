import React, { createContext, useContext, useMemo } from 'react';
const Ctx = createContext({});
export function RuntimeProvider({ value, children }) {
    const v = useMemo(() => value, [value]);
    return React.createElement(Ctx.Provider, { value: v }, children);
}
export function useFlowRuntime() {
    return useContext(Ctx);
}
export function getRef(runtime, scope, path) {
    const root = scope === 'page' ? runtime.page
        : scope === 'frame' ? runtime.frame
            : scope === 'app' ? runtime.app
                : scope === 'api' ? runtime.api
                    : undefined;
    if (!root)
        return undefined;
    const parts = path.split('.').filter(Boolean);
    let cur = root;
    for (const p of parts) {
        if (cur == null)
            return undefined;
        cur = cur[p];
    }
    return cur;
}
export function evalFormula(expr, inputs) {
    const f = new Function('$0', '$1', '$2', '$3', '$4', 'return (' + expr + ')');
    return f(inputs[0], inputs[1], inputs[2], inputs[3], inputs[4]);
}
