/**
 * Runtime configuration. Vite inlines `import.meta.env` at build time, so
 * every value here is a build-time constant — nothing secret belongs in it.
 */
export const env = {
  /**
   * Base URL of the REST backend, e.g. "https://api.glassterra.ru/v1".
   * Empty (the default) keeps the app on the in-memory mock transport.
   */
  apiUrl: (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, ""),

  /** Artificial latency for the mock transport, in ms. */
  mockLatency: Number(import.meta.env.VITE_MOCK_LATENCY ?? 250),

  isDev: import.meta.env.DEV,
} as const;

export const usingRealBackend = env.apiUrl.length > 0;
