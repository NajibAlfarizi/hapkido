"use client";

import { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function PageTransitionLoaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(true);
    setProgress(35);

    const timer1 = setTimeout(() => setProgress(75), 120);
    const timer2 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 180);
    }, 280);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target) {
        const href = target.getAttribute('href');
        if (href && href.startsWith('/') && href !== pathname && !href.startsWith('#')) {
          setLoading(true);
          setProgress(45);
        }
      }
    };

    window.addEventListener('click', handleAnchorClick);
    return () => window.removeEventListener('click', handleAnchorClick);
  }, [pathname]);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none">
      <div
        className="h-1 bg-gradient-to-r from-hapkido-navy via-hapkido-red to-amber-400 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(230,57,70,0.8)]"
        style={{ width: `${progress}%`, opacity: progress === 100 ? 0 : 1 }}
      />
    </div>
  );
}

export default function PageTransitionLoader() {
  return (
    <Suspense fallback={null}>
      <PageTransitionLoaderContent />
    </Suspense>
  );
}
