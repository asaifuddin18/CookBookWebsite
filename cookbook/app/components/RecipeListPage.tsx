'use client';

import { useState, useEffect, useRef } from 'react';
import { Recipe } from '@/lib/types';
import RecipeList from './RecipeList';
import { useSearch } from './SearchProvider';

interface RecipeListPageProps {
  initialRecipes: Recipe[];
}

const MEAL_FILTERS = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack'];
const CUISINE_FILTERS = ['American', 'Italian', 'Mexican', 'Indian', 'Japanese', 'Thai', 'Chinese', 'Korean'];

export default function RecipeListPage({ initialRecipes }: RecipeListPageProps) {
  const { searchQuery, setSearchQuery } = useSearch();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [filteredRecipes, setFilteredRecipes] = useState(initialRecipes);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

    if (activeFilter !== 'All') {
      if (MEAL_FILTERS.includes(activeFilter)) {
        result = result.filter(r => r.mealType?.includes(activeFilter as never));
      } else {
        result = result.filter(r => r.cuisine === activeFilter);
      }
    }

    setFilteredRecipes(result);
  }, [searchQuery, activeFilter, initialRecipes]);

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

      {/* Filters */}
      <div className="flex justify-center gap-2 px-5 py-6 flex-wrap">
        <button
          onClick={() => handleFilterClick('All')}
          className={`text-[13px] px-[18px] py-2 rounded-[24px] border transition-all ${activeFilter === 'All' ? 'bg-brown text-cream border-brown' : 'border-border text-text-muted hover:border-copper hover:text-copper'}`}
        >
          All
        </button>
        {MEAL_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => handleFilterClick(f)}
            className={`text-[13px] px-[18px] py-2 rounded-[24px] border transition-all ${activeFilter === f ? 'bg-brown text-cream border-brown' : 'border-border text-text-muted hover:border-copper hover:text-copper'}`}
          >
            {f}
          </button>
        ))}
        {CUISINE_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => handleFilterClick(f)}
            className={`text-[13px] px-[18px] py-2 rounded-[24px] border transition-all ${activeFilter === f ? 'bg-brown text-cream border-brown' : 'border-border text-text-muted hover:border-copper hover:text-copper'}`}
          >
            {f}
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
      </div>

      {/* Grid */}
      <div className="px-5 lg:px-10 pb-12">
        <RecipeList recipes={filteredRecipes} />
      </div>

      {/* Footer */}
      <footer className="border-t border-border px-5 lg:px-10 py-8 flex justify-between items-center text-[13px] text-text-light">
        <span>Cookbook &copy; 2026 — Saifuddins</span>
      </footer>
    </div>
  );
}
