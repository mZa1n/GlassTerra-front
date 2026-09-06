import { useCallback, useRef, useState } from "react";

export interface MutationResult<TInput, TResult> {
  mutate: (input: TInput) => Promise<TResult>;
  isPending: boolean;
  error: unknown;
  reset: () => void;
}

/**
 * Wraps a one-off write (login, checkout, profile update) with pending and
 * error state. Out-of-order responses are discarded so a slow first call
 * cannot overwrite the result of a later one.
 */
export function useMutation<TInput, TResult>(
  action: (input: TInput, signal: AbortSignal) => Promise<TResult>,
): MutationResult<TInput, TResult> {
  const [isPending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const callId = useRef(0);

  const mutate = useCallback(
    async (input: TInput) => {
      const id = ++callId.current;
      const controller = new AbortController();

      setPending(true);
      setError(null);

      try {
        const result = await action(input, controller.signal);
        return result;
      } catch (cause) {
        if (id === callId.current) setError(cause);
        throw cause;
      } finally {
        if (id === callId.current) setPending(false);
      }
    },
    [action],
  );

  const reset = useCallback(() => setError(null), []);

  return { mutate, isPending, error, reset };
}
