import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { getPresignedUploadUrl } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType } = await request.json();

    const ext = path.extname(filename) || '.jpg';
    const key = `images/${uuidv4()}${ext}`;

    const { uploadUrl, imageUrl } = await getPresignedUploadUrl(key, contentType);

    return NextResponse.json({ uploadUrl, imageUrl });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}
