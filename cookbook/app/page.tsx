export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="flex flex-col items-center justify-center px-6 py-20 text-center max-w-6xl mx-auto">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Welcome to Cookbook
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-16 max-w-2xl">
          Discover, share, and save your favorite recipes. Build your personal collection
          and explore dishes from around the world.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Share Your Recipes
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Upload your favorite recipes and share them with the community.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Discover New Dishes
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Browse and search through a collection of recipes from various cuisines.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">👨‍🍳</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
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
