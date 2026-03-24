import Link from 'next/link';
import RecipeForm from '../../components/RecipeForm';
import { ArrowLeft } from 'lucide-react';

export default function NewRecipePage() {
  return (
    <div className="max-w-[680px] mx-auto px-5 lg:px-10 py-8 pb-16">
      <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-copper transition-colors mb-6">
        <ArrowLeft size={14} />
        Back to recipes
      </Link>
      <h1 className="font-serif text-[32px] text-brown font-normal mb-1">Add new recipe</h1>
      <p className="text-[15px] text-text-muted mb-8">Share your favorite recipe with the community</p>
      <RecipeForm />
    </div>
  );
}
