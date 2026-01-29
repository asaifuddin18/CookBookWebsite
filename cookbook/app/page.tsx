import Link from 'next/link';
import { getAllRecipes } from '@/lib/dynamodb';
import RecipeListPage from './components/RecipeListPage';
import { Recipe } from '@/lib/types';

export default async function Home() {
  let recipes: Recipe[] = [];
  let error = null;

  try {
    recipes = await getAllRecipes();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load recipes';
    recipes = [];
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              All Recipes
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Browse and search through our collection
            </p>
          </div>
          <Link
            href="/recipes/new"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New Recipe
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <RecipeListPage initialRecipes={recipes} />
      </div>
    </div>
  );
}
