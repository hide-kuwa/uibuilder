import {
  BacklinkList,
  init_BacklinkList
} from "./chunk-BZWG4VAD.js";
import {
  GridSheet,
  init_GridSheet
} from "./chunk-FOJCC447.js";
import {
  GridSheetV2,
  init_GridSheetV2
} from "./chunk-MZ5IJIZO.js";
import {
  NodeInspector,
  init_NodeInspector
} from "./chunk-UBXG4UL6.js";
import {
  init_useLineage,
  useLineage
} from "./chunk-NUDAQYSC.js";
import {
  __esm,
  __export,
  __toCommonJS
} from "./chunk-2ESYSVXG.js";

// ../chizu-renderer/src/runtime.ts
import React, { createContext, useContext, useMemo } from "react";
var Ctx;
var init_runtime = __esm({
  "../chizu-renderer/src/runtime.ts"() {
    "use strict";
    Ctx = createContext({});
  }
});

// ../chizu-renderer/src/codegen.ts
var init_codegen = __esm({
  "../chizu-renderer/src/codegen.ts"() {
    "use strict";
  }
});

// ../chizu-renderer/src/index.ts
import React2 from "react";
function applyHoverFlexible(el, presetIdOrIds, presets) {
  if (!presetIdOrIds) return el;
  const REG = (init_index(), __toCommonJS(index_exports));
  const ids = Array.isArray(presetIdOrIds) ? presetIdOrIds : [presetIdOrIds];
  let node = el;
  for (const id of ids) {
    const p = presets?.[id];
    if (p) node = REG.mergeHoverStyle(node, p);
  }
  return node;
}
var init_src = __esm({
  "../chizu-renderer/src/index.ts"() {
    "use strict";
    init_runtime();
    init_codegen();
    init_runtime();
  }
});

// src/components/NodeInspectorV2.tsx
import { useMemo as useMemo2 } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
function NodeInspectorV2({ selectedId, showRounding = true }) {
  const { data } = useLineage();
  if (!data) return /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: "Loading\u2026" });
  if (!selectedId) return /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: "\u30CE\u30FC\u30C9\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044" });
  const meta = data.nodes[selectedId];
  if (!meta) return /* @__PURE__ */ jsxs("div", { className: "text-sm text-red-500", children: [
    "\u672A\u767B\u9332\u30CE\u30FC\u30C9: ",
    selectedId
  ] });
  const connected = useMemo2(
    () => data.edges.filter((edge) => edge.from === selectedId || edge.to === selectedId),
    [data, selectedId]
  );
  const flagsAgg = connected.reduce(
    (acc, edge) => ({
      rounded: acc.rounded || !!edge.flags?.rounded,
      taxAdjust: acc.taxAdjust || !!edge.flags?.taxAdjust,
      manualAdjust: acc.manualAdjust || !!edge.flags?.manualAdjust
    }),
    { rounded: false, taxAdjust: false, manualAdjust: false }
  );
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
    /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "Node Inspector V2" }),
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
var init_NodeInspectorV2 = __esm({
  "src/components/NodeInspectorV2.tsx"() {
    "use strict";
    "use client";
    init_useLineage();
  }
});

