'use client';

import { useState } from 'react';
import { Link, Check } from 'lucide-react';

export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 border border-border text-text-muted text-[13px] font-medium px-4 py-2 rounded-lg hover:border-copper hover:text-copper transition-all"
    >
      {copied ? <Check size={14} /> : <Link size={14} />}
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  );
}
