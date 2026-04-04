import { NextRequest, NextResponse } from 'next/server';
import { getRecipe, updateRecipe, deleteRecipe } from '@/lib/dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { recipeSchema } from '@/lib/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recipe = await getRecipe(id);

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(recipe, { status: 200 });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const validationResult = recipeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const existingRecipe = await getRecipe(id);
    if (!existingRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    if (existingRecipe.authorEmail && existingRecipe.authorEmail !== session.user?.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { author, authorEmail, authorImage, ...updateData } = validationResult.data as typeof validationResult.data & { author?: string; authorEmail?: string; authorImage?: string };
    void author; void authorEmail; void authorImage;
    const updatedRecipe = await updateRecipe(id, updateData);
    return NextResponse.json(updatedRecipe, { status: 200 });
  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existing = await getRecipe(id);
    if (!existing) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    if (existing.authorEmail && existing.authorEmail !== session.user?.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await deleteRecipe(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json({ error: 'Failed to delete recipe' }, { status: 500 });
  }
}
