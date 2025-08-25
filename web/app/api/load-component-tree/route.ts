import { NextResponse } from "next/server";
import path from "path";
import { parseComponentTreeFromFile } from "../../../../scripts/parseComponentTree";

export async function GET() {
  const filePath = path.resolve(process.cwd(), "../components/page.tsx");
  const tree = parseComponentTreeFromFile(filePath);
  return NextResponse.json({ tree });
}
