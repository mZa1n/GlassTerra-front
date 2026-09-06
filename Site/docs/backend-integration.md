# Backend integration plan

The storefront already runs entirely through an async data layer. Today that
layer is served by an in-memory mock; switching to a real API is a matter of
setting one environment variable and making the server match the contract
below. No component, page, or context needs to change.

```
VITE_API_URL=https://api.glassterra.ru/v1
```

With the variable unset the app uses `src/api/transport/mock.ts`, which serves
the fixture in `src/data/products.ts` with artificial latency. That is what
keeps the loading, empty and error states exercised during development.

---

## 1. How the layer is put together

```
src/api/
  index.ts            picks the transport from VITE_API_URL
  types.ts            the Backend interface — the contract both sides implement
  http.ts             fetch wrapper: base URL, auth header, timeout, errors
  dto.ts              wire shapes and their mappers to domain types
  errors.ts           ApiError + user-facing messages
  tokens.ts           access-token storage and expiry notification
  transport/
    http.ts           REST implementation
    mock.ts           in-memory implementation
```

Rules that keep it maintainable:

- **Screens never import a transport.** They call `api.*` or, better, one of
  the typed hooks in `src/hooks/catalog.ts`.
- **URLs live in one file.** Only `transport/http.ts` knows the paths.
- **Field renames stay in `dto.ts`.** If the backend returns `old_price`
  instead of `oldPrice`, the mapper absorbs it; nothing else moves.
- **The mock and the HTTP transport share the filter rules** from
  `src/lib/catalog.ts`, so the two can never disagree about what "новинки" or
  "со скидкой" means.

## 2. Proposed REST contract

All responses are JSON. Errors use
`{ "message": string, "code"?: string, "details"?: unknown }` with a matching
HTTP status; `http.ts` turns them into `ApiError`.

### Catalog (public)

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/categories` | `CategoryDto[]`, includes `product_count` |
| `GET` | `/products` | Query: `filter`, `sort`, `q`, `page`, `per_page`. Returns `PaginatedDto<ProductDto>` |
| `GET` | `/products/{slug}` | `ProductDto` — for the future product page |
| `GET` | `/products/batch?ids=1,2,3` | `ProductDto[]` — hydrates cart, favourites, comparison |
| `GET` | `/products/suggest?q=&limit=` | `ProductDto[]` — search autocomplete |

`filter` is the string produced by `filterKey()`: `all`, `new`, `sale`, or
`category:<id>`. `sort` is one of `popular`, `price-asc`, `price-desc`,
`rating`.

### Auth

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/auth/register` | `{ name, email, phone, password }` → `{ token, user }` |
| `POST` | `/auth/login` | `{ email, password }` → `{ token, user }` |
| `GET` | `/auth/me` | Restores the session from a stored token |
| `PATCH` | `/auth/me` | Partial profile update |
| `POST` | `/auth/logout` | Invalidates the token server-side |

### Cart, orders, content

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/cart` | `{ items: [{ product_id, quantity }] }` |
| `PUT` | `/cart` | Replaces the whole cart; same shape |
| `POST` | `/orders` | Checkout; returns `OrderDto` |
| `GET` | `/orders` | Order history |
| `GET` | `/pages/{slug}` | Static page copy, or `null` |

## 3. Rollout order

Each step is independently shippable, and the app keeps working between them.

**Step 1 — catalog, read-only.** Implement `/categories`, `/products`,
`/products/batch`, `/products/suggest`. Seed the database from
`src/data/products.ts`. Set `VITE_API_URL` in staging. The catalog, search,
home page, favourites and comparison all switch over at once, because they
already read through `api.catalog`.

**Step 2 — auth.** Implement the five auth endpoints. The client already
stores the token in `src/api/tokens.ts`, sends it as `Authorization: Bearer`,
and drops the session on a `401`. Prefer moving to an httpOnly refresh cookie
before launch: that changes `tokens.ts` and the `credentials` option in
`http.ts` and nothing else.

**Step 3 — orders.** Implement `POST /orders` and `GET /orders`. The cart page
already calls checkout through `useMutation` and shows pending state; the
profile page already renders order history.

**Step 4 — server-side cart.** `api.cart` is defined but not yet wired into a
screen. When the backend is ready, merge on sign-in: read the guest cart from
`useStore().cartLines`, `PUT` the merged result, then `replaceCart()` with the
server's answer. That merge is the only new client code this step needs.

**Step 5 — content.** Move the copy from `src/data/content.ts` into the CMS
and serve it from `/pages/{slug}`. `StaticPage` already fetches it.

## 4. Things to decide before Step 1

- **Pagination or infinite scroll.** `ProductQuery` already carries `page` and
  `perPage`, and the response carries `total`; the catalog page currently
  requests one page and shows everything. Add the control once real volume
  exists.
- **Image hosting.** Products carry a single `image_url`. If the backend
  returns multiple sizes, extend `ProductDto` with a `images` array and widen
  `Product` — one mapper change plus the card's `src`.
- **Category ids.** The client's `CategoryId` union is compile-time checked.
  If categories become dynamic, relax it to `string` in `src/lib/types.ts` and
  the `sameFilter` comparison keeps working unchanged.
- **Stock and price freshness.** The cart deliberately stores only ids and
  quantities, so prices are re-read on every visit. Keep the server
  authoritative on price at checkout and reject mismatched totals.

## 5. Optional: adopt TanStack Query

`src/hooks/useQuery.ts` deliberately mirrors TanStack Query's surface
(`data`, `error`, `status`, `isLoading`, `refetch`). If the app grows to need
shared caching, background refetching or optimistic updates, the migration is:

1. `npm i @tanstack/react-query`
2. Wrap the tree in `QueryClientProvider` in `src/App.tsx`.
3. Replace the import in `src/hooks/catalog.ts` and rename the call signature
   to `useQuery({ queryKey, queryFn })`.
4. Delete `src/hooks/useQuery.ts` and `src/hooks/useMutation.ts`.

Screens do not change, because they consume the typed hooks rather than the
generic one.

## 6. Checklist for the day the API lands

- [ ] `VITE_API_URL` set per environment (`.env.local`, CI, hosting)
- [ ] CORS allows the storefront origin, with credentials if cookies are used
- [ ] Error bodies follow `{ message, code }`
- [ ] `product.slug` values match the ones in the fixture, or redirects exist
- [ ] `401` responses are returned for expired tokens, not `403`
- [ ] Rate limiting on `/products/suggest` (fires on every keystroke)
- [ ] Compare a staging run against the mock: same screens, same states
