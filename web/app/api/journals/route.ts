import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ data: [{ id: "j1", title: "\u73fe\u91d1\u58f2\u4e0a(\u4eee)" }, { id: "j2", title: "\u65c5\u8cbb\u4ea4\u901a\u8cbb(\u4eee)" }] });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({ ok: true, id: "new-" + (body?.title || "x") });
}
