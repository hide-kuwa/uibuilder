"use client";

// src/hooks/useLineage.ts
import useSWR from "swr";
var fetcher = (url) => fetch(url).then((r) => r.json());
function useLineage() {
  const { data, error, isLoading } = useSWR("/api/lineage", fetcher, {
    revalidateOnFocus: false
  });
  return { data, error, isLoading };
}
export {
  useLineage
};
