import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useState backed by localStorage.
 *
 * Reads once during the lazy initialiser (no first-render flash of empty state)
 * and writes on every change. Every access is guarded: private-mode browsers and
 * blocked site data throw on access rather than returning null.
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T,
  validate?: (value: unknown) => value is T,
) {
  const validateRef = useRef(validate);
  validateRef.current = validate;

  const [state, setState] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initialValue;

      const parsed: unknown = JSON.parse(raw);
      if (validateRef.current && !validateRef.current(parsed)) return initialValue;
      return parsed as T;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Storage full or unavailable — the app keeps working in memory.
    }
  }, [key, state]);

  const reset = useCallback(() => {
    setState(initialValue);
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    // initialValue is only read on reset, so an unstable literal is harmless here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [state, setState, reset] as const;
}

export const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((item) => typeof item === "number");
