import {
  __esm
} from "./chunk-2ESYSVXG.js";

// src/components/GridSheet.tsx
import React from "react";
import { jsx, jsxs } from "react/jsx-runtime";
function cast(v, type) {
  if (v == null) return v;
  if (type === "number") return typeof v === "number" ? v : Number(v);
  if (type === "date") return v instanceof Date ? v : new Date(v);
  return String(v);
}
function GridSheet({ schema, rows: initRows }) {
  const [rows, setRows] = React.useState(initRows ?? []);
  const addRow = () => setRows((r) => [...r, Object.fromEntries(schema.columns.map((c) => [c.key, null]))]);
  const delRow = (i) => setRows((r) => r.filter((_, idx) => idx !== i));
  const setCell = (i, key, value) => setRows((r) => r.map((row, idx) => idx === i ? { ...row, [key]: value } : row));
  const errors = React.useMemo(() => {
    return rows.map((row) => {
      const er = {};
      for (const col of schema.columns) {
        const v = row[col.key];
        if (col.required && (v === null || v === void 0 || v === "")) er[col.key] = "\u5FC5\u9808";
        if (col.type === "number" && v != null && Number.isNaN(Number(v))) er[col.key] = "\u6570\u5024\u3092\u5165\u529B";
      }
      return er;
    });
  }, [rows, schema.columns]);
  const footerSum = {};
  (schema.footer?.sum ?? []).forEach((key) => {
    footerSum[key] = rows.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
  });
  return /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
    /* @__PURE__ */ jsxs("table", { className: "min-w-full border border-gray-200", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-gray-50", children: [
        schema.columns.map((c) => /* @__PURE__ */ jsx("th", { className: "px-2 py-1 text-left border-b", children: c.label }, c.key)),
        /* @__PURE__ */ jsx("th", { className: "px-2 py-1 text-left border-b w-20", children: "\u64CD\u4F5C" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: rows.map((row, i) => /* @__PURE__ */ jsxs("tr", { children: [
        schema.columns.map((c) => {
          const err = errors[i]?.[c.key];
          return /* @__PURE__ */ jsxs("td", { className: "px-2 py-1 border-b align-top", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                className: `w-full border rounded px-1 py-0.5 ${err ? "border-red-400" : "border-gray-200"}`,
                value: row[c.key] ?? "",
                type: c.type === "number" ? "number" : c.type === "date" ? "date" : "text",
                onChange: (e) => setCell(i, c.key, cast(e.target.value, c.type))
              }
            ),
            err ? /* @__PURE__ */ jsx("div", { className: "text-xs text-red-500 mt-0.5", children: err }) : null
          ] }, c.key);
        }),
        /* @__PURE__ */ jsx("td", { className: "px-2 py-1 border-b", children: /* @__PURE__ */ jsx("button", { className: "underline", onClick: () => delRow(i), type: "button", children: "\u524A\u9664" }) })
      ] }, i)) }),
      schema.footer?.sum?.length ? /* @__PURE__ */ jsx("tfoot", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-gray-50", children: [
        schema.columns.map((c) => /* @__PURE__ */ jsx("td", { className: "px-2 py-1 border-t font-medium", children: schema.footer?.sum?.includes(c.key) ? footerSum[c.key] : "" }, c.key)),
        /* @__PURE__ */ jsx("td", { className: "px-2 py-1 border-t" })
      ] }) }) : null
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsx("button", { className: "underline", onClick: addRow, type: "button", children: "\u884C\u3092\u8FFD\u52A0" }) })
  ] });
}
var init_GridSheet = __esm({
  "src/components/GridSheet.tsx"() {
  }
});

export {
  GridSheet,
  init_GridSheet
};
