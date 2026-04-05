import { ImageResponse } from 'next/og';
import { getAllRecipes } from '@/lib/dynamodb';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const CUISINE_EMOJI: Record<string, string> = {
  Japanese: '🍜', Italian: '🍝', Mexican: '🌮', Indian: '🍛',
  American: '🍔', Thai: '🍲', Chinese: '🥡', Korean: '🍱', 'Middle Eastern': '🧆', Other: '🍴',
};
const MEAL_EMOJI: Record<string, string> = {
  Breakfast: '🥞', Lunch: '🥗', Dinner: '🍽️', Dessert: '🍰', Snack: '🥨',
};
const CARD_BACKGROUNDS = ['#F0E0CC', '#E0CCBA', '#CCE0D4', '#E8D0D0', '#D4E0CC', '#E0D4C6'];

export default async function Image() {
  const allRecipes = await getAllRecipes();

  // Prioritize recipes with images, then fill with the rest
  const withImages = allRecipes.filter(r => r.imageUrl);
  const withoutImages = allRecipes.filter(r => !r.imageUrl);
  const featured = [...withImages, ...withoutImages].slice(0, 6);

  return new ImageResponse(
    <div style={{ width: 1200, height: 630, display: 'flex', flexDirection: 'column', background: '#F5ECD7', fontFamily: 'Georgia, serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '36px 48px 28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 48, color: '#3D2B1F', letterSpacing: -1 }}>
            Saifuddin&apos;s Kitchen
          </div>
          <div style={{ fontSize: 20, color: '#A07048' }}>
            Our family&apos;s favorite recipes, all in one place.
          </div>
        </div>
        <div style={{ background: '#C8956C', color: 'white', fontSize: 18, padding: '8px 22px', borderRadius: 24, display: 'flex' }}>
          {`${allRecipes.length} recipes`}
        </div>
      </div>

      {/* Recipe grid */}
      <div style={{ display: 'flex', gap: 12, paddingLeft: 48, paddingRight: 48, flex: 1, paddingBottom: 40 }}>
        {featured.map((recipe, i) => {
          const sum = recipe.recipeId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
          const bg = CARD_BACKGROUNDS[sum % CARD_BACKGROUNDS.length];
          const emoji = (recipe.cuisine && CUISINE_EMOJI[recipe.cuisine]) || (recipe.mealType?.[0] && MEAL_EMOJI[recipe.mealType[0]]) || '🍴';
          return (
            <div key={i} style={{ flex: 1, display: 'flex', borderRadius: 12, overflow: 'hidden', background: bg }}>
              {recipe.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={recipe.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 64 }}>{emoji}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>,
    { ...size }
  );
}
