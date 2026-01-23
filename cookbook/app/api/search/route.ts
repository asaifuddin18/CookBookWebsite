import { NextRequest, NextResponse } from 'next/server';
import { getAllRecipes } from '@/lib/dynamodb';
import { Recipe } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim() === '') {
      return NextResponse.json([], { status: 200 });
    }

    const allRecipes = await getAllRecipes();
    const searchTerm = query.toLowerCase().trim();

    const filteredRecipes = allRecipes.filter((recipe: Recipe) => {
      // Search in title
      if (recipe.title.toLowerCase().includes(searchTerm)) {
        return true;
      }

      // Search in description
      if (recipe.description && recipe.description.toLowerCase().includes(searchTerm)) {
        return true;
      }

      // Search in author
      if (recipe.author.toLowerCase().includes(searchTerm)) {
        return true;
      }

      // Search in category
      if (recipe.category && recipe.category.toLowerCase().includes(searchTerm)) {
        return true;
      }

      // Search in ingredients
      if (recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchTerm))) {
        return true;
      }

      // Search in tags
      if (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
        return true;
      }

      return false;
    });

    return NextResponse.json(filteredRecipes, { status: 200 });
  } catch (error) {
    console.error('Error searching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to search recipes' },
      { status: 500 }
    );
  }
}
