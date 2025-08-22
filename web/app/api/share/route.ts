import { NextResponse } from 'next/server';
import { save, load } from '@/lib/shareStore';

export async function POST(req: Request) {
  const data = await req.json();
  const id = save(data);
  return NextResponse.json({ id });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const data = load(id);
  if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(data);
}
