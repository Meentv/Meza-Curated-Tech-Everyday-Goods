import { useCallback, useEffect, useRef } from 'react';

/** Classic debounce: wait until the user pauses for `ms` before running fn. */
export function useDebouncedCallback(fn, ms) {
  const timer = useRef(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => () => clearTimeout(timer.current), []);

  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fnRef.current(...args), ms);
  }, [ms]);
}
