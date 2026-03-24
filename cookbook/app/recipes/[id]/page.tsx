import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRecipe } from '@/lib/dynamodb';
import { ArrowLeft, ChefHat } from 'lucide-react';

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) notFound();

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const authorInitial = recipe.author.charAt(0).toUpperCase();

  const CUISINE_EMOJI: Record<string, string> = {
    Japanese: '🍜', Italian: '🍝', Mexican: '🌮', Indian: '🍛',
    American: '🍔', Thai: '🍲', Chinese: '🥡', Korean: '🍱', French: '🥐', Other: '🍴',
  };
  const MEAL_EMOJI: Record<string, string> = {
    Breakfast: '🥞', Lunch: '🥗', Dinner: '🍽️', Dessert: '🍰', Snack: '🥨',
  };
  const emoji = (recipe.cuisine && CUISINE_EMOJI[recipe.cuisine]) || (recipe.mealType?.[0] && MEAL_EMOJI[recipe.mealType[0]]) || '🍴';

  const CARD_BACKGROUNDS = ['#F0E0CC', '#E0CCBA', '#CCE0D4', '#E8D0D0', '#D4E0CC', '#E0D4C6'];
  const sum = recipe.recipeId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const cardBg = CARD_BACKGROUNDS[sum % CARD_BACKGROUNDS.length];

  const formatTime = (mins: number) => {
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="max-w-[800px] mx-auto px-5 lg:px-10 py-8 pb-16">
      {/* Back link */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-copper transition-colors mb-6">
        <ArrowLeft size={14} />
        Back to recipes
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-3">
          {recipe.cuisine && (
            <span className="text-[11px] bg-copper text-white px-3 py-1 rounded-full">{recipe.cuisine}</span>
          )}
          {recipe.mealType?.map((type) => (
            <span key={type} className="text-[11px] bg-cream-dark text-text-muted px-3 py-1 rounded-full">{type}</span>
          ))}
          {recipe.difficulty && (
            <span className="text-[11px] bg-cream-dark text-text-muted px-3 py-1 rounded-full">{recipe.difficulty}</span>
          )}
        </div>

        <h1 className="font-serif text-[36px] md:text-[42px] text-brown leading-tight mb-4">{recipe.title}</h1>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-cream-dark flex items-center justify-center text-[12px] font-semibold text-copper-dark">
            {authorInitial}
          </div>
          <div>
            <span className="block text-[14px] text-brown font-medium">{recipe.author}</span>
            <span className="text-[12px] text-text-light">Added {new Date(recipe.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {recipe.description && (
          <p className="font-serif italic text-[16px] text-text-muted leading-relaxed pl-4 border-l-[3px] border-copper-light mb-5">
            {recipe.description}
          </p>
        )}

        <div className="flex gap-3">
          <Link
            href={`/recipes/${recipe.recipeId}/edit`}
            className="inline-flex items-center gap-1.5 bg-copper hover:bg-copper-dark text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-all hover:-translate-y-px"
          >
            <ChefHat size={14} />
            Edit recipe
          </Link>
        </div>
      </div>

      {/* Emoji image */}
      <div className="w-full h-[280px] md:h-[320px] rounded-[14px] flex items-center justify-center text-[80px] mb-8" style={{ background: cardBg }}>
        {emoji}
      </div>

      {/* Time grid */}
      {(recipe.prepTime || recipe.cookTime || totalTime || recipe.servings) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-9">
          {recipe.prepTime && (
            <div className="bg-card border border-border rounded-[10px] p-4 text-center">
              <div className="text-[11px] text-text-light uppercase tracking-widest mb-1">Prep time</div>
              <div className="font-serif text-[20px] text-brown">{formatTime(recipe.prepTime)}</div>
            </div>
          )}
          {recipe.cookTime && (
            <div className="bg-card border border-border rounded-[10px] p-4 text-center">
              <div className="text-[11px] text-text-light uppercase tracking-widest mb-1">Cook time</div>
              <div className="font-serif text-[20px] text-brown">{formatTime(recipe.cookTime)}</div>
            </div>
          )}
          {totalTime > 0 && (
            <div className="bg-card border border-border rounded-[10px] p-4 text-center">
              <div className="text-[11px] text-text-light uppercase tracking-widest mb-1">Total time</div>
              <div className="font-serif text-[20px] text-brown">{formatTime(totalTime)}</div>
            </div>
          )}
          {recipe.servings && (
            <div className="bg-card border border-border rounded-[10px] p-4 text-center">
              <div className="text-[11px] text-text-light uppercase tracking-widest mb-1">Servings</div>
              <div className="font-serif text-[20px] text-brown">{recipe.servings}</div>
            </div>
          )}
        </div>
      )}

      {/* Ingredients */}
      <div className="mb-9">
        <h2 className="font-serif text-[22px] text-brown font-normal mb-4 pb-2 border-b border-border">Ingredients</h2>
        <ul className="space-y-0">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index} className="flex items-center gap-3 py-2.5 border-b border-dashed border-border last:border-0 text-[15px] text-brown-light">
              <span className="w-2 h-2 rounded-full bg-copper-light flex-shrink-0" />
              {ingredient.quantity} {ingredient.unit && `${ingredient.unit} `}{ingredient.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Instructions */}
      <div className="mb-9">
        <h2 className="font-serif text-[22px] text-brown font-normal mb-4 pb-2 border-b border-border">Instructions</h2>
        <ol className="space-y-0">
          {recipe.instructions.map((instruction, index) => (
            <li key={index} className="flex gap-4 py-4 border-b border-border last:border-0 items-start">
              <span className="w-8 h-8 rounded-full bg-cream-dark flex items-center justify-center font-serif text-[14px] text-copper-dark flex-shrink-0 mt-0.5">
                {index + 1}
              </span>
              <p className="text-[15px] text-brown-light leading-relaxed flex-1">{instruction}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Tags */}
      {recipe.tags && recipe.tags.length > 0 && (
        <div className="mb-6">
          <h2 className="font-serif text-[22px] text-brown font-normal mb-4 pb-2 border-b border-border">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag, index) => (
              <span key={index} className="text-[12px] bg-cream-dark text-text-muted px-3.5 py-1.5 rounded-full">{tag}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
