import { NextRequest, NextResponse } from "next/server";
import { generateCodeFromTree } from "../../../../scripts/generateCodeFromTree";
import path from "path";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const tree = body.tree;
  const outPath = path.resolve(process.cwd(), "../components/generated/page.tsx");
  generateCodeFromTree(tree, outPath);
  return NextResponse.json({ ok: true, path: outPath });
}
