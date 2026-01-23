import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="flex flex-col items-center justify-center px-6 py-12 text-center max-w-4xl">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Welcome to Cookbook
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl">
          Discover, share, and save your favorite recipes. Build your personal collection
          and explore dishes from around the world.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            href="/recipes"
            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            View Recipes
          </Link>
          <Link
            href="/recipes/new"
            className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Add Recipe
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Share Your Recipes
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Upload your favorite recipes and share them with the community.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Discover New Dishes
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Browse through a collection of recipes from various cuisines.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Easy to Follow
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Step-by-step instructions make cooking simple and enjoyable.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
