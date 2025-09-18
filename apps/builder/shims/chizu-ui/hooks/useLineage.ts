import { useMemo } from "react";
export function useLineage() {
  // lineage未実装でも型エラーを避けるためのスタブ
  return useMemo(() => ({ current: null, trail: [] as string[], data: null as any }), []);
}
