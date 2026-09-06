import { useSyncExternalStore } from "react";

/**
 * Subscribes to a media query via useSyncExternalStore, so the value stays
 * consistent with React's rendering rather than lagging a frame behind.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (onChange: () => void) => {
    const list = window.matchMedia(query);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  };

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
