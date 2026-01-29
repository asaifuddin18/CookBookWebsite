'use client';

import { useState, useEffect } from 'react';
import { Recipe } from '@/lib/types';
import RecipeList from './RecipeList';
import { useSearch } from './SearchProvider';

interface RecipeListPageProps {
  initialRecipes: Recipe[];
}

export default function RecipeListPage({ initialRecipes }: RecipeListPageProps) {
  const { searchQuery } = useSearch();
  const [filteredRecipes, setFilteredRecipes] = useState(initialRecipes);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRecipes(initialRecipes);
      return;
    }

    const searchTerm = searchQuery.toLowerCase().trim();
    const filtered = initialRecipes.filter((recipe) => {
      // Search in title
      if (recipe.title.toLowerCase().includes(searchTerm)) return true;
      // Search in description
      if (recipe.description?.toLowerCase().includes(searchTerm)) return true;
      // Search in author
      if (recipe.author.toLowerCase().includes(searchTerm)) return true;
      // Search in mealType
      if (recipe.mealType?.some(meal => meal.toLowerCase().includes(searchTerm))) return true;
      // Search in ingredients
      if (recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchTerm))) return true;
      // Search in tags
      if (recipe.tags?.some(tag => tag.toLowerCase().includes(searchTerm))) return true;
      // Search in cuisine
      if (recipe.cuisine?.toLowerCase().includes(searchTerm)) return true;
      // Search in difficulty
      if (recipe.difficulty?.toLowerCase().includes(searchTerm)) return true;

      return false;
    });

    setFilteredRecipes(filtered);
  }, [searchQuery, initialRecipes]);

  return (
    <div>
      {searchQuery && (
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          {filteredRecipes.length > 0
            ? `Found ${filteredRecipes.length} ${filteredRecipes.length === 1 ? 'recipe' : 'recipes'} for "${searchQuery}"`
            : `No recipes found for "${searchQuery}"`
          }
        </p>
      )}
      <RecipeList recipes={filteredRecipes} />
    </div>
  );
}
