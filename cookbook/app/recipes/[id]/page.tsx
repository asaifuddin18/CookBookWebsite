import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRecipe } from '@/lib/dynamodb';

export const dynamic = 'force-dynamic';
import { ArrowLeft, ChefHat } from 'lucide-react';
import DeleteRecipeButton from '@/app/components/DeleteRecipeButton';
import ServingSizeScaler from '@/app/components/ServingSizeScaler';
import CopyLinkButton from '@/app/components/CopyLinkButton';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [recipe, session] = await Promise.all([getRecipe(id), getServerSession(authOptions)]);

  if (!recipe) notFound();

  const isAuthor = !!session && (!recipe.authorEmail || recipe.authorEmail === session.user?.email);
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

        <h1 className="font-serif text-[36px] md:text-[42px] text-brown-light leading-tight mb-4">{recipe.title}</h1>

        <div className="flex items-center gap-3 mb-4">
          {recipe.authorImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={recipe.authorImage} alt={recipe.author} className="w-8 h-8 rounded-full border border-border" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-cream-dark flex items-center justify-center text-[12px] font-semibold text-copper-dark">
              {authorInitial}
            </div>
          )}
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

        <div className="flex gap-3 items-center">
          {isAuthor && (
            <Link
              href={`/recipes/${recipe.recipeId}/edit`}
              className="inline-flex items-center gap-1.5 bg-copper hover:bg-copper-dark text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-all hover:-translate-y-px"
            >
              <ChefHat size={14} />
              Edit recipe
            </Link>
          )}
          <CopyLinkButton />
          {isAuthor && <DeleteRecipeButton recipeId={recipe.recipeId} />}
        </div>
      </div>

      {/* Hero image */}
      <div className="w-full h-[280px] md:h-[320px] rounded-[14px] overflow-hidden mb-8" style={{ background: cardBg }}>
        {recipe.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[80px]">{emoji}</div>
        )}
      </div>

      {/* Time stats row */}
      {(recipe.prepTime || recipe.cookTime || totalTime || recipe.servings) && (
        <div className="flex border border-border rounded-[10px] overflow-hidden mb-10">
          {recipe.prepTime && (
            <div className="flex-1 py-4 px-3 text-center border-r border-border last:border-r-0">
              <div className="text-[10px] text-text-light uppercase tracking-widest mb-1">Prep</div>
              <div className="font-serif text-[18px] text-copper-dark">{formatTime(recipe.prepTime)}</div>
            </div>
          )}
          {recipe.cookTime && (
            <div className="flex-1 py-4 px-3 text-center border-r border-border last:border-r-0">
              <div className="text-[10px] text-text-light uppercase tracking-widest mb-1">Cook</div>
              <div className="font-serif text-[18px] text-copper-dark">{formatTime(recipe.cookTime)}</div>
            </div>
          )}
          {totalTime > 0 && (
            <div className="flex-1 py-4 px-3 text-center border-r border-border last:border-r-0">
              <div className="text-[10px] text-text-light uppercase tracking-widest mb-1">Total</div>
              <div className="font-serif text-[18px] text-copper-dark">{formatTime(totalTime)}</div>
            </div>
          )}
          {recipe.servings && (
            <div className="flex-1 py-4 px-3 text-center">
              <div className="text-[10px] text-text-light uppercase tracking-widest mb-1">Servings</div>
              <div className="font-serif text-[18px] text-copper-dark">{recipe.servings}</div>
            </div>
          )}
        </div>
      )}

      {/* Macros */}
      {(recipe.protein || recipe.carbs || recipe.fat) && (() => {
        const calories = Math.round((recipe.protein || 0) * 4 + (recipe.carbs || 0) * 4 + (recipe.fat || 0) * 9);
        return (
          <div className="mb-10">
            <h2 className="font-serif text-[16px] text-text-muted font-normal mb-3 uppercase tracking-widest text-[11px]">Nutrition per serving</h2>
            <div className="flex border border-border rounded-[10px] overflow-hidden">
              <div className="flex-1 py-4 px-3 text-center border-r border-border">
                <div className="text-[10px] text-text-light uppercase tracking-widest mb-1">Calories</div>
                <div className="font-serif text-[18px] text-copper-dark">{calories}</div>
              </div>
              {recipe.protein !== undefined && (
                <div className="flex-1 py-4 px-3 text-center border-r border-border">
                  <div className="text-[10px] text-text-light uppercase tracking-widest mb-1">Protein</div>
                  <div className="font-serif text-[18px] text-copper-dark">{recipe.protein}g</div>
                </div>
              )}
              {recipe.carbs !== undefined && (
                <div className="flex-1 py-4 px-3 text-center border-r border-border">
                  <div className="text-[10px] text-text-light uppercase tracking-widest mb-1">Carbs</div>
                  <div className="font-serif text-[18px] text-copper-dark">{recipe.carbs}g</div>
                </div>
              )}
              {recipe.fat !== undefined && (
                <div className="flex-1 py-4 px-3 text-center">
                  <div className="text-[10px] text-text-light uppercase tracking-widest mb-1">Fat</div>
                  <div className="font-serif text-[18px] text-copper-dark">{recipe.fat}g</div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Ingredients + Instructions two-column layout */}
      <div className="flex flex-col md:flex-row gap-10 mb-9">

        {/* Ingredients — left column */}
        <div className="md:w-[38%] md:flex-shrink-0">
          <ServingSizeScaler
            ingredients={recipe.ingredients}
            defaultServings={recipe.servings || 1}
          />
        </div>

        {/* Instructions — right column */}
        <div className="flex-1">
          <h2 className="font-serif text-[20px] text-brown-light font-normal mb-4 pb-2 border-b border-border">Instructions</h2>
          <ol>
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="flex gap-4 py-4 border-b border-border last:border-0 items-start">
                <span className="font-serif text-[22px] text-copper-light leading-none flex-shrink-0 w-7 text-right">
                  {index + 1}
                </span>
                <p className="text-[15px] text-brown-light leading-relaxed">{instruction}</p>
              </li>
            ))}
          </ol>
        </div>

      </div>

    </div>
  );
}