// src/components/TraceGraph.tsx
import { useMemo as useMemo3 } from "react";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function TraceGraph({ highlightPath = [] }) {
  const { data } = useLineage();
  if (!data) return /* @__PURE__ */ jsx2("div", { className: "text-sm text-gray-500", children: "Loading lineage\u2026" });
  const groups = useMemo3(() => {
    const m = /* @__PURE__ */ new Map();
    for (const id of Object.keys(data.nodes)) {
      const gid = data.nodes[id]?.groupId || "ungrouped";
      if (!m.has(gid)) m.set(gid, []);
      m.get(gid).push(id);
    }
    return Array.from(m.entries()).map(([gid, ids]) => ({ gid, ids }));
  }, [data]);
  const colCount = groups.length || 1;
  const itemH = 44;
  const vGap = 12;
  const colPad = 12;
  const pos = useMemo3(() => {
    const p = {};
    groups.forEach((g, col) => {
      g.ids.forEach((id, row) => {
        p[id] = { col, row };
      });
    });
    return p;
  }, [groups]);
  const maxRows = useMemo3(() => Math.max(1, ...groups.map((g) => g.ids.length)), [groups]);
  const svgW = 1e3;
  const svgH = maxRows * itemH + Math.max(0, maxRows - 1) * vGap + 2 * colPad;
  const hpairs = /* @__PURE__ */ new Set();
  if (highlightPath.length >= 2) {
    for (let i = 0; i < highlightPath.length - 1; i++) {
      hpairs.add(`${highlightPath[i]}->${highlightPath[i + 1]}`);
    }
  }
  function nodeCenter(id) {
    const { col, row } = pos[id] || { col: 0, row: 0 };
    const x = (col + 0.5) / colCount * svgW;
    const y = colPad + row * (itemH + vGap) + itemH / 2;
    return { x, y };
  }
  return /* @__PURE__ */ jsxs2("div", { className: "relative", style: { padding: 8 }, children: [
    /* @__PURE__ */ jsx2("div", { className: "grid gap-4", style: { gridTemplateColumns: `repeat(${colCount}, minmax(0,1fr))` }, children: groups.map((g) => /* @__PURE__ */ jsxs2("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx2("div", { className: "text-xs font-semibold opacity-70", children: g.gid }),
      /* @__PURE__ */ jsx2("div", { className: "flex flex-col gap-3", children: g.ids.map((id) => {
        const isHL = highlightPath.includes(id);
        const meta = data.nodes[id];
        return /* @__PURE__ */ jsxs2(
          "div",
          {
            className: `px-2 py-2 rounded border ${isHL ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}`,
            children: [
              /* @__PURE__ */ jsx2("div", { className: `text-xs ${isHL ? "font-semibold" : ""}`, children: meta?.label ?? id }),
              /* @__PURE__ */ jsx2("div", { className: "text-[10px] opacity-60", children: id })
            ]
          },
          id
        );
      }) })
    ] }, g.gid)) }),
    /* @__PURE__ */ jsx2(
      "svg",
      {
        width: "100%",
        height: svgH,
        viewBox: `0 0 ${svgW} ${svgH}`,
        className: "pointer-events-none absolute inset-0",
        children: data.edges.map((e, idx) => {
          const a = nodeCenter(e.from);
          const b = nodeCenter(e.to);
          const key = `${e.from}->${e.to}`;
          const hl = hpairs.has(key);
          return /* @__PURE__ */ jsx2(
            "line",
            {
              x1: a.x,
              y1: a.y,
              x2: b.x,
              y2: b.y,
              stroke: hl ? "#2563eb" : "#94a3b8",
              strokeWidth: hl ? 3 : 1.5,
              strokeOpacity: 0.9
            },
            idx
          );
        })
      }
    )
  ] });
}
var init_TraceGraph = __esm({
  "src/components/TraceGraph.tsx"() {
    "use strict";
    "use client";
    init_useLineage();
  }
});

// src/components/TraceLegend.tsx
import { jsx as jsx3 } from "react/jsx-runtime";
function TraceLegend({ graph }) {
  const groups = Array.from(new Set(Object.values(graph.nodes).map((n) => n.groupId ?? "ungrouped")));
  return /* @__PURE__ */ jsx3("div", { className: "text-xs text-gray-600 flex flex-wrap gap-2", children: groups.map((g) => /* @__PURE__ */ jsx3("span", { className: "px-2 py-0.5 rounded border border-gray-300 bg-white", children: g }, g)) });
}
var init_TraceLegend = __esm({
  "src/components/TraceLegend.tsx"() {
    "use strict";
    "use client";
  }
});

// src/components/RecoPanel.tsx
import React5 from "react";
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
function RecoPanel({
  left,
  right,
  matches,
  onConfirm
}) {
  const [confirmed, setConfirmed] = React5.useState(/* @__PURE__ */ new Set());
  const confirm = (m) => {
    const key = `${m.leftId}-${m.rightId}`;
    setConfirmed((s) => new Set(s).add(key));
    onConfirm?.(m);
  };
  return /* @__PURE__ */ jsxs3("div", { className: "text-sm space-y-2", children: [
    /* @__PURE__ */ jsx4("div", { className: "font-semibold", children: "\u7167\u5408\u5019\u88DC" }),
    /* @__PURE__ */ jsx4("ul", { className: "space-y-1", children: matches.map((m) => {
      const key = `${m.leftId}-${m.rightId}`;
      const done = confirmed.has(key);
      return /* @__PURE__ */ jsxs3("li", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx4("span", { className: "px-2 py-0.5 rounded bg-gray-100", children: m.score.toFixed(2) }),
        /* @__PURE__ */ jsxs3("span", { children: [
          m.leftId,
          " \u2194 ",
          m.rightId
        ] }),
        done ? /* @__PURE__ */ jsx4("span", { className: "text-green-600", children: "\u78BA\u5B9A\u6E08" }) : /* @__PURE__ */ jsx4("button", { className: "underline", onClick: () => confirm(m), type: "button", children: "\u78BA\u5B9A" })
      ] }, key);
    }) })
  ] });
}
var init_RecoPanel = __esm({
  "src/components/RecoPanel.tsx"() {
    "use strict";
    "use client";
  }
});

