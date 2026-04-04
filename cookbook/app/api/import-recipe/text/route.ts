import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { extractRecipeFromContent } from '@/lib/recipeImport';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { text, instructions } = await req.json() as { text: string; instructions?: string };
  if (!text?.trim()) {
    return NextResponse.json({ error: 'No text provided' }, { status: 400 });
  }

  const recipe = await extractRecipeFromContent({ type: 'text', text: text.slice(0, 15000) }, instructions);
  return NextResponse.json(recipe);
}
