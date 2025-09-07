"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/lineage/graph.ts
var graph_exports = {};
__export(graph_exports, {
  buildAdjacency: () => buildAdjacency,
  detectCycles: () => detectCycles,
  walkDown: () => walkDown,
  walkUp: () => walkUp
});
module.exports = __toCommonJS(graph_exports);
function buildAdjacency(g) {
  const up = {};
  const down = {};
  for (const id of Object.keys(g.nodes)) {
    up[id] = [];
    down[id] = [];
  }
  for (const e of g.edges) {
    if (!down[e.from]) down[e.from] = [];
    if (!up[e.to]) up[e.to] = [];
    down[e.from].push(e.to);
    up[e.to].push(e.from);
  }
  return { up, down };
}
function walkUp(g, start) {
  const adj = isAdj(g) ? g : buildAdjacency(g);
  const out = [];
  const seen = /* @__PURE__ */ new Set([start]);
  const q = [start];
  while (q.length) {
    const cur = q.shift();
    for (const p of adj.up[cur] || []) {
      if (seen.has(p)) continue;
      seen.add(p);
      out.push(p);
      q.push(p);
    }
  }
  return out;
}
function walkDown(g, start) {
  const adj = isAdj(g) ? g : buildAdjacency(g);
  const out = [];
  const seen = /* @__PURE__ */ new Set([start]);
  const q = [start];
  while (q.length) {
    const cur = q.shift();
    for (const n of adj.down[cur] || []) {
      if (seen.has(n)) continue;
      seen.add(n);
      out.push(n);
      q.push(n);
    }
  }
  return out;
}
function isAdj(x) {
  return !!(x && x.up && x.down);
}
function detectCycles(g) {
  const down = buildAdjacency(g).down;
  const visited = /* @__PURE__ */ new Set();
  const stack = /* @__PURE__ */ new Set();
  const path = [];
  const cycles = [];
  function dfs(u) {
    visited.add(u);
    stack.add(u);
    path.push(u);
    for (const v of down[u] ?? []) {
      if (!visited.has(v)) {
        dfs(v);
      } else if (stack.has(v)) {
        const i = path.indexOf(v);
        if (i >= 0) cycles.push(path.slice(i));
      }
    }
    stack.delete(u);
    path.pop();
  }
  Object.keys(g.nodes).forEach((id) => {
    if (!visited.has(id)) dfs(id);
  });
  return cycles;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  buildAdjacency,
  detectCycles,
  walkDown,
  walkUp
});
