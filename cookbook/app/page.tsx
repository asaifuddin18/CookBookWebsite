import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
          <Card>
            <CardHeader>
              <div className="text-4xl mb-2">📝</div>
              <CardTitle>Share Your Recipes</CardTitle>
              <CardDescription>
                Upload your favorite recipes and share them with the community.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="text-4xl mb-2">🔍</div>
              <CardTitle>Discover New Dishes</CardTitle>
              <CardDescription>
                Browse and search through a collection of recipes from various cuisines.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="text-4xl mb-2">👨‍🍳</div>
              <CardTitle>Easy to Follow</CardTitle>
              <CardDescription>
                Step-by-step instructions make cooking simple and enjoyable.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}
