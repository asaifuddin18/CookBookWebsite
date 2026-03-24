import Link from 'next/link';
import { Recipe } from '@/lib/types';
import { Clock } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
}

const CARD_BACKGROUNDS = ['#F0E0CC', '#E0CCBA', '#CCE0D4', '#E8D0D0', '#D4E0CC', '#E0D4C6', '#CCE0E8', '#E0D0E8'];

const CUISINE_EMOJI: Record<string, string> = {
  Japanese: '🍜', Italian: '🍝', Mexican: '🌮', Indian: '🍛',
  American: '🍔', Thai: '🍲', Chinese: '🥡', Korean: '🍱', French: '🥐', Other: '🍴',
};

const MEAL_EMOJI: Record<string, string> = {
  Breakfast: '🥞', Lunch: '🥗', Dinner: '🍽️', Dessert: '🍰', Snack: '🥨',
};

function getEmoji(recipe: Recipe): string {
  if (recipe.cuisine && CUISINE_EMOJI[recipe.cuisine]) return CUISINE_EMOJI[recipe.cuisine];
  if (recipe.mealType?.[0] && MEAL_EMOJI[recipe.mealType[0]]) return MEAL_EMOJI[recipe.mealType[0]];
  return '🍴';
}

function getCardBg(recipeId: string): string {
  const sum = recipeId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CARD_BACKGROUNDS[sum % CARD_BACKGROUNDS.length];
}

const DIFFICULTY_STYLES: Record<string, { bg: string; color: string }> = {
  Easy: { bg: '#E5F0DB', color: '#4A6B2A' },
  Medium: { bg: '#FFF3E0', color: '#B8860B' },
  Hard: { bg: '#FAECE7', color: '#C04020' },
};

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const emoji = getEmoji(recipe);
  const cardBg = getCardBg(recipe.recipeId);
  const diffStyle = recipe.difficulty ? DIFFICULTY_STYLES[recipe.difficulty] : null;
  const authorInitial = recipe.author.charAt(0).toUpperCase();

  const formatTime = (mins: number) => {
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <Link href={`/recipes/${recipe.recipeId}`} className="group block rounded-[14px] overflow-hidden bg-card border border-border hover:border-copper-light hover:-translate-y-[3px] hover:shadow-lg transition-all duration-250">
      {/* Image area */}
      <div className="h-[180px] relative overflow-hidden" style={{ background: cardBg }}>
        <div className="w-full h-full flex items-center justify-center text-[52px] group-hover:scale-105 transition-transform duration-250">
          {emoji}
        </div>
        {diffStyle && (
          <span className="absolute top-3 left-3 text-[11px] font-medium px-3 py-1 rounded" style={{ background: diffStyle.bg, color: diffStyle.color, letterSpacing: '0.5px' }}>
            {recipe.difficulty}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-[18px] pt-4 pb-3">
        <h3 className="font-serif text-[18px] text-brown leading-snug mb-1">{recipe.title}</h3>
        {recipe.description && (
          <p className="text-[13px] text-text-muted leading-relaxed line-clamp-2 mb-3">{recipe.description}</p>
        )}
        {(recipe.mealType?.length || recipe.cuisine) && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.mealType?.map((type) => (
              <span key={type} className="text-[11px] bg-cream-dark text-text-muted px-2.5 py-0.5 rounded-full">{type}</span>
            ))}
            {recipe.cuisine && (
              <span className="text-[11px] bg-cream-dark text-text-muted px-2.5 py-0.5 rounded-full">{recipe.cuisine}</span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center px-[18px] py-3 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-cream-dark flex items-center justify-center text-[10px] font-semibold text-copper-dark">
            {authorInitial}
          </div>
          <span className="text-[12px] text-text-muted">by {recipe.author}</span>
        </div>
        {totalTime > 0 && (
          <div className="flex items-center gap-1 text-[12px] text-text-light">
            <Clock size={13} className="text-text-light" />
            {formatTime(totalTime)}
          </div>
        )}
      </div>
    </Link>
  );
}
