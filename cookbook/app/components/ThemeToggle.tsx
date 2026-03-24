'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="w-9 h-9 rounded-full border border-border bg-white flex items-center justify-center hover:border-copper transition-all"
    >
      {theme === 'dark' ? (
        <Sun size={15} className="text-text-muted" />
      ) : (
        <Moon size={15} className="text-text-muted" />
      )}
    </button>
  );
}
