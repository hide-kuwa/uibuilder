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
import "./chunk-NUDAQYSC.js";
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

// src/index.ts
var index_exports = {};
__export(index_exports, {
  BacklinkList: () => BacklinkList,
  GridSheet: () => GridSheet,
  GridSheetV2: () => GridSheetV2,
  NodeInspector: () => NodeInspector,
  R: () => R,
  default: () => index_default,
  entries: () => entries,
  getSchema: () => getSchema,
  mergeHoverStyle: () => mergeHoverStyle
});
import React3 from "react";
function renderSlot(content) {
  if (Array.isArray(content)) {
    return content.map((n, i) => React3.createElement("div", { key: i }, n));
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
  return React3.cloneElement(el, { ...props, style, onMouseEnter, onMouseLeave });
}
var CommonHover, entries, R, index_default;
var init_index = __esm({
  "src/index.ts"() {
    init_src();
    init_BacklinkList();
    init_NodeInspector();
    init_GridSheet();
    init_GridSheetV2();
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
          const node = React3.createElement("span", { style: { display: "inline-block" } }, p.text ?? "");
          const presetArg = p.hoverPresetIds?.length ? p.hoverPresetIds : p.hoverPresetId;
          return applyHoverFlexible(node, presetArg, runtime?.api?.hoverPresets);
        }
      },
      Image: {
        id: "Image",
        displayName: "Image",
        propsSchema: { type: "object", properties: { src: { type: "string", title: "src", default: "" }, alt: { type: "string", title: "alt", default: "" } } },
        render: (p) => React3.createElement("img", { src: p.src, alt: p.alt })
      },
      Hero: {
        id: "Hero",
        displayName: "Hero",
        propsSchema: { type: "object", properties: { title: { type: "string", title: "title", default: "" } } },
        render: (p, _slots, runtime) => {
          const node = React3.createElement("h1", null, p.title ?? "");
          const presetArg = p.hoverPresetIds?.length ? p.hoverPresetIds : p.hoverPresetId;
          return applyHoverFlexible(node, presetArg, runtime?.api?.hoverPresets);
        }
      },
      TopNav: {
        id: "TopNav",
        displayName: "TopNav",
        propsSchema: { type: "object", properties: {} },
        render: () => React3.createElement("nav", null, "TopNav")
      },
      PrefList: {
        id: "PrefList",
        displayName: "PrefList",
        propsSchema: { type: "object", properties: {} },
        render: () => React3.createElement("aside", null, "PrefList")
      },
      // type helpers for slots
      Frame_Basic: {
        id: "Frame_Basic",
        displayName: "Frame Basic",
        propsSchema: { type: "object", properties: {} },
        slotSchema: [{ name: "header" }, { name: "sidebar" }, { name: "content", required: true }, { name: "footer" }],
        render: (_p, slots, _runtime) => React3.createElement(
          React3.Fragment,
          null,
          React3.createElement("header", null, renderSlot(slots.header)),
          React3.createElement("aside", null, renderSlot(slots.sidebar)),
          React3.createElement("main", null, renderSlot(slots.content)),
          React3.createElement("footer", null, renderSlot(slots.footer))
        )
      },
      Frame_Toponly: {
        id: "Frame_Toponly",
        displayName: "Frame TopOnly",
        propsSchema: { type: "object", properties: {} },
        slotSchema: [{ name: "header" }, { name: "content", required: true }],
        render: (_p, slots, _runtime) => React3.createElement(
          React3.Fragment,
          null,
          React3.createElement("header", null, renderSlot(slots.header)),
          React3.createElement("main", null, renderSlot(slots.content))
        )
      },
      Frame_Wide: {
        id: "Frame_Wide",
        displayName: "Frame Wide",
        propsSchema: { type: "object", properties: {} },
        slotSchema: [{ name: "content", required: true }, { name: "footer" }],
        render: (_p, slots, _runtime) => React3.createElement(
          React3.Fragment,
          null,
          React3.createElement("main", null, renderSlot(slots.content)),
          React3.createElement("footer", null, renderSlot(slots.footer))
        )
      }
    };
    R = new Proxy(entries, { get: (t, p) => t[p]?.render ?? (() => React3.createElement("div", null, `Unknown:${p}`)) });
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
  R,
  index_default as default,
  entries,
  getSchema,
  mergeHoverStyle
};
