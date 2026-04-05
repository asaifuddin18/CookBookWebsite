'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Ingredient } from '@/lib/types';
import { ImportedRecipe } from '@/lib/recipeImport';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

function mkId() { return Math.random().toString(36).slice(2); }

async function compressImage(file: File): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1024;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
        else { width = Math.round(width * MAX / height); height = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      resolve({ base64, mediaType: 'image/jpeg' });
    };
    img.onerror = reject;
    img.src = url;
  });
}

interface RecipeFormProps {
  recipeId?: string;
  initialRecipe?: {
    title: string;
    description?: string;
    ingredients: Ingredient[];
    instructions: string[];
    prepTime?: number;
    cookTime?: number;
    servings?: number;
    mealType?: Array<'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert' | 'Snack'>;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    cuisine?: 'American' | 'Indian' | 'Thai' | 'Italian' | 'Chinese' | 'Korean' | 'Mexican' | 'Japanese' | 'Middle Eastern' | 'Other';
    overnight?: boolean;
    imageUrl?: string;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

function SortableIngredientRow({ id, ingredient, index, onUpdate, onRemove }: {
  id: string; ingredient: Ingredient; index: number;
  onUpdate: (index: number, field: keyof Ingredient, value: string) => void;
  onRemove: (index: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="flex gap-2 items-center">
      <button type="button" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-text-light hover:text-copper flex-shrink-0 touch-none">
        <GripVertical size={16} />
      </button>
      {ingredient.isHeader ? (
        <input value={ingredient.name} onChange={(e) => onUpdate(index, 'name', e.target.value)} placeholder="Section header (e.g. For the marinade)"
          className="flex-1 px-4 py-2.5 border-[1.5px] border-copper-light rounded-lg text-[13px] text-copper-dark bg-cream font-medium outline-none focus:border-copper transition-colors placeholder:text-text-light" />
      ) : (
        <>
          <input value={ingredient.name} onChange={(e) => onUpdate(index, 'name', e.target.value)} placeholder="Ingredient name"
            className="flex-1 px-4 py-2.5 border-[1.5px] border-border rounded-lg text-[14px] text-brown bg-white outline-none focus:border-copper transition-colors placeholder:text-text-light" />
          <input value={ingredient.quantity} onChange={(e) => onUpdate(index, 'quantity', e.target.value)} placeholder="Qty"
            className="w-20 px-3 py-2.5 border-[1.5px] border-border rounded-lg text-[14px] text-brown bg-white outline-none focus:border-copper transition-colors placeholder:text-text-light" />
          <input value={ingredient.unit || ''} onChange={(e) => onUpdate(index, 'unit', e.target.value)} placeholder="Unit"
            className="w-20 px-3 py-2.5 border-[1.5px] border-border rounded-lg text-[14px] text-brown bg-white outline-none focus:border-copper transition-colors placeholder:text-text-light" />
        </>
      )}
      <button type="button" onClick={() => onRemove(index)}
        className="w-8 h-8 rounded-full border border-[#D4C0A8] bg-[#EEE0CC] flex items-center justify-center text-[#A07048] text-lg hover:border-[#C8956C] hover:bg-[#E0C8A8] transition-all flex-shrink-0">
        ×
      </button>
    </div>
  );
}

function SortableInstructionRow({ id, instruction, index, onUpdate, onRemove }: {
  id: string; instruction: string; index: number;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="flex gap-2 items-start">
      <button type="button" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-text-light hover:text-copper flex-shrink-0 mt-3 touch-none">
        <GripVertical size={16} />
      </button>
      <span className="w-7 h-7 rounded-full bg-cream-dark flex items-center justify-center font-serif text-[13px] text-copper-dark flex-shrink-0 mt-2.5">
        {index + 1}
      </span>
      <textarea value={instruction} onChange={(e) => onUpdate(index, e.target.value)} placeholder={`Step ${index + 1}...`} rows={2}
        className="flex-1 px-4 py-2.5 border-[1.5px] border-border rounded-lg text-[14px] text-brown bg-white outline-none focus:border-copper transition-colors placeholder:text-text-light resize-y leading-relaxed" />
      <button type="button" onClick={() => onRemove(index)}
        className="w-8 h-8 rounded-full border border-[#D4C0A8] bg-[#EEE0CC] flex items-center justify-center text-[#A07048] text-lg hover:border-[#C8956C] hover:bg-[#E0C8A8] transition-all flex-shrink-0 mt-1">
        ×
      </button>
    </div>
  );
}

export default function RecipeForm({ recipeId, initialRecipe }: RecipeFormProps = {}) {
  const router = useRouter();
  const isEditMode = !!recipeId;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const errorRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState(initialRecipe?.title || '');
  const [description, setDescription] = useState(initialRecipe?.description || '');
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialRecipe?.ingredients || [{ name: '', quantity: '', unit: '' }]
  );
  const [ingredientIds, setIngredientIds] = useState<string[]>(
    () => (initialRecipe?.ingredients || [{}]).map(mkId)
  );
  const [instructions, setInstructions] = useState<string[]>(
    initialRecipe?.instructions || ['']
  );
  const [instructionIds, setInstructionIds] = useState<string[]>(
    () => (initialRecipe?.instructions || ['']).map(mkId)
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
  const [cuisine, setCuisine] = useState<'American' | 'Indian' | 'Thai' | 'Italian' | 'Chinese' | 'Korean' | 'Mexican' | 'Japanese' | 'Middle Eastern' | 'Other' | ''>(
    initialRecipe?.cuisine || ''
  );
  const [overnight, setOvernight] = useState(initialRecipe?.overnight || false);
  const [imageUrl, setImageUrl] = useState(initialRecipe?.imageUrl || '');
  const [imagePreview, setImagePreview] = useState(initialRecipe?.imageUrl || '');
  const [imageUploading, setImageUploading] = useState(false);
  const [protein, setProtein] = useState<number | ''>(initialRecipe?.protein ?? '');
  const [carbs, setCarbs] = useState<number | ''>(initialRecipe?.carbs ?? '');
  const [fat, setFat] = useState<number | ''>(initialRecipe?.fat ?? '');
  const [estimating, setEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [importTab, setImportTab] = useState<'photo' | 'url' | 'text'>('photo');
  const [importUrl, setImportUrl] = useState('');
  const [importText, setImportText] = useState('');
  const [importInstructions, setImportInstructions] = useState('');
  const [importPhoto, setImportPhoto] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const addIngredient = () => {
    setIngredients(p => [...p, { name: '', quantity: '', unit: '' }]);
    setIngredientIds(p => [...p, mkId()]);
  };

  const addIngredientHeader = () => {
    setIngredients(p => [...p, { name: '', quantity: '', isHeader: true }]);
    setIngredientIds(p => [...p, mkId()]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(p => p.filter((_, i) => i !== index));
      setIngredientIds(p => p.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const handleIngredientDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = ingredientIds.indexOf(active.id as string);
      const newIndex = ingredientIds.indexOf(over.id as string);
      setIngredients(p => arrayMove(p, oldIndex, newIndex));
      setIngredientIds(p => arrayMove(p, oldIndex, newIndex));
    }
  };

  const addInstruction = () => {
    setInstructions(p => [...p, '']);
    setInstructionIds(p => [...p, mkId()]);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(p => p.filter((_, i) => i !== index));
      setInstructionIds(p => p.filter((_, i) => i !== index));
    }
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const handleInstructionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = instructionIds.indexOf(active.id as string);
      const newIndex = instructionIds.indexOf(over.id as string);
      setInstructions(p => arrayMove(p, oldIndex, newIndex));
      setInstructionIds(p => arrayMove(p, oldIndex, newIndex));
    }
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
      const uploadRes = await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      if (!uploadRes.ok) throw new Error(`S3 upload failed: ${uploadRes.status}`);
      setImageUrl(uploadedUrl);
    } catch {
      setErrors(['Image upload failed. Please try again.']);
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

  const handleEstimateMacros = async () => {
    const validIngredients = ingredients.filter(i => i.name && i.quantity);
    if (!validIngredients.length) {
      setEstimateError('Add some ingredients first.');
      return;
    }
    setEstimating(true);
    setEstimateError(null);
    try {
      const res = await fetch('/api/estimate-macros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: validIngredients, servings: servings || undefined }),
      });
      if (!res.ok) throw new Error('Estimation failed');
      const data = await res.json();
      setProtein(data.protein);
      setCarbs(data.carbs);
      setFat(data.fat);
    } catch {
      setEstimateError('Could not estimate macros. Try again.');
    } finally {
      setEstimating(false);
    }
  };

  const applyImport = (data: ImportedRecipe) => {
    setTitle(data.title || '');
    setDescription(data.description || '');
    const newIngredients = data.ingredients?.length ? data.ingredients.map(i => ({ name: i.name, quantity: i.quantity, unit: i.unit || '' })) : [{ name: '', quantity: '', unit: '' }];
    const newInstructions = data.instructions?.length ? data.instructions : [''];
    setIngredients(newIngredients);
    setIngredientIds(newIngredients.map(mkId));
    setInstructions(newInstructions);
    setInstructionIds(newInstructions.map(mkId));
    setPrepTime(data.prepTime || '');
    setCookTime(data.cookTime || '');
    setServings(data.servings || '');
    setMealType(data.mealType || []);
    setDifficulty(data.difficulty || '');
    setCuisine(data.cuisine || '');
    setImportSuccess(true);
    setImportError(null);
  };

  const handleImportPhotoSubmit = async () => {
    if (!importPhoto) return;
    setImporting(true);
    setImportError(null);
    setImportSuccess(false);
    try {
      const { base64, mediaType } = await compressImage(importPhoto);
      const res = await fetch('/api/import-recipe/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mediaType, instructions: importInstructions }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Import failed');
      applyImport(await res.json());
      setImportPhoto(null);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed. Try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleImportText = async () => {
    if (!importText.trim()) return;
    setImporting(true);
    setImportError(null);
    setImportSuccess(false);
    try {
      const res = await fetch('/api/import-recipe/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: importText, instructions: importInstructions }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Import failed');
      applyImport(await res.json());
      setImportText('');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed. Try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleImportUrl = async () => {
    if (!importUrl.trim()) return;
    setImporting(true);
    setImportError(null);
    setImportSuccess(false);
    try {
      const res = await fetch('/api/import-recipe/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl.trim(), instructions: importInstructions }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Import failed');
      applyImport(await res.json());
      setImportUrl('');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed. Try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    const validIngredientsList = ingredients.filter(ing => ing.isHeader ? ing.name.trim() : ing.name && ing.quantity);
    const validInstructions = instructions.filter(inst => inst.trim());

    const validationErrors: string[] = [];
    if (!title.trim()) validationErrors.push('Title is required');
    if (validIngredientsList.length === 0) validationErrors.push('At least one ingredient (with name and quantity) is required');
    if (validInstructions.length === 0) validationErrors.push('At least one instruction step is required');

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      setTimeout(() => errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      return;
    }

    try {
      const recipeData = {
        title,
        description: description || undefined,
        ingredients: validIngredientsList,
        instructions: validInstructions,
        prepTime: prepTime || undefined,
        cookTime: cookTime || undefined,
        servings: servings || undefined,
        mealType: mealType.length > 0 ? mealType : undefined,
        difficulty: difficulty || undefined,
        cuisine: cuisine || undefined,
        overnight: overnight || undefined,
        imageUrl: imageUrl || undefined,
        protein: protein !== '' ? protein : undefined,
        carbs: carbs !== '' ? carbs : undefined,
        fat: fat !== '' ? fat : undefined,
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

      const created = await response.json();
      const redirectPath = isEditMode ? `/recipes/${recipeId}` : `/recipes/${created.recipeId}`;
      router.push(redirectPath);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setErrors([msg]);
      setTimeout(() => errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-0">
      {errors.length > 0 && (
        <div ref={errorRef} className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[14px]">
          <p className="font-medium mb-1">Please fix the following before saving:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {/* Import */}
      <div className="mb-8 p-5 rounded-xl border-[1.5px] border-dashed border-copper-light bg-cream">
        <h3 className="font-serif text-[18px] text-brown font-normal mb-1">Import recipe</h3>
        <p className="text-[12px] text-text-light mb-4">Import from a photo, URL, or pasted text — fields will be pre-filled for you to review.</p>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-white dark:bg-[#1A1410] rounded-lg p-1 w-fit border border-border">
          {(['photo', 'url', 'text'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => { setImportTab(tab); setImportError(null); setImportSuccess(false); }}
              className={`text-[13px] px-4 py-1.5 rounded-md transition-all font-medium ${importTab === tab ? 'bg-copper text-white' : 'text-text-muted hover:text-brown'}`}
            >
              {tab === 'photo' ? '📷 Photo' : tab === 'url' ? '🔗 URL' : '📋 Text'}
            </button>
          ))}
        </div>

        <input
          value={importInstructions}
          onChange={e => setImportInstructions(e.target.value)}
          placeholder='Optional instructions (e.g. "do not include the pita bread")'
          className="w-full px-4 py-2.5 border-[1.5px] border-border rounded-lg text-[13px] text-brown bg-white outline-none focus:border-copper transition-colors placeholder:text-text-light mb-3"
        />

        {importTab === 'text' ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder="Paste recipe text here..."
              rows={6}
              disabled={importing}
              className="w-full px-4 py-2.5 border-[1.5px] border-border rounded-lg text-[14px] text-brown bg-white outline-none focus:border-copper transition-colors placeholder:text-text-light resize-y leading-relaxed"
            />
            <button
              type="button"
              onClick={handleImportText}
              disabled={importing || !importText.trim()}
              className="self-end bg-copper hover:bg-copper-dark disabled:opacity-50 text-white text-[13px] font-medium px-5 py-2.5 rounded-lg transition-all"
            >
              {importing ? 'Importing...' : 'Import'}
            </button>
          </div>
        ) : importTab === 'photo' ? (
          <div className="flex gap-2">
            <label className="flex-1 inline-flex items-center gap-2 cursor-pointer border-[1.5px] border-border hover:border-copper text-brown text-[13px] font-medium px-4 py-2.5 rounded-lg transition-colors bg-white dark:bg-[#251C14] truncate">
              <span className="truncate">{importPhoto ? importPhoto.name : 'Choose photo'}</span>
              <input type="file" accept="image/*" onChange={e => { setImportPhoto(e.target.files?.[0] || null); e.target.value = ''; }} className="hidden" disabled={importing} />
            </label>
            <button
              type="button"
              onClick={handleImportPhotoSubmit}
              disabled={importing || !importPhoto}
              className="bg-copper hover:bg-copper-dark disabled:opacity-50 text-white text-[13px] font-medium px-5 py-2.5 rounded-lg transition-all"
            >
              {importing ? 'Importing...' : 'Import'}
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={importUrl}
              onChange={e => setImportUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleImportUrl()}
              placeholder="https://example.com/recipe"
              disabled={importing}
              className="flex-1 px-4 py-2.5 border-[1.5px] border-border rounded-lg text-[14px] text-brown bg-white outline-none focus:border-copper transition-colors placeholder:text-text-light"
            />
            <button
              type="button"
              onClick={handleImportUrl}
              disabled={importing || !importUrl.trim()}
              className="bg-copper hover:bg-copper-dark disabled:opacity-50 text-white text-[13px] font-medium px-5 py-2.5 rounded-lg transition-all"
            >
              {importing ? 'Importing...' : 'Import'}
            </button>
          </div>
        )}

        {importError && <p className="text-[12px] text-red-500 mt-3">{importError}</p>}
        {importSuccess && <p className="text-[12px] text-green-600 mt-3">Recipe imported — review the fields below and make any edits.</p>}
      </div>

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
              onChange={(e) => { setTitle(e.target.value); if (e.target.value.trim()) setErrors(prev => prev.filter(err => !err.toLowerCase().includes('title'))); }}
              placeholder="e.g., Grandma's chocolate chip cookies"
              className={`w-full px-4 py-[11px] border-[1.5px] rounded-lg text-[14px] text-brown bg-white outline-none focus:border-copper transition-colors placeholder:text-text-light ${errors.some(e => e.toLowerCase().includes('title')) ? 'border-red-400' : 'border-border'}`}
            />
            {errors.some(e => e.toLowerCase().includes('title')) && (
              <p className="mt-1 text-[12px] text-red-500">Title is required</p>
            )}
          </div>
          <div>
            <label className="block text-[13px] text-text-muted font-medium mb-1.5">
              Description <span className="text-text-light font-normal">(optional)</span>
            </label>
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
        <h3 className="font-serif text-[18px] text-brown font-normal mb-4 pb-2 border-b border-border">Photo <span className="font-sans text-[13px] text-text-light font-normal">(optional)</span></h3>
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
            <label className="inline-flex items-center gap-2 cursor-pointer bg-white dark:bg-[#251C14] border-[1.5px] border-border hover:border-copper text-brown text-[13px] font-medium px-4 py-2.5 rounded-lg transition-colors">
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleIngredientDragEnd}>
          <SortableContext items={ingredientIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <SortableIngredientRow
                  key={ingredientIds[index]}
                  id={ingredientIds[index]}
                  ingredient={ingredient}
                  index={index}
                  onUpdate={updateIngredient}
                  onRemove={removeIngredient}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={addIngredient} className="inline-flex items-center gap-1.5 text-[13px] text-copper border border-dashed border-copper-light px-4 py-2 rounded-lg hover:bg-copper/5 hover:border-solid transition-all">
            + Add ingredient
          </button>
          <button type="button" onClick={addIngredientHeader} className="inline-flex items-center gap-1.5 text-[13px] text-text-muted border border-dashed border-border px-4 py-2 rounded-lg hover:border-copper hover:text-copper transition-all">
            + Add section
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-7">
        <h3 className="font-serif text-[18px] text-brown font-normal mb-4 pb-2 border-b border-border">Instructions</h3>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleInstructionDragEnd}>
          <SortableContext items={instructionIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {instructions.map((instruction, index) => (
                <SortableInstructionRow
                  key={instructionIds[index]}
                  id={instructionIds[index]}
                  instruction={instruction}
                  index={index}
                  onUpdate={updateInstruction}
                  onRemove={removeInstruction}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <button type="button" onClick={addInstruction} className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-copper border border-dashed border-copper-light px-4 py-2 rounded-lg hover:bg-copper/5 hover:border-solid transition-all">
          + Add step
        </button>
      </div>

      {/* Details */}
      <div className="mb-7">
        <h3 className="font-serif text-[18px] text-brown font-normal mb-4 pb-2 border-b border-border">Details <span className="font-sans text-[13px] text-text-light font-normal">(optional)</span></h3>
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
              onChange={(e) => setCuisine(e.target.value as 'American' | 'Indian' | 'Thai' | 'Italian' | 'Chinese' | 'Korean' | 'Mexican' | 'Japanese' | 'Middle Eastern' | 'Other' | '')}
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
              <option value="Japanese">Japanese</option>
              <option value="Middle Eastern">Middle Eastern</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Meal type */}
      <div className="mb-7">
        <h3 className="font-serif text-[18px] text-brown font-normal mb-4 pb-2 border-b border-border">Meal type <span className="font-sans text-[13px] text-text-light font-normal">(optional)</span></h3>
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
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setOvernight(o => !o)}
            className={`text-[13px] px-[18px] py-2 rounded-[24px] border-[1.5px] transition-all ${overnight ? 'bg-brown text-cream border-brown' : 'border-border text-text-muted hover:border-copper hover:text-copper'}`}
          >
            🌙 Overnight
          </button>
        </div>
      </div>

      {/* Macros */}
      <div className="mb-7">
        <h3 className="font-serif text-[18px] text-brown font-normal mb-1 pb-2 border-b border-border">Nutrition <span className="font-sans text-[13px] text-text-light font-normal">(per serving, optional)</span></h3>
        <div className="flex items-center gap-3 mt-3 mb-4">
          <button
            type="button"
            onClick={handleEstimateMacros}
            disabled={estimating}
            className="inline-flex items-center gap-1.5 text-[13px] text-copper border border-dashed border-copper-light px-4 py-2 rounded-lg hover:bg-copper/5 hover:border-solid transition-all disabled:opacity-50"
          >
            {estimating ? 'Estimating...' : '✨ Estimate with AI'}
          </button>
          {(protein !== '' || carbs !== '' || fat !== '') && (
            <span className="text-[12px] text-text-light">
              Calories: <span className="text-copper-dark font-medium">{Math.round((Number(protein) || 0) * 4 + (Number(carbs) || 0) * 4 + (Number(fat) || 0) * 9)} kcal</span>
            </span>
          )}
        </div>
        {estimateError && <p className="text-[12px] text-red-500 mb-3">{estimateError}</p>}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[13px] text-text-muted font-medium mb-1.5">Protein (g)</label>
            <input
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value ? parseFloat(e.target.value) : '')}
              min="0"
              placeholder="0"
              className="w-full px-4 py-[11px] border-[1.5px] border-border rounded-lg text-[14px] text-brown bg-white outline-none focus:border-copper transition-colors placeholder:text-text-light"
            />
          </div>
          <div>
            <label className="block text-[13px] text-text-muted font-medium mb-1.5">Carbs (g)</label>
            <input
              type="number"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value ? parseFloat(e.target.value) : '')}
              min="0"
              placeholder="0"
              className="w-full px-4 py-[11px] border-[1.5px] border-border rounded-lg text-[14px] text-brown bg-white outline-none focus:border-copper transition-colors placeholder:text-text-light"
            />
          </div>
          <div>
            <label className="block text-[13px] text-text-muted font-medium mb-1.5">Fat (g)</label>
            <input
              type="number"
              value={fat}
              onChange={(e) => setFat(e.target.value ? parseFloat(e.target.value) : '')}
              min="0"
              placeholder="0"
              className="w-full px-4 py-[11px] border-[1.5px] border-border rounded-lg text-[14px] text-brown bg-white outline-none focus:border-copper transition-colors placeholder:text-text-light"
            />
          </div>
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
