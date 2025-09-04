"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePageStore } from '@/store/pageStore';
import { toast } from '@/lib/toast';

export default function PageEditor({ params }: { params: { id: string } }) {
  const router = useRouter();
  const selectPage = usePageStore((s) => s.selectPage);
  const page = usePageStore((s) => s.pages.find((p) => p.id === s.currentPageId));
  const theme = usePageStore((s) => s.getTheme());
  const setTheme = usePageStore((s) => s.setTheme);
  const [themeJson, setThemeJson] = useState(() => JSON.stringify(theme, null, 2));

  useEffect(() => {
    selectPage(params.id);
  }, [params.id, selectPage]);

  useEffect(() => {
    setThemeJson(JSON.stringify(theme, null, 2));
  }, [theme]);

  const handleThemeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setThemeJson(e.target.value);
    try {
      const obj = JSON.parse(e.target.value);
      setTheme(obj);
    } catch {
      // ignore invalid JSON
    }
  };

  const handlePublish = () => {
    console.log('Publishing page', { page });
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
        <textarea
          value={themeJson}
          onChange={handleThemeChange}
          className="w-full border rounded p-2 h-40 font-mono text-xs"
        />
      </div>
    </div>
  );
}
