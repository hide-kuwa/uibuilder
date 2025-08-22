import { store } from '../_docStore';
import type { Envelope, ServerReply, Operation } from '@/types/sync';

export async function POST(req: Request) {
  const envelope: Envelope = await req.json();
  const doc = (store[envelope.docId] ||= { rev: 0, ops: [], state: {} });
  const serverOpsSince =
    envelope.lastAckRev < doc.rev ? doc.ops.slice(envelope.lastAckRev) : undefined;
  const accepted: string[] = [];
  envelope.ops.forEach((op: Operation) => {
    doc.ops.push(op);
    doc.rev++;
    accepted.push(op.id);
  });
  const reply: ServerReply = {
    headRev: doc.rev,
    accepted,
    serverOpsSince,
  };
  return Response.json(reply);
}
