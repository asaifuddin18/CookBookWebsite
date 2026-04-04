import { Recipe } from '@/lib/types';
import RecipeCard from './RecipeCard';

interface RecipeListProps {
  recipes: Recipe[];
  favorites: Set<string>;
  onToggleFavorite: (recipeId: string) => void;
}

export default function RecipeList({ recipes, favorites, onToggleFavorite }: RecipeListProps) {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-5xl mb-4">🍽️</p>
        <p className="font-serif text-xl text-brown mb-2">No recipes found</p>
        <p className="text-sm text-text-muted">Try a different search or be the first to add one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.recipeId}
          recipe={recipe}
          isFavorited={favorites.has(recipe.recipeId)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
