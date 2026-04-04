import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getFavorites } from '@/lib/dynamodb';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ favorites: [] });
  }
  const favorites = await getFavorites(session.user.email);
  return NextResponse.json({ favorites });
}
