'use client';

import Link from 'next/link';
import { Recipe } from '@/lib/types';
import { Clock } from 'lucide-react';
import FavoriteButton from './FavoriteButton';

interface RecipeCardProps {
  recipe: Recipe;
  isFavorited: boolean;
  onToggleFavorite: (recipeId: string) => void;
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

const MEAL_ORDER = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack'];

const DIFFICULTY_STYLES: Record<string, { bg: string; color: string }> = {
  Easy: { bg: '#E5F0DB', color: '#4A6B2A' },
  Medium: { bg: '#FFF3E0', color: '#B8860B' },
  Hard: { bg: '#FAECE7', color: '#C04020' },
};

export default function RecipeCard({ recipe, isFavorited, onToggleFavorite }: RecipeCardProps) {
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
    <Link href={`/recipes/${recipe.recipeId}`} className="group flex flex-col rounded-[14px] overflow-hidden bg-card border border-border hover:border-copper-light hover:-translate-y-[3px] hover:shadow-lg transition-all duration-250">
      {/* Image area */}
      <div className="h-[180px] relative overflow-hidden" style={{ background: cardBg }}>
        {recipe.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-250"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[52px] group-hover:scale-105 transition-transform duration-250">
            {emoji}
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {diffStyle && (
            <span className="text-[11px] font-medium px-3 py-1 rounded" style={{ background: diffStyle.bg, color: diffStyle.color, letterSpacing: '0.5px' }}>
              {recipe.difficulty}
            </span>
          )}
          {recipe.overnight && (
            <span className="text-[11px] font-medium px-3 py-1 rounded" style={{ background: '#1E1B2E', color: '#E8D8FF', letterSpacing: '0.5px' }}>
              🌙 Overnight
            </span>
          )}
        </div>
        <FavoriteButton
          recipeId={recipe.recipeId}
          isFavorited={isFavorited}
          onToggle={onToggleFavorite}
        />
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col px-[18px] pt-4 pb-3">
        <div className="flex-1">
          <h3 className="font-serif text-[18px] text-brown leading-snug mb-1">{recipe.title}</h3>
          {recipe.description && (
            <p className="text-[13px] text-text-muted leading-relaxed line-clamp-2">{recipe.description}</p>
          )}
        </div>
        {(recipe.mealType?.length || recipe.cuisine) && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {[...( recipe.mealType || [])].sort((a, b) => MEAL_ORDER.indexOf(a) - MEAL_ORDER.indexOf(b)).map((type) => (
              <span key={type} className="text-[11px] bg-cream-dark text-text-muted px-2.5 py-0.5 rounded-full">{type}</span>
            ))}
            {recipe.cuisine && (
              <span className="text-[11px] bg-cream-dark text-text-muted px-2.5 py-0.5 rounded-full">{recipe.cuisine}</span>
            )}
          </div>
        )}
      </div>

      {/* Macros + Footer — always at bottom */}
      <div>
      {(recipe.protein || recipe.carbs || recipe.fat) && (
        <div className="px-[18px] pb-3 flex gap-3">
          {(() => {
            const cal = Math.round((recipe.protein || 0) * 4 + (recipe.carbs || 0) * 4 + (recipe.fat || 0) * 9);
            return <span className="text-[11px] text-copper-dark font-medium">{cal} kcal</span>;
          })()}
          {recipe.protein !== undefined && <span className="text-[11px] text-text-light">{recipe.protein}g protein</span>}
          {recipe.carbs !== undefined && <span className="text-[11px] text-text-light">{recipe.carbs}g carbs</span>}
          {recipe.fat !== undefined && <span className="text-[11px] text-text-light">{recipe.fat}g fat</span>}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center px-[18px] py-3 border-t border-border">
        <div className="flex items-center gap-2">
          {recipe.authorImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={recipe.authorImage} alt={recipe.author} className="w-6 h-6 rounded-full border border-border" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-cream-dark flex items-center justify-center text-[10px] font-semibold text-copper-dark">
              {authorInitial}
            </div>
          )}
          <span className="text-[12px] text-text-muted">by {recipe.author}</span>
        </div>
        {totalTime > 0 && (
          <div className="flex items-center gap-1 text-[12px] text-text-light">
            <Clock size={13} className="text-text-light" />
            {formatTime(totalTime)}
          </div>
        )}
      </div>
      </div>
    </Link>
  );
}
