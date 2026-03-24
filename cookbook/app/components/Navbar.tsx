'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useSearch } from './SearchProvider';

export default function Navbar() {
  const { searchQuery, setSearchQuery } = useSearch();
  const [searchOpen, setSearchOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
      if (localQuery.trim() && pathname !== '/') {
        router.push('/');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery, pathname, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localQuery);
    if (pathname !== '/') router.push('/');
    setSearchOpen(false);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setLocalQuery('');
    setSearchQuery('');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border" style={{ background: 'rgba(253,250,245,0.92)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-7xl mx-auto px-5 lg:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-[22px] text-brown tracking-tight font-medium">
          Cook<span className="text-copper">book</span>
        </Link>

        <div className="flex items-center gap-3">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Search recipes..."
                className="w-48 sm:w-64 px-4 py-2 text-sm border border-border rounded-full bg-white text-brown placeholder:text-text-light outline-none focus:border-copper transition-colors"
              />
              <button type="button" onClick={closeSearch} className="text-text-muted hover:text-copper transition-colors">
                <X size={18} />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 rounded-full border border-border bg-white flex items-center justify-center hover:border-copper transition-colors"
            >
              <Search size={15} className="text-text-muted" />
            </button>
          )}
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
