import { z } from 'zod';

export const ingredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required'),
  quantity: z.string().min(1, 'Quantity is required'),
  unit: z.string().optional(),
});

export const recipeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  author: z.string().min(1, 'Author is required').max(50, 'Author name must be less than 50 characters'),
  ingredients: z.array(ingredientSchema).min(1, 'At least one ingredient is required'),
  instructions: z.array(z.string().min(1, 'Instruction cannot be empty')).min(1, 'At least one instruction is required'),
  prepTime: z.number().min(0, 'Prep time cannot be negative').optional(),
  cookTime: z.number().min(0, 'Cook time cannot be negative').optional(),
  servings: z.number().min(1, 'Servings must be at least 1').optional(),
  category: z.string().optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  cuisine: z.enum(['American', 'Indian', 'Thai', 'Italian', 'Chinese', 'Korean', 'Mexican', 'Other']).optional(),
  tags: z.array(z.string()).optional(),
});

export type RecipeFormData = z.infer<typeof recipeSchema>;
