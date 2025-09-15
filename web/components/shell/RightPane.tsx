'use client';
import { RIGHT_PANE_DEFAULT_WIDTH } from '@/lib/layout/constants';
import { useEffect, useRef, useState } from 'react';
import CopyCssButton from '@/components/actions/CopyCssButton'
import ExportImportButtons from '@/components/actions/ExportImportButtons'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { useRovingFocus } from '@/hooks/useRovingFocus'
import { t } from '@/lib/i18n/i18n'
import ShadowsPanel from '@/components/panels/ShadowsPanel'
import GradientPanel from '@/components/panels/GradientPanel'
import BulkStylePanel from '@/components/panels/BulkStylePanel'
import ThemeGallery from '@/components/panels/ThemeGallery'
import { useLocalStorageState } from '@/hooks/useLocalStorageState'

interface Section {
  id: string;
  title: string;
  content: JSX.Element;
}

function getInitialShadows(): any[] {
  try {
    // @ts-expect-error runtime provider from SelectionCssBridge
    const provider = (window as any).__selectionCssProvider as undefined | (() => { shadows?: any[] }[])
    const styles = provider?.() || []
    const list = styles.map(s => s.shadows).filter(Boolean) as any[]
    if (!list.length) return []
    const first = JSON.stringify(list[0])
    if (list.every(l => JSON.stringify(l) === first)) return list[0]
    return [] // mixed
  } catch { return [] }
}

function getInitialGradient(): any | null {
  try {
    // @ts-expect-error runtime provider from SelectionCssBridge
    const provider = (window as any).__selectionCssProvider as undefined | (() => { fill?: any }[])
    const styles = provider?.() || []
    const list = styles.map(s => s.fill).filter(Boolean) as any[]
    if (!list.length) return null
    const first = JSON.stringify(list[0])
    if (list.every(l => JSON.stringify(l) === first)) return list[0]
    return null
  } catch { return null }
}

const SECTIONS: Section[] = [
  { id: 'layout', title: t('layout'), content: <p>Layout content</p> },
  { id: 'theme', title: t('theme'), content: (
    <div className="space-y-3">
      <ThemeGallery />
    </div>
  ) },
  { id: 'style', title: t('style'), content: (
    <div className="space-y-3">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">{t('bulkEdit')}</h3>
        <BulkStylePanel />
      </div>
      <GradientPanel
        initial={getInitialGradient()}
        onApply={(g)=>{
          try {
            // @ts-expect-error runtime
            (window as any).__mut?.applyStyle?.({ fill: g })
          } catch {}
        }}
      />
      <ShadowsPanel
        initial={getInitialShadows()}
        onApply={(shadows)=>{
          try {
            // @ts-expect-error runtime
            (window as any).__mut?.applyStyle?.({ shadows })
          } catch {}
        }}
      />
    </div>
  ) },
  { id: 'code', title: 'Code', content: <p>Code content</p> },
];

export default function RightPane() {
  const [open, setOpen] = useLocalStorageState<Record<string, boolean>>('rp:sections', {})
  const onCopied = () => {
    try {
      // shadcn/ui style toast if present
      // @ts-expect-error runtime probing
      const toast = (globalThis as any)?.useToast?.().toast as undefined | ((opts: { title?: string; description?: string }) => void)
      if (toast) { toast({ title: 'CSS copied', description: 'Selection styles were copied.' }); return }
    } catch {}
    try {
      // Global toast fallback
      // @ts-expect-error runtime probing
      const t = (window as any).__toast as undefined | ((msg: string) => void)
      if (t) { t('CSS copied'); return }
    } catch {}
    // Last resort
    try { console.info('[Copy CSS] copied') } catch {}
  }

  useEffect(() => { /* persisted by hook */ }, [open])

  const tools = 3
  const { refs, onKeyDown } = useRovingFocus(tools)

  return (
    <ErrorBoundary>
      <aside aria-label={t('rightPanel')} className="flex flex-col h-full bg-gray-800 text-white" style={{ width: RIGHT_PANE_DEFAULT_WIDTH }}>
        <div className="flex items-center justify-end gap-2 p-2 border-b border-gray-700" role="toolbar" aria-label={t('styleTools')} onKeyDown={onKeyDown}>
          <ExportImportButtons ariaLabelExport={t('export')} ariaLabelImport={t('import')} exportRef={el => refs.current[0] = el} importRef={el => refs.current[1] = el} />
          <CopyCssButton ref={el => refs.current[2] = el} onCopied={onCopied} ariaLabel={t('copyCss')} />
        </div>
        <div className="flex-1 overflow-auto text-sm">
          {SECTIONS.map((sec) => (
            <Accordion
              key={sec.id}
              title={sec.title}
              open={open[sec.id] ?? true}
              onToggle={() =>
                setOpen((s) => ({ ...s, [sec.id]: !(s[sec.id] ?? true) }))
              }
            >
              {sec.content}
            </Accordion>
          ))}
        </div>
      </aside>
    </ErrorBoundary>
  );
}

interface AccordionProps {
  title: string;
  open: boolean;
  onToggle(): void;
  children: React.ReactNode;
}

function Accordion({ title, open, onToggle, children }: AccordionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const update = () => setHeight(ref.current!.scrollHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const contentId = `sec-${title.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <section className="border-b border-gray-700">
      <button
        className="w-full text-left px-2 py-1 hover:bg-gray-700 transition-colors"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={contentId}
        role="button"
      >
        {title}
      </button>
      <div
        id={contentId}
        style={{
          maxHeight: open ? height : 0,
          opacity: open ? 1 : 0,
          transition: `max-height var(--motion-base) var(--easing-standard), opacity var(--motion-base) var(--easing-standard)`
        }}
        className="overflow-hidden"
      >
        <div ref={ref} className="p-2">
          {children}
        </div>
      </div>
    </section>
  );
}
