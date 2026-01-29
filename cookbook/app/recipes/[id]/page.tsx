import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRecipe } from '@/lib/dynamodb';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    notFound();
  }

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/recipes"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Recipes
          </Link>

          <Button asChild>
            <Link href={`/recipes/${recipe.recipeId}/edit`}>Edit Recipe</Link>
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {recipe.title}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              by <span className="font-semibold">{recipe.author}</span>
            </p>
            {recipe.difficulty && (
              <Badge variant="secondary">{recipe.difficulty}</Badge>
            )}
            {recipe.mealType && recipe.mealType.map((type, index) => (
              <Badge key={index} variant="outline">{type}</Badge>
            ))}
            {recipe.cuisine && (
              <Badge variant="outline">{recipe.cuisine}</Badge>
            )}
          </div>

          {recipe.description && (
            <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
              {recipe.description}
            </p>
          )}

          <div className="flex flex-wrap gap-6 mb-8 pb-6 border-b dark:border-gray-700">
            {recipe.prepTime && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Prep Time</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {recipe.prepTime} min
                </p>
              </div>
            )}
            {recipe.cookTime && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cook Time</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {recipe.cookTime} min
                </p>
              </div>
            )}
            {totalTime > 0 && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Time</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {totalTime} min
                </p>
              </div>
            )}
            {recipe.servings && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Servings</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {recipe.servings}
                </p>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ingredients
            </h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li
                  key={index}
                  className="flex items-start text-gray-700 dark:text-gray-300"
                >
                  <span className="mr-2">•</span>
                  <span>
                    {ingredient.quantity} {ingredient.unit && `${ingredient.unit} `}
                    {ingredient.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Instructions
            </h2>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li
                  key={index}
                  className="flex gap-4 text-gray-700 dark:text-gray-300"
                >
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  <p className="flex-1 pt-1">{instruction}</p>
                </li>
              ))}
            </ol>
          </div>

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="pt-6 border-t dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            <p>Added on {new Date(recipe.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
