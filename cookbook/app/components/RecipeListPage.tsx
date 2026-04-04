'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Recipe } from '@/lib/types';
import RecipeList from './RecipeList';
import { useSearch } from './SearchProvider';
import { useFavorites } from '@/lib/useFavorites';

interface RecipeListPageProps {
  initialRecipes: Recipe[];
}

const MEAL_FILTERS = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack'];
const CUISINE_FILTERS = ['American', 'Italian', 'Mexican', 'Indian', 'Japanese', 'Thai', 'Chinese', 'Korean'];

type CalorieFilter = 'under400' | '400-700' | '700plus' | null;
type MacroFilter = 'high-protein' | 'low-carb' | null;
type SortBy = 'newest' | 'alphabetical' | 'quickest' | 'calories-asc' | 'calories-desc' | 'most-protein' | 'fewest-carbs' | 'least-fat';

const getCalories = (r: { protein?: number; carbs?: number; fat?: number }) =>
  Math.round((r.protein || 0) * 4 + (r.carbs || 0) * 4 + (r.fat || 0) * 9);

const hasMacros = (r: { protein?: number; carbs?: number; fat?: number }) =>
  r.protein !== undefined || r.carbs !== undefined || r.fat !== undefined;

export default function RecipeListPage({ initialRecipes }: RecipeListPageProps) {
  const { data: session } = useSession();
  const { favorites, toggle: toggleFavorite } = useFavorites(session?.user?.email);
  const { searchQuery, setSearchQuery } = useSearch();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [calorieFilter, setCalorieFilter] = useState<CalorieFilter>(null);
  const [macroFilter, setMacroFilter] = useState<MacroFilter>(null);
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [filteredRecipes, setFilteredRecipes] = useState(initialRecipes);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filterCounts: Record<string, number> = {
    All: initialRecipes.length,
    Favorites: initialRecipes.filter(r => favorites.has(r.recipeId)).length,
    ...Object.fromEntries(MEAL_FILTERS.map(f => [f, initialRecipes.filter(r => r.mealType?.includes(f as never)).length])),
    ...Object.fromEntries(CUISINE_FILTERS.map(f => [f, initialRecipes.filter(r => r.cuisine === f).length])),
  };

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    let result = initialRecipes;

    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase().trim();
      result = result.filter((r) =>
        r.title.toLowerCase().includes(term) ||
        r.description?.toLowerCase().includes(term) ||
        r.author.toLowerCase().includes(term) ||
        r.mealType?.some(m => m.toLowerCase().includes(term)) ||
        r.ingredients.some(i => i.name.toLowerCase().includes(term)) ||
        r.tags?.some(t => t.toLowerCase().includes(term)) ||
        r.cuisine?.toLowerCase().includes(term) ||
        r.difficulty?.toLowerCase().includes(term)
      );
    }

    if (activeFilter === 'Favorites') {
      result = result.filter(r => favorites.has(r.recipeId));
    } else if (activeFilter !== 'All') {
      if (MEAL_FILTERS.includes(activeFilter)) {
        result = result.filter(r => r.mealType?.includes(activeFilter as never));
      } else {
        result = result.filter(r => r.cuisine === activeFilter);
      }
    }

    if (calorieFilter || macroFilter) {
      result = result.filter(r => {
        if (!hasMacros(r)) return false;
        if (calorieFilter) {
          const cal = getCalories(r);
          if (calorieFilter === 'under400' && cal >= 400) return false;
          if (calorieFilter === '400-700' && (cal < 400 || cal >= 700)) return false;
          if (calorieFilter === '700plus' && cal < 700) return false;
        }
        if (macroFilter) {
          if (macroFilter === 'high-protein' && (r.protein || 0) < 30) return false;
          if (macroFilter === 'low-carb' && (r.carbs || 0) > 30) return false;
        }
        return true;
      });
    }

    if (sortBy === 'alphabetical') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'quickest') {
      result = [...result].sort((a, b) => {
        const aTime = (a.prepTime || 0) + (a.cookTime || 0);
        const bTime = (b.prepTime || 0) + (b.cookTime || 0);
        if (aTime === 0 && bTime === 0) return 0;
        if (aTime === 0) return 1;
        if (bTime === 0) return -1;
        return aTime - bTime;
      });
    } else if (sortBy === 'calories-asc') {
      result = [...result].sort((a, b) => {
        if (!hasMacros(a) && !hasMacros(b)) return 0;
        if (!hasMacros(a)) return 1;
        if (!hasMacros(b)) return -1;
        return getCalories(a) - getCalories(b);
      });
    } else if (sortBy === 'calories-desc') {
      result = [...result].sort((a, b) => {
        if (!hasMacros(a) && !hasMacros(b)) return 0;
        if (!hasMacros(a)) return 1;
        if (!hasMacros(b)) return -1;
        return getCalories(b) - getCalories(a);
      });
    } else if (sortBy === 'most-protein') {
      result = [...result].sort((a, b) => {
        if (!hasMacros(a) && !hasMacros(b)) return 0;
        if (!hasMacros(a)) return 1;
        if (!hasMacros(b)) return -1;
        return (b.protein || 0) - (a.protein || 0);
      });
    } else if (sortBy === 'fewest-carbs') {
      result = [...result].sort((a, b) => {
        if (!hasMacros(a) && !hasMacros(b)) return 0;
        if (!hasMacros(a)) return 1;
        if (!hasMacros(b)) return -1;
        return (a.carbs || 0) - (b.carbs || 0);
      });
    } else if (sortBy === 'least-fat') {
      result = [...result].sort((a, b) => {
        if (!hasMacros(a) && !hasMacros(b)) return 0;
        if (!hasMacros(a)) return 1;
        if (!hasMacros(b)) return -1;
        return (a.fat || 0) - (b.fat || 0);
      });
    } else {
      result = [...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    setFilteredRecipes(result);
  }, [searchQuery, activeFilter, calorieFilter, macroFilter, sortBy, initialRecipes, favorites]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localQuery);
  };

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden text-center px-5 pt-14 pb-10" style={{ background: 'linear-gradient(180deg, #FDFAF5 0%, #F5EDE0 100%)' }}>
        <div className="absolute -top-15 -right-15 w-[200px] h-[200px] rounded-full" style={{ background: 'rgba(200,149,108,0.06)' }} />
        <div className="absolute -bottom-10 -left-10 w-[160px] h-[160px] rounded-full" style={{ background: 'rgba(200,149,108,0.04)' }} />

        <div className="relative">
          <span className="inline-block bg-brown text-cream text-[10px] tracking-[2.5px] uppercase font-medium px-3.5 py-1.5 rounded-sm mb-5">
            Community Cookbook
          </span>
          <h1 className="font-serif text-[42px] md:text-[48px] text-brown leading-tight mb-3 tracking-tight">
            Share &amp; discover<br />
            <em className="text-copper not-italic italic">delicious</em> recipes
          </h1>
          <p className="text-[16px] text-text-muted max-w-[460px] mx-auto mb-7 leading-relaxed font-light">
            A warm community space for family favorites, weeknight dinners, and weekend baking adventures.
          </p>

          <form onSubmit={handleSearchSubmit} className="max-w-[500px] mx-auto">
            <div className="flex border-[1.5px] border-border rounded-[40px] overflow-hidden bg-white shadow-sm focus-within:border-copper focus-within:shadow-md transition-all">
              <input
                ref={searchInputRef}
                type="text"
                value={localQuery}
                onChange={(e) => { setLocalQuery(e.target.value); setSearchQuery(e.target.value); }}
                placeholder="Search by name, ingredient, or cuisine..."
                className="flex-1 px-6 py-3.5 text-[14px] bg-transparent outline-none text-brown placeholder:text-text-light font-sans"
              />
              <button type="submit" className="bg-copper hover:bg-copper-dark text-white px-7 text-[14px] font-medium transition-colors">
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Nutrition filters — only shown if any recipe has macros */}
      {initialRecipes.some(hasMacros) && (
        <div className="flex justify-center items-center gap-2 px-5 pt-5 pb-1 flex-wrap">
          <span className="text-[11px] text-text-light uppercase tracking-widest mr-1">Calories</span>
          {([
            { key: 'under400', label: 'Under 400' },
            { key: '400-700', label: '400–700' },
            { key: '700plus', label: '700+' },
          ] as { key: CalorieFilter; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCalorieFilter(calorieFilter === key ? null : key)}
              className={`text-[12px] px-4 py-1.5 rounded-[24px] border transition-all ${calorieFilter === key ? 'bg-copper text-white border-copper' : 'border-border text-text-muted hover:border-copper hover:text-copper'}`}
            >
              {label}
            </button>
          ))}
          <span className="text-[11px] text-text-light uppercase tracking-widest mx-1">Macros</span>
          {([
            { key: 'high-protein', label: 'High Protein' },
            { key: 'low-carb', label: 'Low Carb' },
          ] as { key: MacroFilter; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setMacroFilter(macroFilter === key ? null : key)}
              className={`text-[12px] px-4 py-1.5 rounded-[24px] border transition-all ${macroFilter === key ? 'bg-copper text-white border-copper' : 'border-border text-text-muted hover:border-copper hover:text-copper'}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex justify-center gap-2 px-5 py-6 flex-wrap">
        {(['All', ...(session ? ['Favorites'] : []), ...MEAL_FILTERS, ...CUISINE_FILTERS]).map(f => (
          <button
            key={f}
            onClick={() => handleFilterClick(f)}
            className={`text-[13px] px-[18px] py-2 rounded-[24px] border transition-all inline-flex items-center gap-1.5 ${activeFilter === f ? 'bg-brown text-cream border-brown' : 'border-border text-text-muted hover:border-copper hover:text-copper'}`}
          >
            {f}
            <span className={`text-[11px] ${activeFilter === f ? 'text-cream/70' : 'text-text-light'}`}>
              {filterCounts[f] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Section header */}
      <div className="flex items-center gap-4 px-5 lg:px-10 pb-5">
        <h2 className="font-serif text-[20px] text-brown font-normal whitespace-nowrap">
          {searchQuery ? `Results for "${searchQuery}"` : activeFilter !== 'All' ? `${activeFilter} recipes` : 'Latest recipes'}
        </h2>
        <div className="flex-1 h-px bg-border" />
        <span className="text-[12px] text-text-light whitespace-nowrap">{filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}</span>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortBy)}
          className="text-[12px] text-text-muted border border-border rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-copper transition-colors appearance-none cursor-pointer"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%237A6E62' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', paddingRight: '24px' }}
        >
          <option value="newest">Newest</option>
          <option value="alphabetical">A–Z</option>
          <option value="quickest">Quickest</option>
          <option value="calories-asc">Calories ↑</option>
          <option value="calories-desc">Calories ↓</option>
          <option value="most-protein">Most protein</option>
          <option value="fewest-carbs">Fewest carbs</option>
          <option value="least-fat">Least fat</option>
        </select>
      </div>

      {/* Grid */}
      <div className="px-5 lg:px-10 pb-12">
        <RecipeList recipes={filteredRecipes} favorites={favorites} onToggleFavorite={toggleFavorite} />
      </div>

      {/* Footer */}
      <footer className="border-t border-border px-5 lg:px-10 py-8 flex justify-between items-center text-[13px] text-text-light">
        <span>Cookbook &copy; 2026 — Saifuddins</span>
      </footer>
    </div>
  );
}
