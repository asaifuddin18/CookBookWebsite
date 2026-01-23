'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md border-b dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Cookbook
            </Link>
            <div className="hidden md:flex gap-4">
              <Link
                href="/recipes"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                View Recipes
              </Link>
              <Link
                href="/recipes/new"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Add Recipe
              </Link>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes..."
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-48 sm:w-64"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Search
            </button>
          </form>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden flex gap-2 pb-3">
          <Link
            href="/recipes"
            className="flex-1 px-4 py-2 text-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors border border-gray-300 dark:border-gray-700 rounded-lg"
          >
            View Recipes
          </Link>
          <Link
            href="/recipes/new"
            className="flex-1 px-4 py-2 text-center bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Add Recipe
          </Link>
        </div>
      </div>
    </nav>
  );
}
