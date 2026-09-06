/** Everything the UI needs to decide what to show when a request fails. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** 401/403 — the session is gone or insufficient. */
  get isAuth() {
    return this.status === 401 || this.status === 403;
  }

  /** No response at all: offline, DNS, CORS, timeout. */
  get isNetwork() {
    return this.status === 0;
  }

  get isServer() {
    return this.status >= 500;
  }
}

/** User-facing message. Never leak raw backend strings for 5xx. */
export function messageFor(error: unknown): string {
  if (!(error instanceof ApiError)) return "Непредвиденная ошибка. Попробуйте ещё раз.";
  if (error.isNetwork) return "Нет связи с сервером. Проверьте подключение.";
  if (error.isServer) return "Сервер временно недоступен. Попробуйте позже.";
  return error.message;
}
