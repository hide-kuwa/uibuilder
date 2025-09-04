"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { usePageStore } from '@/store/pageStore';
import { toast } from '@/lib/toast';
import ThemeEditor from '@/components/theme/ThemeEditor';
import { useDesignTokens } from '@/store/designTokensStore';
import type { ThemeTokens } from '@/lib/builder/themes/themeTokens';
import { saveDraft, loadDraft, clearDraft } from '@/lib/storage/drafts';
import { ViewportProvider, useViewport } from '@/components/canvas/ViewportStore';
import DevicePreviewFrame from '@/components/canvas/DevicePreviewFrame';
import GridOverlay from '@/components/canvas/GridOverlay';

function CanvasControls() {
  const { vp, toggle, setGrid, setDevice } = useViewport()

  const updateCols = (n: number) => setGrid(n, vp.gridGutter, vp.gridMaxWidth)
  const updateGutter = (n: number) => setGrid(vp.gridCols, n, vp.gridMaxWidth)
  const updateWidth = (n: number) => setGrid(vp.gridCols, vp.gridGutter, n)

  return (
    <div className="flex items-center gap-2">
      <select
        className="border rounded px-2 py-1 text-sm"
        value={vp.device}
        onChange={(e) => setDevice(e.target.value as any)}
      >
        <option value="mobile">Mobile</option>
        <option value="tablet">Tablet</option>
        <option value="desktop">Desktop</option>
      </select>
      <button
        onClick={() => toggle('showGrid')}
        className="border rounded px-2 py-1 text-sm"
      >
        {vp.showGrid ? 'Grid On' : 'Grid Off'}
      </button>
      <label className="text-sm">Cols</label>
      <select
        className="border rounded px-2 py-1 text-sm"
        value={vp.gridCols}
        onChange={(e) => updateCols(parseInt(e.target.value))}
      >
        {[4, 6, 12].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <label className="text-sm">Gutter</label>
      <select
        className="border rounded px-2 py-1 text-sm"
        value={vp.gridGutter}
        onChange={(e) => updateGutter(parseInt(e.target.value))}
      >
        {[8, 12, 16, 24].map((n) => (
          <option key={n} value={n}>
            {n}px
          </option>
        ))}
      </select>
      <label className="text-sm">Max</label>
      <select
        className="border rounded px-2 py-1 text-sm"
        value={vp.gridMaxWidth}
        onChange={(e) => updateWidth(parseInt(e.target.value))}
      >
        {[640, 768, 1024, 1280].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function PageEditor({ params }: { params: { id: string } }) {
  const router = useRouter();
  const selectPage = usePageStore((s) => s.selectPage);
  const setTheme = usePageStore((s) => s.setTheme);
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [status, setStatus] = useState<'saved' | 'saving' | 'offline'>('saved');
  const saveTimer = useRef<number>();

  useEffect(() => {
    selectPage(params.id);
  }, [params.id, selectPage]);

  const persistDraft = useCallback(async () => {
    const state = usePageStore.getState();
    const snapshot = {
      tree: state.getTree(),
      bindings: state.getBindings(),
      theme: state.getTheme(),
      tokens: useDesignTokens.getState().getAll(),
    };
    const record = { pageId: params.id, snapshot, updatedAt: Date.now() };
    if (navigator.onLine) {
      setStatus('saving');
      try {
        await fetch('/api/saveDraft', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
        await clearDraft(params.id);
        setStatus('saved');
      } catch {
        await saveDraft(record);
        setStatus('offline');
      }
    } else {
      await saveDraft(record);
      setStatus('offline');
    }
  }, [params.id]);

  useEffect(() => {
    const schedule = () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        persistDraft();
      }, 800);
    };
    const unsubPage = usePageStore.subscribe((s) => s.pages, schedule);
    const unsubTokens = useDesignTokens.subscribe((s) => s.tokens, schedule);
    return () => {
      unsubPage();
      unsubTokens();
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [persistDraft]);

  useEffect(() => {
    loadDraft(params.id).then((draft) => {
      if (draft && window.confirm('ドラフトを復元しますか？')) {
        const snap = draft.snapshot || {};
        const ps = usePageStore.getState();
        ps.setTree(snap.tree ?? []);
        ps.setBindings(snap.bindings ?? {});
        ps.setTheme(snap.theme ?? {});
        useDesignTokens.getState().replaceAll(snap.tokens ?? {});
        setStatus('offline');
      }
    });
  }, [params.id]);

  useEffect(() => {
    const sync = async () => {
      const draft = await loadDraft(params.id);
      if (draft) {
        await persistDraft();
      }
    };
    window.addEventListener('online', sync);
    return () => window.removeEventListener('online', sync);
  }, [persistDraft, params.id]);

  const tokensToTheme = (tokens: Record<string, any>): ThemeTokens => ({
    colors: {
      primary: tokens.color?.primary ?? '#1d4ed8',
      secondary: tokens.color?.accent ?? '#9333ea',
      background: tokens.color?.background ?? '#ffffff',
      surface: tokens.color?.surface ?? tokens.color?.border ?? '#f3f4f6',
      text: tokens.color?.text ?? '#111827',
    },
    radius: {
      sm: `${tokens.radius?.sm ?? 4}px`,
      md: `${tokens.radius?.md ?? 8}px`,
      lg: `${tokens.radius?.lg ?? 16}px`,
    },
    fontSize: {
      sm: `${tokens.fontSize?.sm ?? 0.875}rem`,
      base: `${tokens.fontSize?.base ?? 1}rem`,
      lg: `${tokens.fontSize?.lg ?? 1.125}rem`,
      xl: `${tokens.fontSize?.xl ?? 1.25}rem`,
    },
  });

  const handleThemeSave = () => {
    const tokens = useDesignTokens.getState().getAll();
    const theme = tokensToTheme(tokens);
    setTheme(theme);
    setShowThemeEditor(false);
  };

  const handlePublish = () => {
    const state = usePageStore.getState();
    const current = state.pages.find((p) => p.id === state.currentPageId);
    console.log('Publishing page', current);
    toast.success('保存しました');
  };

  return (
    <ViewportProvider>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Page Editor</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">
              {status === 'saving'
                ? 'Saving...'
                : status === 'offline'
                ? 'Offline • Draft'
                : 'Saved •'}
            </span>
            <div className="flex gap-2">
              <button onClick={handlePublish} className="px-3 py-2 rounded-lg border">
                Publish
              </button>
              <button
                onClick={() => router.push(`/builder/pages/${params.id}/preview`)}
                className="px-3 py-2 rounded-lg border"
              >
                Preview
              </button>
            </div>
            <CanvasControls />
          </div>
        </div>
      <p className="text-sm text-zinc-500">Editing page: {params.id}</p>
      <div className="relative border rounded overflow-hidden h-[400px]">
        <DevicePreviewFrame>
          <div className="absolute inset-0">
            <GridOverlay />
          </div>
        </DevicePreviewFrame>
      </div>
      <div>
        <h2 className="font-medium mb-1">Theme Override</h2>
        <button
          onClick={() => setShowThemeEditor(true)}
          className="px-3 py-2 rounded-lg border"
        >
          Edit Theme
        </button>
      </div>
      {showThemeEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded shadow-lg max-h-[90vh] w-full max-w-2xl overflow-auto">
            <ThemeEditor />
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() => setShowThemeEditor(false)}
                className="px-3 py-1 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={handleThemeSave}
                className="px-3 py-1 rounded bg-blue-600 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </ViewportProvider>
  );
}
