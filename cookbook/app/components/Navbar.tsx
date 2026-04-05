'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-cream/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-5 lg:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-[22px] tracking-tight font-medium">
          <span className="text-brown">Saifuddin&apos;s </span><span className="text-copper">Kitchen</span>
        </Link>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              {session.user?.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt={session.user.name || ''} className="w-8 h-8 rounded-full border border-border" />
              )}
              <button
                onClick={() => signOut()}
                className="text-[13px] text-text-muted hover:text-copper transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="text-[13px] text-text-muted hover:text-copper transition-colors"
            >
              Sign in
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
