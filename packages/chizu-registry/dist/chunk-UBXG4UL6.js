import {
  init_useLineage,
  useLineage
} from "./chunk-NUDAQYSC.js";
import {
  __esm
} from "./chunk-2ESYSVXG.js";

// src/components/NodeInspector.tsx
import { useMemo } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
function NodeInspector({ selectedId, showRounding = true }) {
  const { data } = useLineage();
  if (!data) return /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: "Loading\u2026" });
  if (!selectedId) return /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: "\u30CE\u30FC\u30C9\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044" });
  const meta = data.nodes[selectedId];
  if (!meta) return /* @__PURE__ */ jsxs("div", { className: "text-sm text-red-500", children: [
    "\u672A\u767B\u9332\u30CE\u30FC\u30C9: ",
    selectedId
  ] });
  const connected = useMemo(
    () => data.edges.filter((e) => e.from === selectedId || e.to === selectedId),
    [data, selectedId]
  );
  const flagsAgg = connected.reduce(
    (acc, e) => {
      acc.rounded ||= !!e.flags?.rounded;
      acc.taxAdjust ||= !!e.flags?.taxAdjust;
      acc.manualAdjust ||= !!e.flags?.manualAdjust;
      return acc;
    },
    { rounded: false, taxAdjust: false, manualAdjust: false }
  );
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
    /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "Node Inspector" }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("span", { className: "opacity-60", children: "ID\uFF1A" }),
      meta.id
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("span", { className: "opacity-60", children: "Label\uFF1A" }),
      meta.label ?? "-"
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("span", { className: "opacity-60", children: "Kind\uFF1A" }),
      meta.kind
    ] }),
    meta.tags?.length ? /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("span", { className: "opacity-60", children: "Tags\uFF1A" }),
      meta.tags.join(", ")
    ] }) : null,
    showRounding && /* @__PURE__ */ jsxs("div", { className: "pt-2", children: [
      /* @__PURE__ */ jsx("div", { className: "opacity-60 text-xs", children: "Flags" }),
      /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside", children: [
        /* @__PURE__ */ jsxs("li", { children: [
          "rounded: ",
          String(flagsAgg.rounded)
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          "taxAdjust: ",
          String(flagsAgg.taxAdjust)
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          "manualAdjust: ",
          String(flagsAgg.manualAdjust)
        ] })
      ] })
    ] })
  ] });
}
var init_NodeInspector = __esm({
  "src/components/NodeInspector.tsx"() {
    init_useLineage();
  }
});

export {
  NodeInspector,
  init_NodeInspector
};
