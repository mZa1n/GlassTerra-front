import { mockBackend } from "@/api/transport/mock";
import { httpBackend } from "@/api/transport/http";
import { env, usingRealBackend } from "@/lib/env";
import type { Backend } from "@/api/types";

/**
 * The app's only entry point to server data.
 *
 * Set VITE_API_URL to switch the whole storefront onto the REST backend;
 * with it unset the in-memory transport serves the bundled fixture.
 */
export const api: Backend = usingRealBackend ? httpBackend : mockBackend;

if (env.isDev) {
  console.info(
    usingRealBackend ? `[api] HTTP backend: ${env.apiUrl}` : "[api] mock backend (no VITE_API_URL)",
  );
}

export { ApiError, messageFor } from "@/api/errors";
export type {
  ArticleInput,
  Backend,
  CartLine,
  CategoryInput,
  Credentials,
  PageSummary,
  ProductInput,
  RegisterInput,
  Session,
  UserPatch,
} from "@/api/types";
