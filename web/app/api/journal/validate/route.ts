import { NextResponse } from "next/server";
import { JournalInput } from "@schemas";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = JournalInput.safeParse(body);
  if (!parsed.success) {
    const msgs = parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`);
    return NextResponse.json({ ok: false, issues: msgs }, { status: 400 });
  }
  return NextResponse.json({ ok: true, issues: [] });
}
