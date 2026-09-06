import { useEffect, useState } from "react";

/**
 * Trails `value` by `delay` ms. Keeps the search from firing a request on
 * every keystroke while still feeling immediate.
 */
export function useDebounced<T>(value: T, delay = 150): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
