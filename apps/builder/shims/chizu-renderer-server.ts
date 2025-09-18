// サーバー専用の最小シム（builderのコード生成/メタ表示を妨げない範囲）
export function generatePageCode(..._args: any[]) {
  // 両方の呼び出し形に対応（code/map と tsx/fileName）
  return { code: "// stub", map: null, tsx: "// stub", fileName: "page.stub.tsx" } as any;
}
// 以下は存在チェック向けno-op
export function applyHoverFlexible<T>(v: T, _opts?: any): T { return v; }
export function applyHover<T>(v: T, _opts?: any): T { return v; }
export function resolveBinding<T>(v: T, _ctx?: any): T { return v; }
export function Slot(_props: any) { return null; }
export function useFlowRuntime() { return { get: () => null }; }
