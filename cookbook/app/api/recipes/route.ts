import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getAllRecipes, putRecipe } from '@/lib/dynamodb';
import { recipeSchema } from '@/lib/validation';
import { Recipe } from '@/lib/types';

export async function GET() {
  try {
    const recipes = await getAllRecipes();
    return NextResponse.json(recipes, { status: 200 });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const now = new Date().toISOString();
    const recipe: Recipe = {
      recipeId: uuidv4(),
      ...validationResult.data,
      createdAt: now,
      updatedAt: now,
    };

    await putRecipe(recipe);

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  }
}
