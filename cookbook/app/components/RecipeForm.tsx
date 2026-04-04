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
    mealType?: Array<'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert' | 'Snack'>;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    cuisine?: 'American' | 'Indian' | 'Thai' | 'Italian' | 'Chinese' | 'Korean' | 'Mexican' | 'Other';
    tags?: string[];
    imageUrl?: string;
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
  const [mealType, setMealType] = useState<Array<'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert' | 'Snack'>>(
    initialRecipe?.mealType || []
  );
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | ''>(
    initialRecipe?.difficulty || ''
  );
  const [cuisine, setCuisine] = useState<'American' | 'Indian' | 'Thai' | 'Italian' | 'Chinese' | 'Korean' | 'Mexican' | 'Other' | ''>(
    initialRecipe?.cuisine || ''
  );
  const [tags, setTags] = useState(
    initialRecipe?.tags ? initialRecipe.tags.join(', ') : ''
  );
  const [imageUrl, setImageUrl] = useState(initialRecipe?.imageUrl || '');
  const [imagePreview, setImagePreview] = useState(initialRecipe?.imageUrl || '');
  const [imageUploading, setImageUploading] = useState(false);

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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setImageUploading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      const { uploadUrl, imageUrl: uploadedUrl } = await res.json();
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      setImageUrl(uploadedUrl);
    } catch {
      setError('Image upload failed. Please try again.');
      setImagePreview(imageUrl);
    } finally {
      setImageUploading(false);
    }
  };

  const toggleMealType = (type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert' | 'Snack') => {
    setMealType(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
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
        mealType: mealType.length > 0 ? mealType : undefined,
        difficulty: difficulty || undefined,
        cuisine: cuisine || undefined,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : undefined,
        imageUrl: imageUrl || undefined,
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
    <form onSubmit={handleSubmit} className="space-y-0">
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[14px]">
          {error}
        </div>
      )}

      {/* Basic info */}
      <div className="mb-7">
        <h3 className="font-serif text-[18px] text-brown font-normal mb-4 pb-2 border-b border-border">Basic info</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] text-text-muted font-medium mb-1.5">
              Recipe title <span className="text-copper">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Grandma's chocolate chip cookies"
              className="w-full px-4 py-[11px] border-[1.5px] border-border rounded-lg text-[14px] text-brown bg-white outline-none focus:border-copper transition-colors placeholder:text-text-light"
            />
          </div>
          <div>
            <label className="block text-[13px] text-text-muted font-medium mb-1.5">
              Author <span className="text-copper">*</span>
            </label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              placeholder="Your name"
              className="w-full px-4 py-[11px] border-[1.5px] border-border rounded-lg text-[14px] text-brown bg-white outline-none focus:border-copper transition-colors placeholder:text-text-light"
            />
          </div>
          <div>
            <label className="block text-[13px] text-text-muted font-medium mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="A short description of your recipe..."
              className="w-full px-4 py-[11px] border-[1.5px] border-border rounded-lg text-[14px] text-brown bg-white outline-none focus:border-copper transition-colors placeholder:text-text-light resize-y leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Photo */}
      <div className="mb-7">
        <h3 className="font-serif text-[18px] text-brown font-normal mb-4 pb-2 border-b border-border">Photo</h3>
        <div className="flex gap-4 items-start">
          {imagePreview ? (
            <div className="relative w-[120px] h-[100px] rounded-lg overflow-hidden flex-shrink-0 border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              {imageUploading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-[12px] text-copper font-medium">
                  Uploading...
                </div>
              )}
            </div>
          ) : (
            <div className="w-[120px] h-[100px] rounded-lg border-[1.5px] border-dashed border-border bg-cream flex items-center justify-center text-[28px] flex-shrink-0">
              📷
            </div>
          )}
          <div>
            <label className="inline-flex items-center gap-2 cursor-pointer bg-white border-[1.5px] border-border hover:border-copper text-brown text-[13px] font-medium px-4 py-2.5 rounded-lg transition-colors">
              {imagePreview ? 'Change photo' : 'Upload photo'}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            <p className="text-[12px] text-text-light mt-2">JPG, PNG or WebP. Max 5MB.</p>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="mb-7">
        <h3 className="font-serif text-[18px] text-brown font-normal mb-4 pb-2 border-b border-border">Ingredients</h3>
        <div className="space-y-2">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                value={ingredient.name}
                onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                placeholder="Ingredient name"
                className="flex-1 px-4 py-2.5 border-[1.5px] border-border rounded-lg text-[14px] text-brown bg-white outline-none focus:border-copper transition-colors placeholder:text-text-light"
              />
              <input
                value={ingredient.quantity}
                onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                placeholder="Qty"
                className="w-20 px-3 py-2.5 border-[1.5px] border-border rounded-lg text-[14px] text-brown bg-white outline-none focus:border-copper transition-colors placeholder:text-text-light"
              />
              <input
                value={ingredient.unit || ''}
                onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                placeholder="Unit"
                className="w-20 px-3 py-2.5 border-[1.5px] border-border rounded-lg text-[14px] text-brown bg-white outline-none focus:border-copper transition-colors placeholder:text-text-light"
              />
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="w-8 h-8 rounded-full border border-border bg-white flex items-center justify-center text-text-light text-lg hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addIngredient}
          className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-copper border border-dashed border-copper-light px-4 py-2 rounded-lg hover:bg-copper/5 hover:border-solid transition-all"
        >
          + Add ingredient
        </button>
      </div>

      {/* Instructions */}
      <div className="mb-7">
        <h3 className="font-serif text-[18px] text-brown font-normal mb-4 pb-2 border-b border-border">Instructions</h3>
        <div className="space-y-2">
          {instructions.map((instruction, index) => (
            <div key={index} className="flex gap-2 items-start">
              <span className="w-7 h-7 rounded-full bg-cream-dark flex items-center justify-center font-serif text-[13px] text-copper-dark flex-shrink-0 mt-2.5">
                {index + 1}
              </span>
              <textarea
                value={instruction}
                onChange={(e) => updateInstruction(index, e.target.value)}
                placeholder={`Step ${index + 1}...`}
                rows={2}
                className="flex-1 px-4 py-2.5 border-[1.5px] border-border rounded-lg text-[14px] text-brown bg-white outline-none focus:border-copper transition-colors placeholder:text-text-light resize-y leading-relaxed"
              />
              <button
                type="button"
                onClick={() => removeInstruction(index)}
                className="w-8 h-8 rounded-full border border-border bg-white flex items-center justify-center text-text-light text-lg hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0 mt-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addInstruction}
          className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-copper border border-dashed border-copper-light px-4 py-2 rounded-lg hover:bg-copper/5 hover:border-solid transition-all"
        >
          + Add step
        </button>
      </div>

      {/* Details */}
      <div className="mb-7">
        <h3 className="font-serif text-[18px] text-brown font-normal mb-4 pb-2 border-b border-border">Details</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-[13px] text-text-muted font-medium mb-1.5">Prep time (min)</label>
            <input
              type="number"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value ? parseInt(e.target.value) : '')}
              min="0"
              placeholder="15"
              className="w-full px-4 py-[11px] border-[1.5px] border-border rounded-lg text-[14px] text-brown bg-white outline-none focus:border-copper transition-colors placeholder:text-text-light"
            />
          </div>
          <div>
            <label className="block text-[13px] text-text-muted font-medium mb-1.5">Cook time (min)</label>
            <input
              type="number"
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value ? parseInt(e.target.value) : '')}
              min="0"
              placeholder="30"
              className="w-full px-4 py-[11px] border-[1.5px] border-border rounded-lg text-[14px] text-brown bg-white outline-none focus:border-copper transition-colors placeholder:text-text-light"
            />
          </div>
          <div>
            <label className="block text-[13px] text-text-muted font-medium mb-1.5">Servings</label>
            <input
              type="number"
              value={servings}
              onChange={(e) => setServings(e.target.value ? parseInt(e.target.value) : '')}
              min="1"
              placeholder="4"
              className="w-full px-4 py-[11px] border-[1.5px] border-border rounded-lg text-[14px] text-brown bg-white outline-none focus:border-copper transition-colors placeholder:text-text-light"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[13px] text-text-muted font-medium mb-1.5">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard' | '')}
              className="w-full px-4 py-[11px] border-[1.5px] border-border rounded-lg text-[14px] text-brown bg-white outline-none focus:border-copper transition-colors appearance-none"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237A6E62' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '36px' }}
            >
              <option value="">Select difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] text-text-muted font-medium mb-1.5">Cuisine</label>
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value as 'American' | 'Indian' | 'Thai' | 'Italian' | 'Chinese' | 'Korean' | 'Mexican' | 'Other' | '')}
              className="w-full px-4 py-[11px] border-[1.5px] border-border rounded-lg text-[14px] text-brown bg-white outline-none focus:border-copper transition-colors appearance-none"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237A6E62' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '36px' }}
            >
              <option value="">Select cuisine</option>
              <option value="American">American</option>
              <option value="Indian">Indian</option>
              <option value="Thai">Thai</option>
              <option value="Italian">Italian</option>
              <option value="Chinese">Chinese</option>
              <option value="Korean">Korean</option>
              <option value="Mexican">Mexican</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Meal type */}
      <div className="mb-7">
        <h3 className="font-serif text-[18px] text-brown font-normal mb-4 pb-2 border-b border-border">Meal type</h3>
        <div className="flex flex-wrap gap-2">
          {(['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleMealType(type)}
              className={`text-[13px] px-[18px] py-2 rounded-[24px] border-[1.5px] transition-all ${
                mealType.includes(type)
                  ? 'bg-brown text-cream border-brown'
                  : 'border-border text-text-muted hover:border-copper hover:text-copper'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="mb-7">
        <h3 className="font-serif text-[18px] text-brown font-normal mb-4 pb-2 border-b border-border">Tags</h3>
        <div>
          <label className="block text-[13px] text-text-muted font-medium mb-1.5">Tags (comma-separated)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., comfort food, quick, vegetarian"
            className="w-full px-4 py-[11px] border-[1.5px] border-border rounded-lg text-[14px] text-brown bg-white outline-none focus:border-copper transition-colors placeholder:text-text-light"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-5 border-t border-border mt-9">
        <button
          type="submit"
          disabled={loading}
          className="bg-copper hover:bg-copper-dark disabled:opacity-60 text-white text-[15px] font-medium px-8 py-3 rounded-lg transition-all hover:-translate-y-px inline-flex items-center gap-2"
        >
          {loading
            ? (isEditMode ? 'Updating...' : 'Creating...')
            : (isEditMode ? 'Update recipe' : 'Create recipe')
          }
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="border border-border text-brown text-[13px] font-medium px-5 py-3 rounded-lg hover:border-copper hover:text-copper transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
