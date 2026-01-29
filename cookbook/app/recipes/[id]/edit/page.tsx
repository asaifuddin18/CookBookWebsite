import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRecipe } from '@/lib/dynamodb';
import RecipeForm from '@/app/components/RecipeForm';

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    notFound();
  }

  const initialRecipe = {
    title: recipe.title,
    description: recipe.description,
    author: recipe.author,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    servings: recipe.servings,
    mealType: recipe.mealType,
    difficulty: recipe.difficulty,
    cuisine: recipe.cuisine,
    tags: recipe.tags,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Edit Recipe
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update your recipe details
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <RecipeForm recipeId={recipe.recipeId} initialRecipe={initialRecipe} />
        </div>

        <div className="mt-6 text-center">
          <Link
            href={`/recipes/${recipe.recipeId}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Cancel and go back
          </Link>
        </div>
      </div>
    </div>
  );
}
