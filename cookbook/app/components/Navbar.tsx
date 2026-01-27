'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ThemeToggle from './ThemeToggle';

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
              <Button variant="ghost" asChild>
                <Link href="/recipes">View Recipes</Link>
              </Button>
              <Button asChild>
                <Link href="/recipes/new">Add Recipe</Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes..."
                className="w-48 sm:w-64"
              />
              <Button type="submit">Search</Button>
            </form>
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden flex gap-2 pb-3">
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/recipes">View Recipes</Link>
          </Button>
          <Button className="flex-1" asChild>
            <Link href="/recipes/new">Add Recipe</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
