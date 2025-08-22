export type VariantConfig = Record<string, Record<string, string>>

export function variants(cfg: VariantConfig) {
  return (opts: Record<string, string | undefined>) =>
    Object.entries(opts)
      .map(([k, v]) => (v && cfg[k] ? cfg[k][v] : ''))
      .join(' ')
}
