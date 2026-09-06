import { useCallback, useEffect, useRef, useState } from "react";

export type QueryStatus = "loading" | "success" | "error";

export interface QueryResult<T> {
  data: T | undefined;
  error: unknown;
  status: QueryStatus;
  isLoading: boolean;
  /** True while a refresh runs over data that is already on screen. */
  isRefreshing: boolean;
  refetch: () => void;
}

export interface QueryOptions {
  enabled?: boolean;
  /**
   * Keep showing the previous key's result while the new one loads.
   * On by default — it avoids a skeleton flash when only a sort or filter
   * changes. Turn it off where showing yesterday's answer would be wrong,
   * such as search suggestions.
   */
  keepPreviousData?: boolean;
}

interface Entry<T> {
  key: string;
  data: T;
}

interface Failure {
  key: string;
  error: unknown;
}

const isAbort = (error: unknown) => error instanceof DOMException && error.name === "AbortError";

/**
 * Minimal data-fetching hook: runs `fetcher` whenever `key` changes, aborts
 * the in-flight request on unmount or key change, and exposes a refetch.
 *
 * Results are tagged with the key that produced them, so a slow response can
 * never be rendered as the answer to a newer question.
 *
 * The surface intentionally matches TanStack Query's, so adopting that library
 * later is a swap of this import rather than a rewrite of every screen.
 */
export function useQuery<T>(
  key: string,
  fetcher: (signal: AbortSignal) => Promise<T>,
  options: QueryOptions = {},
): QueryResult<T> {
  const { enabled = true, keepPreviousData = true } = options;

  const [entry, setEntry] = useState<Entry<T> | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [nonce, setNonce] = useState(0);

  // Read through a ref so an inline arrow fetcher does not re-trigger the effect.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const isStale = entry !== null && entry.key !== key;
  const data = entry && (!isStale || keepPreviousData) ? entry.data : undefined;

  // Only a failure belonging to the current key is this query's error.
  const error = failure && failure.key === key ? failure.error : null;

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    let cancelled = false;

    fetcherRef
      .current(controller.signal)
      .then((result) => {
        if (cancelled) return;
        setEntry({ key, data: result });
        setFailure(null);
      })
      .catch((cause: unknown) => {
        if (cancelled || isAbort(cause)) return;
        setFailure({ key, error: cause });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [key, enabled, nonce]);

  const refetch = useCallback(() => setNonce((value) => value + 1), []);

  const status: QueryStatus = !enabled
    ? "success"
    : error !== null
      ? "error"
      : entry !== null && entry.key === key
        ? "success"
        : "loading";

  return {
    data,
    error,
    status,
    isLoading: status === "loading",
    isRefreshing: status === "success" && isStale,
    refetch,
  };
}
