import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-[800px] mx-auto px-5 lg:px-10 py-24 text-center">
      <p className="text-[64px] mb-6">🍽️</p>
      <h1 className="font-serif text-[36px] text-brown leading-tight mb-3">Page not found</h1>
      <p className="text-[15px] text-text-muted mb-8">
        This recipe might have been removed or the link is incorrect.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-copper transition-colors"
      >
        <ArrowLeft size={14} />
        Back to recipes
      </Link>
    </div>
  );
}
