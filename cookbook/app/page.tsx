import { getAllRecipes } from '@/lib/dynamodb';
import RecipeListPage from './components/RecipeListPage';
import { Recipe } from '@/lib/types';

export default async function Home() {
  let recipes: Recipe[] = [];

  try {
    recipes = await getAllRecipes();
  } catch {
    recipes = [];
  }

  return <RecipeListPage initialRecipes={recipes} />;
}
