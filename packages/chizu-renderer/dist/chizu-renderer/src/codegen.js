function hash8(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++)
        h = ((h << 5) + h) ^ s.charCodeAt(i);
    return (h >>> 0).toString(16).slice(0, 8);
}
function pascal(s) {
    return s
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .trim()
        .split(' ')
        .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
        .join('');
}
function stablePropsLiteral(props) {
    if (!props)
        return '{}';
    const keys = Object.keys(props).sort();
    const entries = keys.map((k) => `${JSON.stringify(k)}:${JSON.stringify(props[k])}`);
    return `{${entries.join(',')}}`;
}
function walkNodes(nodes, acc = []) {
    for (const n of nodes) {
        acc.push(n);
        if (n.children?.length)
            walkNodes(n.children, acc);
        if (n.slots)
            Object.values(n.slots).forEach((v) => walkNodes(v ?? [], acc));
    }
    return acc;
}
function slotOrder(frame) {
    const base = frame?.slots?.map((s) => s.name) ?? [];
    const seen = new Set();
    const ordered = [];
    ['header', 'sidebar', 'content', 'footer'].forEach((n) => {
        if (base.includes(n) && !seen.has(n)) {
            ordered.push(n);
            seen.add(n);
        }
    });
    base.forEach((n) => {
        if (!seen.has(n)) {
            ordered.push(n);
            seen.add(n);
        }
    });
    if (!seen.has('content'))
        ordered.push('content');
    return ordered;
}
export function generatePageCode(opts) {
    const { page, frame } = opts;
    const reg = opts.registryImport ?? '@chizu/registry';
    const pref = opts.componentVarPrefix ?? 'N';
    const slots = slotOrder(frame);
    const assemble = {};
    for (const s of slots)
        assemble[s] = [];
    if (page.slotAssignments) {
        for (const [k, v] of Object.entries(page.slotAssignments))
            assemble[k] = v ?? [];
    }
    assemble['content'] = page.content ?? [];
    const allNodes = [];
    for (const s of slots)
        walkNodes(assemble[s], allNodes);
    const stabPath = allNodes.map((n) => `${n.type}:${n.id}`).join('|') || page.id;
    const stableKey = hash8(`${page.id}:${stabPath}`);
    const compName = `Page_${pascal(page.id)}_${stableKey}`;
    const frameId = frame?.name ? `Frame_${pascal(frame.name)}` : 'Frame_Basic';
    const factories = [];
    let serial = 1;
    function makeFactory(n) {
        const varName = `${pref}${serial++}`;
        const propsLit = stablePropsLiteral(n.props);
        const bindingsLit = n.bindings ? JSON.stringify(n.bindings) : '{}';
        factories.push(`const ${varName}=()=>R[${JSON.stringify(n.type)}](resolveBinding(runtime,${JSON.stringify(varName)},${propsLit},${bindingsLit}), runtime)`);
        return varName;
    }
    const slotLines = [];
    for (const s of slots) {
        const vars = [];
        for (const n of assemble[s]) {
            const queue = [n];
            while (queue.length) {
                const cur = queue.shift();
                vars.push(makeFactory(cur));
                if (cur.children)
                    queue.push(...cur.children);
                if (cur.slots)
                    Object.values(cur.slots).forEach((v) => queue.push(...(v ?? [])));
            }
        }
        slotLines.push(`${JSON.stringify(s)}:<Slot nodes={[${vars.join(',')}]} />`);
    }
    const body = [
        `import React from 'react'`,
        `import { resolveBinding, Slot, useFlowRuntime } from '@chizu/renderer'`,
        `import * as R from '${reg}'`,
        ``,
        `export default function ${compName}(){`,
        `const runtime=useFlowRuntime()`,
        ...factories,
        `return R[${JSON.stringify(frameId)}]({${slotLines.join(',')}} , runtime)`,
        `}`,
    ].join('\n');
    const fileName = `${page.id}.${stableKey}.tsx`;
    return { tsx: body, fileName, stableKey };
}
