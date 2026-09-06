/**
 * Access-token storage.
 *
 * Deliberately isolated: when the backend switches to httpOnly refresh
 * cookies, only this file and `http.ts` change.
 */
const KEY = "glassterra:token";

let inMemory: string | null = null;
let onExpired: (() => void) | null = null;

export function getToken(): string | null {
  if (inMemory !== null) return inMemory;
  try {
    inMemory = window.localStorage.getItem(KEY);
  } catch {
    inMemory = null;
  }
  return inMemory;
}

export function setToken(token: string | null) {
  inMemory = token;
  try {
    if (token) window.localStorage.setItem(KEY, token);
    else window.localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable — the token still works for this tab */
  }
}

/** Registered by AuthProvider so a 401 can drop the session everywhere at once. */
export function onTokenExpired(handler: (() => void) | null) {
  onExpired = handler;
}

export function notifyTokenExpired() {
  setToken(null);
  onExpired?.();
}
