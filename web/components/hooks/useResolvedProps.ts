"use client";
import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { callEndpoint, pickPath, type DataBinding } from "@data";
import type { ComponentNode } from "@domain-components";

export function useResolvedProps(node: ComponentNode) {
  const bindings = node.dataBindings ?? {};
  const entries = Object.entries(bindings) as [string, DataBinding][];

  const queries = entries
    .filter(([, b]) => b.type === "query")
    .map(([, b]) => b as Extract<DataBinding, { type: "query" }>);

  const results = useQueries({
    queries: queries.map((q) => ({
      queryKey: ["api", q.query.endpointId, q.query.params ?? {}],
      queryFn: () => callEndpoint(q.query.endpointId, { params: q.query.params }),
      staleTime: 30_000,
    })),
  });

  const resolved = useMemo(() => {
    const base = { ...node.props };
    let i = 0;
    for (const [propName, b] of entries) {
      if (b.type === "query") {
        const r = results[i++];
        const data = r.data;
        base[propName] = pickPath(data, b.query.select);
      }
    }
    return base;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(node.props), JSON.stringify(node.dataBindings), results.map(r => r.dataUpdatedAt).join(",")]);

  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);

  return { props: resolved, isLoading, isError };
}
