import { ImageResponse } from 'next/og';
import { getRecipe } from '@/lib/dynamodb';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const CARD_BACKGROUNDS = ['#F0E0CC', '#E0CCBA', '#CCE0D4', '#E8D0D0', '#D4E0CC', '#E0D4C6', '#CCE0E8', '#E0D0E8'];
const CUISINE_EMOJI: Record<string, string> = {
  Japanese: '🍜', Italian: '🍝', Mexican: '🌮', Indian: '🍛',
  American: '🍔', Thai: '🍲', Chinese: '🥡', Korean: '🍱', 'Middle Eastern': '🧆', Other: '🍴',
};
const MEAL_EMOJI: Record<string, string> = {
  Breakfast: '🥞', Lunch: '🥗', Dinner: '🍽️', Dessert: '🍰', Snack: '🥨',
};

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    return new ImageResponse(
      <div style={{ width: 1200, height: 630, background: '#F5ECD7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 48, color: '#A07048' }}>Recipe not found</span>
      </div>
    );
  }

  const sum = recipe.recipeId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const cardBg = CARD_BACKGROUNDS[sum % CARD_BACKGROUNDS.length];
  const emoji = (recipe.cuisine && CUISINE_EMOJI[recipe.cuisine]) || (recipe.mealType?.[0] && MEAL_EMOJI[recipe.mealType[0]]) || '🍴';
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const formatTime = (mins: number) => mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h${mins % 60 > 0 ? ` ${mins % 60}m` : ''}`;
  const MEAL_ORDER = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack'];
  const sortedMealTypes = [...(recipe.mealType || [])].sort((a, b) => MEAL_ORDER.indexOf(a) - MEAL_ORDER.indexOf(b));

  return new ImageResponse(
    <div style={{ width: 1200, height: 630, display: 'flex', fontFamily: 'Georgia, serif', background: '#F5ECD7' }}>

      {/* Left — image or emoji */}
      <div style={{ width: 480, height: 630, background: cardBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
        {recipe.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={recipe.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 120 }}>{emoji}</span>
        )}
      </div>

      {/* Right — content */}
      <div style={{ flex: 1, padding: '52px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

        {/* Top */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {/* Pills */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {recipe.cuisine && (
              <span style={{ background: '#C8956C', color: 'white', fontSize: 13, padding: '4px 14px', borderRadius: 20 }}>{recipe.cuisine}</span>
            )}
            {sortedMealTypes.map(type => (
              <span key={type} style={{ background: '#E8D8C4', color: '#7A6E62', fontSize: 13, padding: '4px 14px', borderRadius: 20 }}>{type}</span>
            ))}
            {recipe.overnight && (
              <span style={{ background: '#1E1B2E', color: '#E8D8FF', fontSize: 13, padding: '4px 14px', borderRadius: 20 }}>🌙 Overnight</span>
            )}
          </div>

          {/* Title */}
          <div style={{ fontSize: recipe.title.length > 30 ? 44 : 52, color: '#3D2B1F', lineHeight: 1.15, marginBottom: 16 }}>
            {recipe.title}
          </div>

          {/* Description */}
          {recipe.description && (
            <div style={{ fontSize: 18, color: '#7A6E62', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {recipe.description}
            </div>
          )}
        </div>

        {/* Bottom */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 24 }}>
            {recipe.servings && (
              <span style={{ fontSize: 16, color: '#7A6E62' }}>🍽 {recipe.servings} servings</span>
            )}
            {recipe.difficulty && (
              <span style={{ fontSize: 16, color: '#7A6E62' }}>📊 {recipe.difficulty}</span>
            )}
          </div>

          {/* Macros + Time pills */}
          {(() => {
            const hasMacros = recipe.protein || recipe.carbs || recipe.fat;
            const cal = hasMacros ? Math.round((recipe.protein || 0) * 4 + (recipe.carbs || 0) * 4 + (recipe.fat || 0) * 9) : null;
            const pills = [
              ...(totalTime > 0 ? [{ label: 'Total Time', value: formatTime(totalTime) }] : []),
              ...(cal !== null ? [{ label: 'Calories', value: `${cal}` }] : []),
              ...(recipe.protein !== undefined && hasMacros ? [{ label: 'Protein', value: `${recipe.protein}g` }] : []),
              ...(recipe.carbs !== undefined && hasMacros ? [{ label: 'Carbs', value: `${recipe.carbs}g` }] : []),
              ...(recipe.fat !== undefined && hasMacros ? [{ label: 'Fat', value: `${recipe.fat}g` }] : []),
            ];
            if (!pills.length) return null;
            return (
              <div style={{ display: 'flex', gap: 12 }}>
                {pills.map(({ label, value }) => (
                  <div key={label} style={{ background: '#EEE0CC', borderRadius: 10, padding: '8px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <span style={{ fontSize: 11, color: '#A07048', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
                    <span style={{ fontSize: 18, color: '#7A5C3A' }}>{value}</span>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Author + branding */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {recipe.authorImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={recipe.authorImage} alt="" style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #D4C0A8' }} />
              ) : (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E8D8C4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#A07048', border: '2px solid #D4C0A8' }}>
                  {recipe.author.charAt(0).toUpperCase()}
                </div>
              )}
              <span style={{ fontSize: 16, color: '#A07048' }}>{recipe.author}</span>
            </div>
            <span style={{ fontSize: 20, color: '#C8956C', letterSpacing: -0.5 }}>
              Saifuddin&apos;s Kitchen
            </span>
          </div>
        </div>

      </div>
    </div>,
    { ...size }
  );
}
