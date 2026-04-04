export interface Ingredient {
  name: string;
  quantity: string;
  unit?: string;
  isHeader?: boolean;
}

export interface Recipe {
  recipeId: string;
  title: string;
  description?: string;
  author: string;
  authorEmail?: string;
  authorImage?: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  mealType?: Array<'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert' | 'Snack'>;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  cuisine?: 'American' | 'Indian' | 'Thai' | 'Italian' | 'Chinese' | 'Korean' | 'Mexican' | 'Japanese' | 'Other';
  imageUrl?: string;
  protein?: number;
  carbs?: number;
  fat?: number;
  createdAt: string;
  updatedAt: string;
}

export type RecipeInput = Omit<Recipe, 'recipeId' | 'createdAt' | 'updatedAt'>;
