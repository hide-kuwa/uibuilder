'use client';
import { RIGHT_PANE_DEFAULT_WIDTH } from '@/lib/layout/constants';
import { loadLayout, saveLayout } from '@/lib/layout/persist';
import { useEffect, useRef, useState } from 'react';
import CopyCssButton from '@/components/actions/CopyCssButton'
import ErrorBoundary from '@/components/common/ErrorBoundary'

interface Section {
  id: string;
  title: string;
  content: JSX.Element;
}

const SECTIONS: Section[] = [
  { id: 'layout', title: 'Layout', content: <p>Layout content</p> },
  { id: 'style', title: 'Style', content: <p>Style content</p> },
  { id: 'code', title: 'Code', content: <p>Code content</p> },
];

export default function RightPane() {
  const persisted = loadLayout().rightSections || {};
  const [open, setOpen] = useState<Record<string, boolean>>({ ...persisted });
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

  useEffect(() => {
    saveLayout({ rightSections: open });
  }, [open]);

  return (
    <ErrorBoundary>
      <div
        className="flex flex-col h-full bg-gray-800 text-white"
        style={{ width: RIGHT_PANE_DEFAULT_WIDTH }}
      >
        <div className="flex items-center justify-end gap-2 p-2 border-b border-gray-700">
          <CopyCssButton onCopied={onCopied} />
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
      </div>
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

  return (
    <section className="border-b border-gray-700">
      <button
        className="w-full text-left px-2 py-1 hover:bg-gray-700 transition-colors"
        onClick={onToggle}
      >
        {title}
      </button>
      <div
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
