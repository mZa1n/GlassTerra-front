# Glassterra

Tableware storefront. **The application is `Site/`** — the repository root is
only a PyCharm project shell, so `cd Site` before running anything.

Read these before asking the user to re-explain the project:

- `Site/docs/project-status.md` — what exists, what is missing, open decisions.
- `Site/docs/backend-integration.md` — REST contract and rollout plan for the
  planned NestJS + Prisma + Postgres + OAuth2/OIDC backend.

## Commands

```bash
cd Site
npm run dev        # port comes from $PORT, defaults to 3000
npm run build      # tsc --noEmit && vite build — use this as the gate
npm run typecheck
```

There is no backend yet. `VITE_API_URL` unset means the app runs on the
in-memory mock in `src/api/transport/mock.ts`.

## Language

- Code, comments, commit messages: **English**.
- UI copy and `Site/docs/*`: **Russian**.

Do not translate UI strings to English, and do not leave Russian comments in
code.

## Architecture rules

These are what keep the data layer swappable. Breaking them is how the
duplicated, drifted product data happened the first time.

- **Screens never import a transport.** They call the typed hooks in
  `src/hooks/catalog.ts`; those call `api.*`; `src/api/index.ts` picks the
  transport.
- **Endpoint paths live only in `src/api/transport/http.ts`.**
- **Wire-format differences are absorbed in `src/api/dto.ts`.** A backend field
  rename is a one-line change there, never a refactor across components.
- **Product data has one source**, `src/data/products.ts`. Category ids are the
  `CategoryId` union and catalog filters are the `CatalogFilter` tagged union,
  so a filter cannot name a category that does not exist. Keep it that way.
- The mock and the HTTP transport share filter and sort rules from
  `src/lib/catalog.ts` so they cannot disagree.

## Styling

- **Use design tokens, not literal colours.** `bg-card`, `text-muted-foreground`,
  `border`, `text-primary`, `text-success`, `bg-surface-strong`. Tokens are
  defined once in `src/styles/globals.css` for both themes; a hardcoded
  `slate-900` breaks dark mode silently, which it already did once in the
  footer.
- The palette is warm neutrals with terracotta as the single accent. Red is for
  discounts, green for stock. Do not introduce a fourth accent hue.
- Every colour needs a dark-theme answer. Check both.

## `components/ui/`

Upstream shadcn/ui, unmodified in style. It targets **React 19, where `ref` is
a normal prop** and `{...props}` forwards it. Do not add `forwardRef` wrappers
— that was needed only on React 18 and has been removed.

Only the 15 components actually in use are kept. Add more with `shadcn add`
rather than hand-writing them.

## Before saying something works

Run `npm run build` — it typechecks. For anything user-visible, also drive it
in the browser and look. Several defects in this project typecheck cleanly and
only appear at runtime: a missing `ref` silently dropped form values, a sheet
without a scroll container was unreachable on short screens, headings rendered
at body weight.

Note when verifying in the in-app browser: if the Browser pane is hidden the
page is not painted, so animations never fire and screenshots come back blank.
Radix dialogs then appear "stuck open" — that is the harness, not a bug.

## Git

Commits are English, imperative, and explain **why**, not just what.

**Do not push.** GitHub access is not configured: no HTTPS credentials are
stored and the local SSH key is not attached to the account. Commits accumulate
on local `main` until the user says access is set up.
