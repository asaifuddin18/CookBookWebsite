import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { extractRecipeFromContent } from '@/lib/recipeImport';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { imageBase64, mediaType } = await req.json() as { imageBase64: string; mediaType: string };
  if (!imageBase64) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 });
  }

  const recipe = await extractRecipeFromContent({ type: 'image', base64: imageBase64, mediaType: mediaType || 'image/jpeg' });
  return NextResponse.json(recipe);
}
