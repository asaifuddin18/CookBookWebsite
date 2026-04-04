'use client';

import { Star } from 'lucide-react';

interface Props {
  recipeId: string;
  isFavorited: boolean;
  onToggle: (recipeId: string) => void;
}

export default function FavoriteButton({ recipeId, isFavorited, onToggle }: Props) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle(recipeId);
      }}
      className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
        isFavorited
          ? 'bg-copper text-white shadow-sm'
          : 'bg-white/80 text-text-light hover:text-copper hover:bg-white'
      }`}
    >
      <Star size={13} fill={isFavorited ? 'currentColor' : 'none'} />
    </button>
  );
}
