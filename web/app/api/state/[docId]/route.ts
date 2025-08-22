import { store } from '../../_docStore';

export async function GET(_req: Request, { params }: { params: { docId: string } }) {
  const entry = store[params.docId] || { rev: 0, state: {} };
  return Response.json({ rev: entry.rev, state: entry.state });
}
