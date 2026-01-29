import { NextRequest, NextResponse } from 'next/server';
import { getAllRecipes } from '@/lib/dynamodb';
import { Recipe } from '@/lib/types';

/**
 * Search algorithm.
 * @param request - web request
 * @returns - list of matching recipes
 */
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
      if (searchTerm.includes(recipe.title.toLowerCase())) {
        return true;
      }

      // Search in description
      if (recipe.description && searchTerm.includes(recipe.description.toLocaleLowerCase())) {
        return true;
      }

      // Search in author
      if (searchTerm.includes(recipe.author.toLocaleLowerCase())) {
        return true;
      }
      
      // Search in Meal Type
      if (recipe.mealType?.some(meal =>searchTerm.includes(meal.toLocaleLowerCase()))) {
        return true;
      }

      // Search in ingredients
      if (recipe.ingredients.some(ing => searchTerm.includes(ing.name.toLowerCase()))) {
        return true;
      }

      // Search in tags
      if (recipe.tags && recipe.tags.some(tag => searchTerm.includes(tag.toLocaleLowerCase()))) {
        return true;
      }

      // Search in Cuisine
      if (recipe.cuisine && searchTerm.includes(recipe.cuisine.toLocaleLowerCase())) {
        return true;
      }

      // Search in Difficulty
      if (recipe.difficulty && searchTerm.includes(recipe.difficulty.toLocaleLowerCase())) {
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