// src/components/PublishSummary.tsx
import React6 from "react";
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
function PublishSummary({
  flags,
  onLockToggle
}) {
  const [state, setState] = React6.useState("Draft");
  return /* @__PURE__ */ jsxs4("div", { className: "space-y-2 text-sm", children: [
    /* @__PURE__ */ jsx5("div", { className: "font-semibold", children: "Publish Summary" }),
    /* @__PURE__ */ jsxs4("ul", { className: "list-disc list-inside", children: [
      /* @__PURE__ */ jsxs4("li", { children: [
        "rounded: ",
        String(!!flags.rounded)
      ] }),
      /* @__PURE__ */ jsxs4("li", { children: [
        "taxAdjust: ",
        String(!!flags.taxAdjust)
      ] }),
      /* @__PURE__ */ jsxs4("li", { children: [
        "manualAdjust: ",
        String(!!flags.manualAdjust)
      ] })
    ] }),
    /* @__PURE__ */ jsx5("div", { className: "pt-2", children: /* @__PURE__ */ jsxs4("button", { className: "underline", onClick: () => {
      const next = state === "Draft" ? "Published" : "Draft";
      setState(next);
      onLockToggle?.(next);
    }, children: [
      "\u5207\u66FF: ",
      state,
      " \u2192 ",
      state === "Draft" ? "Published" : "Draft"
    ] }) })
  ] });
}
var init_PublishSummary = __esm({
  "src/components/PublishSummary.tsx"() {
    "use strict";
    "use client";
  }
});

