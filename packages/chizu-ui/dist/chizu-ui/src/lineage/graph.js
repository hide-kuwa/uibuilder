export function buildAdjacency(g) {
    const up = {};
    const down = {};
    for (const id of Object.keys(g.nodes)) {
        up[id] = [];
        down[id] = [];
    }
    for (const e of g.edges) {
        if (!down[e.from])
            down[e.from] = [];
        if (!up[e.to])
            up[e.to] = [];
        down[e.from].push(e.to);
        up[e.to].push(e.from);
    }
    return { up, down };
}
export function walkUp(g, start) {
    const adj = isAdj(g) ? g : buildAdjacency(g);
    const out = [];
    const seen = new Set([start]);
    const q = [start];
    while (q.length) {
        const cur = q.shift();
        for (const p of adj.up[cur] || []) {
            if (seen.has(p))
                continue;
            seen.add(p);
            out.push(p);
            q.push(p);
        }
    }
    return out;
}
export function walkDown(g, start) {
    const adj = isAdj(g) ? g : buildAdjacency(g);
    const out = [];
    const seen = new Set([start]);
    const q = [start];
    while (q.length) {
        const cur = q.shift();
        for (const n of adj.down[cur] || []) {
            if (seen.has(n))
                continue;
            seen.add(n);
            out.push(n);
            q.push(n);
        }
    }
    return out;
}
function isAdj(x) { return !!(x && x.up && x.down); }
// --- append-only: cycle detection ---
export function detectCycles(g) {
    const down = buildAdjacency(g).down;
    const visited = new Set();
    const stack = new Set();
    const path = [];
    const cycles = [];
    function dfs(u) {
        visited.add(u);
        stack.add(u);
        path.push(u);
        for (const v of down[u] ?? []) {
            if (!visited.has(v)) {
                dfs(v);
            }
            else if (stack.has(v)) {
                const i = path.indexOf(v);
                if (i >= 0)
                    cycles.push(path.slice(i));
            }
        }
        stack.delete(u);
        path.pop();
    }
    Object.keys(g.nodes).forEach((id) => { if (!visited.has(id))
        dfs(id); });
    return cycles;
}
