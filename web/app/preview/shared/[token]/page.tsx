import { notFound } from 'next/navigation';
import { getPreviewToken } from '@/lib/previewTokenStore';
import { readFile } from 'fs/promises';
import path from 'path';
import TokenStyle from '@/components/theme/TokenStyle';
import { NodeRendererCompat } from '@/components/NodeRendererCompat';

export const dynamic = 'force-dynamic';

export default async function PreviewSharedPage({ params }: { params: { token: string } }) {
  const info = getPreviewToken(params.token);
  if (!info) notFound();

  try {
    const filePath = path.join(process.cwd(), 'data/pages', `${info.pageId}.json`);
    const json = await readFile(filePath, 'utf8');
    const page = JSON.parse(json);
    const elements = Array.isArray(page?.tree) ? page.tree : [];
    const roots = elements.filter((e: any) => !e.parentId);
    return (
      <>
        <TokenStyle />
        <div className="w-full h-screen relative bg-black">
          {roots.map((n: any) => (
            <NodeRendererCompat key={String(n.id)} node={n} />
          ))}
        </div>
      </>
    );
  } catch {
    notFound();
  }
}
