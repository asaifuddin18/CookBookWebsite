'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Toast from './Toast';

export default function SavedToast({ isEdit }: { isEdit?: boolean }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get('saved') === '1') {
      setShow(true);
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, router, pathname]);

  if (!show) return null;
  return <Toast message={isEdit ? 'Recipe updated!' : 'Recipe saved!'} onDone={() => setShow(false)} />;
}
