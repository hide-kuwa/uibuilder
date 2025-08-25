import { NextResponse } from "next/server";

export async function POST(_req: Request, { params }: { params: { key: string } }) {
  return NextResponse.json({ result: { decision: params.key, ok: true }, trace: [] });
}
