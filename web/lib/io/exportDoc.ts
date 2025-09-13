import { DOC_VERSION } from '@/lib/doc/version'

export type ExportPayload<TDoc=any, TThemes=any> = { version: number; doc: TDoc; themes?: TThemes }

export function buildExportPayload(doc: any, themes?: any): ExportPayload {
  return { version: DOC_VERSION, doc, themes }
}

export async function exportDocAsFile(opts?: { slug?: string; filename?: string }): Promise<void> {
  // Acquire doc/themes from runtime provider if available
  let doc: any = null
  let themes: any = undefined
  try {
    // @ts-expect-error runtime probing
    const io = (window as any).__io
    if (io?.getCurrentDoc) doc = await io.getCurrentDoc()
    if (io?.getCurrentThemes) themes = await io.getCurrentThemes()
  } catch {}
  if (!doc) throw new Error('exportDoc: no document provided by runtime')

  const payload = buildExportPayload(doc, themes)
  const json = JSON.stringify(payload, null, 2)
  const slug = opts?.filename ?? `${opts?.slug ?? (doc?.meta?.slug || 'document')}.v${payload.version}.json`
  const blob = new Blob([json], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = slug
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    URL.revokeObjectURL(a.href)
    a.remove()
  }, 0)
}

