import Link from 'next/link';
import RecipeForm from '../../components/RecipeForm';

export default function NewRecipePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Add New Recipe
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share your favorite recipe with the community
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <RecipeForm />
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/recipes"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Recipes
          </Link>
        </div>
      </div>
    </div>
  );
}
