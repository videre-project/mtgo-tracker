import { useMemo } from 'react';

function usePrefersColorScheme() {
  const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const prefersDark = useMemo(() => mediaQuery?.matches, [mediaQuery]);

  return prefersDark ? 'dark' : 'light';
}

export default usePrefersColorScheme;
