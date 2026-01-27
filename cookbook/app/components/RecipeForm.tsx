'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ingredient } from '@/lib/types';

interface RecipeFormProps {
  recipeId?: string;
  initialRecipe?: {
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
    tags?: string[];
  };
}

export default function RecipeForm({ recipeId, initialRecipe }: RecipeFormProps = {}) {
  const router = useRouter();
  const isEditMode = !!recipeId;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialRecipe?.title || '');
  const [description, setDescription] = useState(initialRecipe?.description || '');
  const [author, setAuthor] = useState(initialRecipe?.author || '');
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialRecipe?.ingredients || [{ name: '', quantity: '', unit: '' }]
  );
  const [instructions, setInstructions] = useState<string[]>(
    initialRecipe?.instructions || ['']
  );
  const [prepTime, setPrepTime] = useState<number | ''>(initialRecipe?.prepTime || '');
  const [cookTime, setCookTime] = useState<number | ''>(initialRecipe?.cookTime || '');
  const [servings, setServings] = useState<number | ''>(initialRecipe?.servings || '');
  const [category, setCategory] = useState(initialRecipe?.category || '');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | ''>(
    initialRecipe?.difficulty || ''
  );
  const [tags, setTags] = useState(
    initialRecipe?.tags ? initialRecipe.tags.join(', ') : ''
  );

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== index));
    }
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const recipeData = {
        title,
        description: description || undefined,
        author,
        ingredients: ingredients.filter(ing => ing.name && ing.quantity),
        instructions: instructions.filter(inst => inst.trim()),
        prepTime: prepTime || undefined,
        cookTime: cookTime || undefined,
        servings: servings || undefined,
        category: category || undefined,
        difficulty: difficulty || undefined,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : undefined,
      };

      const url = isEditMode ? `/api/recipes/${recipeId}` : '/api/recipes';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditMode ? 'update' : 'create'} recipe`);
      }

      const redirectPath = isEditMode ? `/recipes/${recipeId}` : '/recipes';
      router.push(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Recipe Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Chocolate Chip Cookies"
        />
      </div>

      <div>
        <label htmlFor="author" className="block text-sm font-medium mb-2">
          Author *
        </label>
        <input
          type="text"
          id="author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Brief description of your recipe"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Ingredients *</label>
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={ingredient.name}
              onChange={(e) => updateIngredient(index, 'name', e.target.value)}
              placeholder="Ingredient name"
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={ingredient.quantity}
              onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
              placeholder="Quantity"
              className="w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={ingredient.unit || ''}
              onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
              placeholder="Unit"
              className="w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => removeIngredient(index)}
              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addIngredient}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Add Ingredient
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Instructions *</label>
        {instructions.map((instruction, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <textarea
              value={instruction}
              onChange={(e) => updateInstruction(index, e.target.value)}
              placeholder={`Step ${index + 1}`}
              rows={2}
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => removeInstruction(index)}
              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addInstruction}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Add Instruction
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="prepTime" className="block text-sm font-medium mb-2">
            Prep Time (minutes)
          </label>
          <input
            type="number"
            id="prepTime"
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value ? parseInt(e.target.value) : '')}
            min="0"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="cookTime" className="block text-sm font-medium mb-2">
            Cook Time (minutes)
          </label>
          <input
            type="number"
            id="cookTime"
            value={cookTime}
            onChange={(e) => setCookTime(e.target.value ? parseInt(e.target.value) : '')}
            min="0"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="servings" className="block text-sm font-medium mb-2">
            Servings
          </label>
          <input
            type="number"
            id="servings"
            value={servings}
            onChange={(e) => setServings(e.target.value ? parseInt(e.target.value) : '')}
            min="1"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium mb-2">
            Difficulty
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard' | '')}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-900 text-white"
          >
            <option value="">Select difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-2">
          Category
        </label>
        <input
          type="text"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Dessert, Main Course, Appetizer"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium mb-2">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., vegetarian, quick, family-friendly"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
      >
        {loading
          ? (isEditMode ? 'Updating Recipe...' : 'Creating Recipe...')
          : (isEditMode ? 'Update Recipe' : 'Create Recipe')
        }
      </button>
    </form>
  );
}
