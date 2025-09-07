import {
  init_useLineage,
  useLineage
} from "./chunk-NUDAQYSC.js";
import {
  __esm
} from "./chunk-2ESYSVXG.js";

// src/components/BacklinkList.tsx
import { useMemo } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
function bfsUp(graph, start) {
  const up = [];
  const seen = /* @__PURE__ */ new Set([start]);
  let q = [start];
  while (q.length) {
    const cur = q.shift();
    graph.edges.filter((e) => e.to === cur).forEach((e) => {
      if (!seen.has(e.from)) {
        seen.add(e.from);
        up.push(e.from);
        q.push(e.from);
      }
    });
  }
  return up;
}
function bfsDown(graph, start) {
  const down = [];
  const seen = /* @__PURE__ */ new Set([start]);
  let q = [start];
  while (q.length) {
    const cur = q.shift();
    graph.edges.filter((e) => e.from === cur).forEach((e) => {
      if (!seen.has(e.to)) {
        seen.add(e.to);
        down.push(e.to);
        q.push(e.to);
      }
    });
  }
  return down;
}
function BacklinkList({ title = "Backlinks", selectedId, onSelect }) {
  const { data } = useLineage();
  const up = useMemo(() => data && selectedId ? bfsUp(data, selectedId) : [], [data, selectedId]);
  const down = useMemo(() => data && selectedId ? bfsDown(data, selectedId) : [], [data, selectedId]);
  if (!data) return /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: "Loading lineage\u2026" });
  if (!selectedId) return /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: "\u30CE\u30FC\u30C9\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044" });
  const nodeLabel = (id) => data.nodes[id]?.label ?? id;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsx("div", { className: "font-medium", children: title }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsxs("div", { className: "text-xs font-semibold opacity-70 mb-1", children: [
        "\u4E0A\u6D41\uFF08",
        up.length,
        "\uFF09"
      ] }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-1", children: up.map((id) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
        "button",
        {
          className: "text-sm underline underline-offset-2 hover:opacity-80",
          onClick: () => onSelect?.(id),
          type: "button",
          children: nodeLabel(id)
        }
      ) }, `up-${id}`)) })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsxs("div", { className: "text-xs font-semibold opacity-70 mb-1", children: [
        "\u4E0B\u6D41\uFF08",
        down.length,
        "\uFF09"
      ] }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-1", children: down.map((id) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
        "button",
        {
          className: "text-sm underline underline-offset-2 hover:opacity-80",
          onClick: () => onSelect?.(id),
          type: "button",
          children: nodeLabel(id)
        }
      ) }, `down-${id}`)) })
    ] })
  ] });
}
var init_BacklinkList = __esm({
  "src/components/BacklinkList.tsx"() {
    init_useLineage();
  }
});

export {
  BacklinkList,
  init_BacklinkList
};
