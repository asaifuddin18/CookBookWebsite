'use client';

import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border" style={{ background: 'rgba(253,250,245,0.92)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-7xl mx-auto px-5 lg:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-[22px] text-brown tracking-tight font-medium">
          Cook<span className="text-copper">book</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/recipes/new"
            className="bg-copper hover:bg-copper-dark text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-all hover:-translate-y-px inline-flex items-center gap-1.5"
          >
            + Add recipe
          </Link>
        </div>
      </div>
    </nav>
  );
}
