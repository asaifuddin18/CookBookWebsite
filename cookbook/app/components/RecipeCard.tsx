import Link from 'next/link';
import { Recipe } from '@/lib/types';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <Link href={`/recipes/${recipe.recipeId}`}>
      <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          {recipe.title}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          by {recipe.author}
        </p>

        {recipe.description && (
          <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
            {recipe.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.difficulty && (
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
              {recipe.difficulty}
            </span>
          )}
          {recipe.category && (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
              {recipe.category}
            </span>
          )}
        </div>

        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
          {recipe.prepTime && (
            <span>Prep: {recipe.prepTime} min</span>
          )}
          {recipe.cookTime && (
            <span>Cook: {recipe.cookTime} min</span>
          )}
          {totalTime > 0 && (
            <span className="font-semibold">Total: {totalTime} min</span>
          )}
          {recipe.servings && (
            <span>Serves: {recipe.servings}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
