"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePageStore } from '@/store/pageStore';
import { toast } from '@/lib/toast';
import ThemeEditor from '@/components/theme/ThemeEditor';
import { useDesignTokens } from '@/store/designTokensStore';
import type { ThemeTokens } from '@/lib/builder/themes/themeTokens';

export default function PageEditor({ params }: { params: { id: string } }) {
  const router = useRouter();
  const selectPage = usePageStore((s) => s.selectPage);
  const setTheme = usePageStore((s) => s.setTheme);
  const [showThemeEditor, setShowThemeEditor] = useState(false);

  useEffect(() => {
    selectPage(params.id);
  }, [params.id, selectPage]);

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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Page Editor</h1>
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
      </div>
      <p className="text-sm text-zinc-500">Editing page: {params.id}</p>
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
  );
}
