import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRecipe } from '@/lib/dynamodb';

export const dynamic = 'force-dynamic';
import RecipeForm from '@/app/components/RecipeForm';
import { ArrowLeft } from 'lucide-react';

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) notFound();

  const initialRecipe = {
    title: recipe.title,
    description: recipe.description,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    servings: recipe.servings,
    mealType: recipe.mealType,
    difficulty: recipe.difficulty,
    cuisine: recipe.cuisine,
    overnight: recipe.overnight,
    imageUrl: recipe.imageUrl,
    protein: recipe.protein,
    carbs: recipe.carbs,
    fat: recipe.fat,
  };

  return (
    <div className="max-w-[680px] mx-auto px-5 lg:px-10 py-8 pb-16">
      <Link href={`/recipes/${recipe.recipeId}`} className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-copper transition-colors mb-6">
        <ArrowLeft size={14} />
        Back to recipe
      </Link>
      <h1 className="font-serif text-[32px] text-brown font-normal mb-1">Edit recipe</h1>
      <p className="text-[15px] text-text-muted mb-8">Update your recipe details</p>
      <RecipeForm recipeId={recipe.recipeId} initialRecipe={initialRecipe} />
    </div>
  );
}