// src/index.ts
var index_exports = {};
__export(index_exports, {
  BacklinkList: () => BacklinkList,
  GridSheet: () => GridSheet,
  GridSheetV2: () => GridSheetV2,
  NodeInspector: () => NodeInspector,
  NodeInspectorV2: () => NodeInspectorV2,
  PublishSummary: () => PublishSummary,
  R: () => R,
  RecoPanel: () => RecoPanel,
  TraceGraph: () => TraceGraph,
  TraceLegend: () => TraceLegend,
  default: () => index_default,
  entries: () => entries,
  getSchema: () => getSchema,
  mergeHoverStyle: () => mergeHoverStyle
});
import React7 from "react";
const SlotContainer = ({ slotId, nodeId, as, children }) => {
  const list = React7.Children.toArray(children ?? []);
  const pieces = [React7.createElement("div", { key: "sep-0", "data-drop-sep": "", "data-drop-index": 0 })];
  list.forEach((child, idx) => {
    pieces.push(child);
    pieces.push(React7.createElement("div", { key: `sep-${idx + 1}`, "data-drop-sep": "", "data-drop-index": idx + 1 }));
  });
  return React7.createElement(as, { "data-slot": slotId, "data-node-id": nodeId ?? slotId }, pieces);
};
function renderSlot(content) {
  if (Array.isArray(content)) {
    return content.map((n, i) => React7.createElement("div", { key: i }, n));
  }
  return content ?? null;
}
function getSchema(type) {
  return entries[type]?.propsSchema;
}
function mergeHoverStyle(el, preset) {
  if (!preset) return el;
  const props = { ...el.props || {} };
  const style = { ...props.style || {}, ...preset.base || {} };
  if (preset.transition) style.transition = preset.transition;
  const onMouseEnter = (e) => {
    if (preset.hover) Object.assign(e.currentTarget.style, preset.hover);
    props.onMouseEnter?.(e);
  };
  const onMouseLeave = (e) => {
    if (preset.base) Object.assign(e.currentTarget.style, preset.base);
    props.onMouseLeave?.(e);
  };
  return React7.cloneElement(el, { ...props, style, onMouseEnter, onMouseLeave });
}
var CommonHover, entries, R, index_default;
var init_index = __esm({
  "src/index.ts"() {
    init_src();
    init_BacklinkList();
    init_NodeInspector();
    init_GridSheet();
    init_GridSheetV2();
    init_NodeInspectorV2();
    init_TraceGraph();
    init_TraceLegend();
    init_RecoPanel();
    init_PublishSummary();
    CommonHover = {
      hoverPresetId: { type: "string", title: "Hover Preset (single)", default: "" },
      hoverPresetIds: { type: "array", title: "Hover Presets (multi)", items: { type: "string" }, default: [] }
    };
    entries = {
      Text: {
        id: "Text",
        displayName: "Text",
        propsSchema: { type: "object", properties: { text: { type: "string", title: "text", default: "" } } },
        render: (p, _slots, runtime) => {
          const node = React7.createElement("span", { style: { display: "inline-block" } }, p.text ?? "");
          const presetArg = p.hoverPresetIds?.length ? p.hoverPresetIds : p.hoverPresetId;
          return applyHoverFlexible(node, presetArg, runtime?.api?.hoverPresets);
        }
      },
      Image: {
        id: "Image",
        displayName: "Image",
        propsSchema: { type: "object", properties: { src: { type: "string", title: "src", default: "" }, alt: { type: "string", title: "alt", default: "" } } },
        render: (p) => React7.createElement("img", { src: p.src, alt: p.alt })
      },
      Hero: {
        id: "Hero",
        displayName: "Hero",
        propsSchema: { type: "object", properties: { title: { type: "string", title: "title", default: "" } } },
        render: (p, _slots, runtime) => {
          const node = React7.createElement("h1", null, p.title ?? "");
          const presetArg = p.hoverPresetIds?.length ? p.hoverPresetIds : p.hoverPresetId;
          return applyHoverFlexible(node, presetArg, runtime?.api?.hoverPresets);
        }
      },
      TopNav: {
        id: "TopNav",
        displayName: "TopNav",
        propsSchema: { type: "object", properties: {} },
        render: () => React7.createElement("nav", null, "TopNav")
      },
      PrefList: {
        id: "PrefList",
        displayName: "PrefList",
        propsSchema: { type: "object", properties: {} },
        render: () => React7.createElement("aside", null, "PrefList")
      },
      // type helpers for slots
      Frame_Basic: {
        id: "Frame_Basic",
        displayName: "Frame Basic",
        propsSchema: { type: "object", properties: {} },
        slotSchema: [{ name: "header" }, { name: "sidebar" }, { name: "content", required: true }, { name: "footer" }],
        render: (_p, slots, _runtime) => React7.createElement(
          React7.Fragment,
          null,
          React7.createElement(SlotContainer, { slotId: "slot.header", as: "header" }, renderSlot(slots.header)),
          React7.createElement(SlotContainer, { slotId: "slot.sidebar", as: "aside" }, renderSlot(slots.sidebar)),
          React7.createElement(SlotContainer, { slotId: "slot.content", as: "main" }, renderSlot(slots.content)),
          React7.createElement(SlotContainer, { slotId: "slot.footer", as: "footer" }, renderSlot(slots.footer))
        )
      },
      Frame_Toponly: {
        id: "Frame_Toponly",
        displayName: "Frame TopOnly",
        propsSchema: { type: "object", properties: {} },
        slotSchema: [{ name: "header" }, { name: "content", required: true }],
        render: (_p, slots, _runtime) => React7.createElement(
          React7.Fragment,
          null,
          React7.createElement(SlotContainer, { slotId: "slot.header", as: "header" }, renderSlot(slots.header)),
          React7.createElement(SlotContainer, { slotId: "slot.content", as: "main" }, renderSlot(slots.content))
        )
      },
      Frame_Wide: {
        id: "Frame_Wide",
        displayName: "Frame Wide",
        propsSchema: { type: "object", properties: {} },
        slotSchema: [{ name: "content", required: true }, { name: "footer" }],
        render: (_p, slots, _runtime) => React7.createElement(
          React7.Fragment,
          null,
          React7.createElement(SlotContainer, { slotId: "slot.content", as: "main" }, renderSlot(slots.content)),
          React7.createElement(SlotContainer, { slotId: "slot.footer", as: "footer" }, renderSlot(slots.footer))
        )
      }
    };
    R = new Proxy(entries, { get: (t, p) => t[p]?.render ?? (() => React7.createElement("div", null, `Unknown:${p}`)) });
    index_default = R;
    entries.Text.propsSchema.properties = { ...entries.Text.propsSchema.properties, ...CommonHover };
    entries.Hero.propsSchema.properties = { ...entries.Hero.propsSchema.properties, ...CommonHover };
  }
});
init_index();
export {
  BacklinkList,
  GridSheet,
  GridSheetV2,
  NodeInspector,
  NodeInspectorV2,
  PublishSummary,
  R,
  RecoPanel,
  TraceGraph,
  TraceLegend,
  index_default as default,
  entries,
  getSchema,
  mergeHoverStyle
};
