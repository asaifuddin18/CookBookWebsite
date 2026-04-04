import { useState, useEffect } from 'react';

export function useFavorites(userEmail?: string | null) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userEmail) {
      setFavorites(new Set());
      return;
    }
    fetch('/api/favorites')
      .then(r => r.json())
      .then(data => setFavorites(new Set(data.favorites as string[])))
      .catch(() => {});
  }, [userEmail]);

  const toggle = (recipeId: string) => {
    if (!userEmail) return;
    const wasFavorited = favorites.has(recipeId);

    // Optimistic update
    setFavorites(prev => {
      const next = new Set(prev);
      if (wasFavorited) next.delete(recipeId);
      else next.add(recipeId);
      return next;
    });

    const method = wasFavorited ? 'DELETE' : 'POST';
    fetch(`/api/favorites/${recipeId}`, { method }).catch(() => {
      // Revert on failure
      setFavorites(prev => {
        const next = new Set(prev);
        if (wasFavorited) next.add(recipeId);
        else next.delete(recipeId);
        return next;
      });
    });
  };

  return { favorites, toggle };
}
