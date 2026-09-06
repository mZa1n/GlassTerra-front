import { env } from "@/lib/env";
import { ApiError } from "@/api/errors";
import { getToken, notifyTokenExpired } from "@/api/tokens";

const DEFAULT_TIMEOUT_MS = 15_000;

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  /** Serialised as a query string; `undefined` values are dropped. */
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
  /** Skip the Authorization header (login, register, public catalog). */
  anonymous?: boolean;
}

function buildUrl(path: string, params?: RequestOptions["params"]) {
  const url = new URL(`${env.apiUrl}${path.startsWith("/") ? path : `/${path}`}`);

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  return url.toString();
}

async function parseError(response: Response): Promise<ApiError> {
  let message = response.statusText || "Ошибка запроса";
  let code: string | undefined;
  let details: unknown;

  try {
    const payload = (await response.json()) as {
      message?: string;
      error?: string;
      code?: string;
      details?: unknown;
    };
    message = payload.message ?? payload.error ?? message;
    code = payload.code;
    details = payload.details;
  } catch {
    /* non-JSON error body */
  }

  return new ApiError(message, response.status, code, details);
}

/**
 * The single place the app talks HTTP. Adds the base URL, auth header,
 * JSON handling, a timeout and uniform errors.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", params, body, signal, timeoutMs = DEFAULT_TIMEOUT_MS, anonymous } = options;

  // Caller-supplied abort and our timeout both need to cancel the request.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  if (signal?.aborted) controller.abort();
  else signal?.addEventListener("abort", () => controller.abort(), { once: true });

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = anonymous ? null : getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
      credentials: "include",
    });
  } catch (cause) {
    if (signal?.aborted) throw cause;
    throw new ApiError("Сервер не отвечает", 0, "network", cause);
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 401 && !anonymous) notifyTokenExpired();
  if (!response.ok) throw await parseError(response);
  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}
