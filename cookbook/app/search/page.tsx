import Link from 'next/link';
import RecipeList from '../components/RecipeList';
import { Recipe } from '@/lib/types';

async function searchRecipes(query: string): Promise<Recipe[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/search?q=${encodeURIComponent(query)}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch search results');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching search results:', error);
    return [];
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  const recipes = query ? await searchRecipes(query) : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Search Results
          </h1>
          {query && (
            <p className="text-gray-600 dark:text-gray-400">
              Showing results for: <span className="font-semibold">&quot;{query}&quot;</span>
            </p>
          )}
          {!query && (
            <p className="text-gray-600 dark:text-gray-400">
              Enter a search term to find recipes
            </p>
          )}
        </div>

        {query && recipes.length > 0 && (
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            Found {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
          </p>
        )}

        {query && recipes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              No recipes found for &quot;{query}&quot;
            </p>
            <Link
              href="/recipes"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Browse all recipes
            </Link>
          </div>
        )}

        {query && recipes.length > 0 && <RecipeList recipes={recipes} />}

        <div className="mt-8 text-center">
          <Link
            href="/recipes"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            View All Recipes
          </Link>
        </div>
      </div>
    </div>
  );
}
