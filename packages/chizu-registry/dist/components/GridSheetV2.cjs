"use strict";
"use client";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/components/GridSheetV2.tsx
var GridSheetV2_exports = {};
__export(GridSheetV2_exports, {
  GridSheetV2: () => GridSheetV2
});
module.exports = __toCommonJS(GridSheetV2_exports);
var import_react = __toESM(require("react"), 1);
var import_jsx_runtime = require("react/jsx-runtime");
function toDateString(v) {
  if (!v) return "";
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
function GridSheetV2({ schema, rows: initRows }) {
  const [rows, setRows] = import_react.default.useState(
    (initRows ?? []).map((r) => {
      const nr = { ...r };
      for (const c of schema.columns) {
        if (c.type === "date" && nr[c.key] != null) nr[c.key] = toDateString(nr[c.key]);
      }
      return nr;
    })
  );
  const addRow = () => setRows((r) => [...r, Object.fromEntries(schema.columns.map((c) => [c.key, ""]))]);
  const delRow = (i) => setRows((r) => r.filter((_, idx) => idx !== i));
  const setCell = (i, key, value) => setRows((r) => r.map((row, idx) => idx === i ? { ...row, [key]: value } : row));
  const errors = import_react.default.useMemo(() => rows.map((row) => {
    const er = {};
    for (const col of schema.columns) {
      const v = row[col.key];
      if (col.required && (v === null || v === void 0 || v === "")) er[col.key] = "\u5FC5\u9808";
      if (col.type === "number" && v !== "" && Number.isNaN(Number(v))) er[col.key] = "\u6570\u5024\u3092\u5165\u529B";
    }
    return er;
  }), [rows, schema.columns]);
  const footerSum = {};
  (schema.footer?.sum ?? []).forEach((key) => {
    footerSum[key] = rows.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "text-sm", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { className: "min-w-full border border-gray-200", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { className: "bg-gray-50", children: [
        schema.columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-2 py-1 text-left border-b", children: c.label }, c.key)),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-2 py-1 text-left border-b w-20", children: "\u64CD\u4F5C" })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
        schema.columns.map((c) => {
          const err = errors[i]?.[c.key];
          const value = c.type === "date" ? toDateString(row[c.key]) : c.type === "number" ? row[c.key] ?? "" : row[c.key] ?? "";
          const inputType = c.type === "number" ? "number" : c.type === "date" ? "date" : "text";
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { className: "px-2 py-1 border-b align-top", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                className: `w-full border rounded px-1 py-0.5 ${err ? "border-red-400" : "border-gray-200"}`,
                value,
                type: inputType,
                onChange: (e) => setCell(i, c.key, inputType === "number" ? e.target.value : e.target.value)
              }
            ),
            err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-xs text-red-500 mt-0.5", children: err }) : null
          ] }, c.key);
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "px-2 py-1 border-b", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "underline", onClick: () => delRow(i), type: "button", children: "\u524A\u9664" }) })
      ] }, i)) }),
      schema.footer?.sum?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { className: "bg-gray-50", children: [
        schema.columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "px-2 py-1 border-t font-medium", children: schema.footer?.sum?.includes(c.key) ? footerSum[c.key] : "" }, c.key)),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "px-2 py-1 border-t" })
      ] }) }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-2", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "underline", onClick: addRow, type: "button", children: "\u884C\u3092\u8FFD\u52A0" }) })
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GridSheetV2
});
