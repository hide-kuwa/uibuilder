import { NextResponse } from "next/server";
import { JournalInput } from "@schemas";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = JournalInput.safeParse(body);
  if (!parsed.success) {
    const msgs = parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`);
    return NextResponse.json({ ok: false, message: msgs.join("; ") }, { status: 400 });
  }
  const id = "j-" + Math.random().toString(36).slice(2, 8);
  return NextResponse.json({ ok: true, id, message: "保存しました" });
}
