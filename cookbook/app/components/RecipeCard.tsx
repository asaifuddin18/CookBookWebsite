import Link from 'next/link';
import { Recipe } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <Link href={`/recipes/${recipe.recipeId}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle>{recipe.title}</CardTitle>
          <CardDescription>by {recipe.author}</CardDescription>
        </CardHeader>
        <CardContent>
          {recipe.description && (
            <p className="mb-4 line-clamp-2">{recipe.description}</p>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.difficulty && (
              <Badge variant="secondary">{recipe.difficulty}</Badge>
            )}
            {recipe.category && (
              <Badge variant="outline">{recipe.category}</Badge>
            )}
            {recipe.cuisine && (
              <Badge variant="outline">{recipe.cuisine}</Badge>
            )}
          </div>

          <div className="flex gap-4 text-sm text-muted-foreground">
            {recipe.prepTime && (
              <span>Prep: {recipe.prepTime} min</span>
            )}
            {recipe.cookTime && (
              <span>Cook: {recipe.cookTime} min</span>
            )}
            {totalTime > 0 && (
              <span className="font-semibold">Total: {totalTime} min</span>
            )}
            {recipe.servings && (
              <span>Serves: {recipe.servings}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
