import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { addFavorite, removeFavorite } from '@/lib/dynamodb';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ recipeId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { recipeId } = await params;
  await addFavorite(session.user.email, recipeId);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ recipeId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { recipeId } = await params;
  await removeFavorite(session.user.email, recipeId);
  return NextResponse.json({ ok: true });
}
