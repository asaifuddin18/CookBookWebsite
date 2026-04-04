'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5">
      <div className="text-center max-w-[360px]">
        <span className="inline-block bg-brown text-cream text-[10px] tracking-[2.5px] uppercase font-medium px-3.5 py-1.5 rounded-sm mb-5">
          Community Cookbook
        </span>
        <h1 className="font-serif text-[32px] text-brown leading-tight mb-3">
          Sign in to continue
        </h1>
        <p className="text-[15px] text-text-muted mb-8 leading-relaxed">
          You need to be signed in to add, edit, or delete recipes.
        </p>
        <button
          onClick={() => signIn('google', { callbackUrl })}
          className="inline-flex items-center gap-3 bg-white border border-border hover:border-copper text-brown text-[14px] font-medium px-6 py-3 rounded-lg transition-all hover:-translate-y-px shadow-sm w-full justify-center"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}
