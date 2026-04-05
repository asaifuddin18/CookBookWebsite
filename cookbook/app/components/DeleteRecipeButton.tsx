'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

export default function DeleteRecipeButton({ recipeId }: { recipeId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/recipes/${recipeId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      router.push('/?deleted=1');
      router.refresh();
    } catch {
      setLoading(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[13px] text-text-muted">Are you sure?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-[13px] font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 px-3 py-1.5 rounded-lg transition-colors"
        >
          {loading ? 'Deleting...' : 'Yes, delete'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-[13px] text-text-muted hover:text-brown px-3 py-1.5 rounded-lg border border-border transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1.5 border border-border text-text-muted text-[13px] font-medium px-4 py-2 rounded-lg hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
    >
      <Trash2 size={14} />
      Delete
    </button>
  );
}
