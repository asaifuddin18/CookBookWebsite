import { z } from 'zod';

export const ingredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required'),
  quantity: z.string().min(1, 'Quantity is required'),
  unit: z.string().optional(),
});

export const recipeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  author: z.string().max(50).optional(),
  ingredients: z.array(ingredientSchema).min(1, 'At least one ingredient is required'),
  instructions: z.array(z.string().min(1, 'Instruction cannot be empty')).min(1, 'At least one instruction is required'),
  prepTime: z.number().min(0, 'Prep time cannot be negative').optional(),
  cookTime: z.number().min(0, 'Cook time cannot be negative').optional(),
  servings: z.number().min(1, 'Servings must be at least 1').optional(),
  mealType: z.array(z.enum(['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack'])).optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  cuisine: z.enum(['American', 'Indian', 'Thai', 'Italian', 'Chinese', 'Korean', 'Mexican', 'Japanese', 'Other']).optional(),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional(),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
});

export type RecipeFormData = z.infer<typeof recipeSchema>;
