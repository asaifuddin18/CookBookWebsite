export interface Ingredient {
  name: string;
  quantity: string;
  unit?: string;
}

export interface Recipe {
  recipeId: string;
  title: string;
  description?: string;
  author: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  category?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  cuisine?: 'American' | 'Indian' | 'Thai' | 'Italian' | 'Chinese' | 'Korean' | 'Mexican' | 'Other';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type RecipeInput = Omit<Recipe, 'recipeId' | 'createdAt' | 'updatedAt'>;
