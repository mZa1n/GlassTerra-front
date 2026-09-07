import { useCallback } from "react";
import { api } from "@/api";
import { useQuery } from "@/hooks/useQuery";

/** Editable copy: news blocks and text pages. Screens never read fixtures. */

export const useArticles = () =>
  useQuery("articles", useCallback((signal) => api.content.listArticles(signal), []));

/**
 * Admin lists include drafts and accounts, so they are separate queries from
 * the public ones. `enabled` keeps them from firing a guaranteed 403 for a
 * visitor who lands on the admin route without rights.
 */
export const useAdminArticles = (enabled: boolean) =>
  useQuery("admin:articles", useCallback((signal) => api.admin.listArticles(signal), []), {
    enabled,
  });

export const useAdminPages = (enabled: boolean) =>
  useQuery("admin:pages", useCallback((signal) => api.admin.listPages(signal), []), { enabled });

export const useAdminUsers = (enabled: boolean) =>
  useQuery("admin:users", useCallback((signal) => api.admin.listUsers(signal), []), { enabled });
