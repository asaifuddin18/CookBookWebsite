'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ingredient } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Recipe Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g., Chocolate Chip Cookies"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="author">Author *</Label>
        <Input
          id="author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
          placeholder="Your name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Brief description of your recipe"
        />
      </div>

      <div className="space-y-2">
        <Label>Ingredients *</Label>
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={ingredient.name}
              onChange={(e) => updateIngredient(index, 'name', e.target.value)}
              placeholder="Ingredient name"
              className="flex-1"
            />
            <Input
              value={ingredient.quantity}
              onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
              placeholder="Quantity"
              className="w-24"
            />
            <Input
              value={ingredient.unit || ''}
              onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
              placeholder="Unit"
              className="w-24"
            />
            <Button
              type="button"
              onClick={() => removeIngredient(index)}
              variant="destructive"
              size="sm"
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          onClick={addIngredient}
          variant="outline"
          className="mt-2"
        >
          Add Ingredient
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Instructions *</Label>
        {instructions.map((instruction, index) => (
          <div key={index} className="flex gap-2">
            <Textarea
              value={instruction}
              onChange={(e) => updateInstruction(index, e.target.value)}
              placeholder={`Step ${index + 1}`}
              rows={2}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={() => removeInstruction(index)}
              variant="destructive"
              size="sm"
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          onClick={addInstruction}
          variant="outline"
          className="mt-2"
        >
          Add Instruction
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prepTime">Prep Time (minutes)</Label>
          <Input
            type="number"
            id="prepTime"
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value ? parseInt(e.target.value) : '')}
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cookTime">Cook Time (minutes)</Label>
          <Input
            type="number"
            id="cookTime"
            value={cookTime}
            onChange={(e) => setCookTime(e.target.value ? parseInt(e.target.value) : '')}
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="servings">Servings</Label>
          <Input
            type="number"
            id="servings"
            value={servings}
            onChange={(e) => setServings(e.target.value ? parseInt(e.target.value) : '')}
            min="1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select value={difficulty} onValueChange={(value) => setDifficulty(value as 'Easy' | 'Medium' | 'Hard' | '')}>
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g., Dessert, Main Course, Appetizer"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g., vegetarian, quick, family-friendly"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading
          ? (isEditMode ? 'Updating Recipe...' : 'Creating Recipe...')
          : (isEditMode ? 'Update Recipe' : 'Create Recipe')
        }
      </Button>
    </form>
  );
}
