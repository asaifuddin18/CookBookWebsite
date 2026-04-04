import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { extractRecipeFromContent } from '@/lib/recipeImport';

function stripHtml(html: string): string {
  return html
    .replace(/<(script|style|nav|footer|header|aside|noscript)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 15000);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { url } = await req.json() as { url: string };
  if (!url) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
  }

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RecipeImporter/1.0)' },
  });

  if (!res.ok) {
    return NextResponse.json({ error: `Could not fetch URL (${res.status})` }, { status: 400 });
  }

  const html = await res.text();
  const text = stripHtml(html);

  const recipe = await extractRecipeFromContent({ type: 'text', text });
  return NextResponse.json(recipe);
}
