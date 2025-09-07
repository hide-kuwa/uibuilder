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

// src/lineage/flags.ts
var flags_exports = {};
__export(flags_exports, {
  aggregateFlags: () => aggregateFlags
});
module.exports = __toCommonJS(flags_exports);
function aggregateFlags(graph, nodeId) {
  const flags = { rounded: false, taxAdjust: false, manualAdjust: false };
  for (const e of graph.edges) {
    if (e.from === nodeId || e.to === nodeId) {
      flags.rounded ||= !!e.flags?.rounded;
      flags.taxAdjust ||= !!e.flags?.taxAdjust;
      flags.manualAdjust ||= !!e.flags?.manualAdjust;
    }
  }
  return flags;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  aggregateFlags
});
