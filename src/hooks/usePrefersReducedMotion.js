import { useMemo } from 'react';

function usePrefersReducedMotion() {
  const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const reduceMotion = useMemo(() => mediaQuery?.matches, [mediaQuery]);

  return reduceMotion;
}

export default usePrefersReducedMotion;
