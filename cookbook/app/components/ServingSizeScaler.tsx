'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Ingredient } from '@/lib/types';

interface Props {
  ingredients: Ingredient[];
  defaultServings: number;
}

function parseQuantity(qty: string): number {
  const mixed = qty.trim().match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3]);

  const fraction = qty.trim().match(/^(\d+)\/(\d+)$/);
  if (fraction) return parseInt(fraction[1]) / parseInt(fraction[2]);

  const num = parseFloat(qty);
  return isNaN(num) ? 0 : num;
}

function formatQuantity(value: number): string {
  if (value === 0) return '0';

  const whole = Math.floor(value);
  const decimal = value - whole;

  const fractions: [number, string][] = [
    [1 / 8, '⅛'], [1 / 4, '¼'], [1 / 3, '⅓'], [3 / 8, '⅜'],
    [1 / 2, '½'], [5 / 8, '⅝'], [2 / 3, '⅔'], [3 / 4, '¾'], [7 / 8, '⅞'],
  ];

  const tolerance = 0.07;
  const match = fractions.find(([f]) => Math.abs(decimal - f) < tolerance);

  if (Math.abs(decimal) < tolerance) return whole.toString();
  if (match && whole === 0) return match[1];
  if (match && whole > 0) return `${whole}${match[1]}`;

  return parseFloat(value.toFixed(1)).toString();
}

export default function ServingSizeScaler({ ingredients, defaultServings }: Props) {
  const [servings, setServings] = useState(defaultServings);
  const ratio = servings / defaultServings;

  return (
    <div>
      {/* Servings counter */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
        <h2 className="font-serif text-[20px] text-brown-light font-normal">Ingredients</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setServings(s => Math.max(1, s - 1))}
            className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-text-muted hover:border-copper hover:text-copper transition-colors"
          >
            <Minus size={12} />
          </button>
          <span className="text-[14px] text-brown font-medium w-20 text-center">
            {servings} {servings === 1 ? 'serving' : 'servings'}
          </span>
          <button
            onClick={() => setServings(s => s + 1)}
            className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-text-muted hover:border-copper hover:text-copper transition-colors"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Scaled ingredients */}
      <ul>
        {ingredients.map((ingredient, index) => {
          const parsed = parseQuantity(ingredient.quantity);
          const scaled = parsed > 0 ? formatQuantity(parsed * ratio) : ingredient.quantity;
          return (
            <li key={index} className="flex items-start gap-3 py-2.5 border-b border-dashed border-border last:border-0 text-[14px] text-brown-light">
              <span className="w-1.5 h-1.5 rounded-full bg-copper-light flex-shrink-0 mt-[7px]" />
              <span>
                {scaled}{ingredient.unit && ` ${ingredient.unit}`} {ingredient.name}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
