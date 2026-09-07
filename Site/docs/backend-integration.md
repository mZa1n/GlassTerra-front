# Подключение бэкенда

Стек: **NestJS + Prisma + PostgreSQL + OAuth2/OpenID Connect**.

Документ на русском, потому что это рабочая спецификация для команды.
Идентификаторы, пути, SQL и код — как есть.

---

## 0. Короткая версия

Фронтенд уже работает через асинхронный слой данных. Сейчас его обслуживает
мок в памяти. Переключение на настоящий API — это одна переменная окружения:

```bash
VITE_API_URL=https://api.glassterra.ru/v1
```

Пока переменная пуста, приложение использует `src/api/transport/mock.ts` —
он отдаёт фикстуру из `src/data/products.ts` с искусственной задержкой.
Именно поэтому состояния загрузки, ошибок и пустых списков не гниют.

Что уже готово со стороны фронта:

| Готово | Где |
| --- | --- |
| Интерфейс `Backend` — контракт для обеих сторон | `src/api/types.ts` |
| REST-транспорт: пути, заголовки, таймауты, отмена | `src/api/transport/http.ts` |
| Преобразование DTO → доменные типы | `src/api/dto.ts` |
| Единый тип ошибки и тексты для пользователя | `src/api/errors.ts` |
| Скелетоны, пустые состояния, повтор запроса | `src/components/QueryState.tsx` |
| Кеш по ключу, отмена устаревших ответов | `src/hooks/useQuery.ts` |

**Ни один компонент и ни одна страница при переключении не меняются.**
Исключение — авторизация: OIDC ломает текущий контракт, см. раздел 2.

---

## 1. Как устроен слой данных

```
src/api/
  index.ts            выбирает транспорт по VITE_API_URL
  types.ts            интерфейс Backend — контракт
  http.ts             обёртка над fetch: база, заголовки, таймаут, ошибки
  dto.ts              формы данных «с провода» и мапперы в доменные типы
  errors.ts           ApiError + тексты для пользователя
  tokens.ts           хранение access-токена и уведомление об истечении
  transport/
    http.ts           реализация поверх REST
    mock.ts           реализация в памяти
```

Три правила, которые держат это в порядке:

1. **Экраны не импортируют транспорт.** Только `api.*` или типизированные
   хуки из `src/hooks/catalog.ts`.
2. **Пути живут в одном файле** — `transport/http.ts`.
3. **Переименования полей — только в `dto.ts`.** Если сервер отдаёт
   `old_price` вместо `oldPrice`, это правится в одном маппере.

---

## 2. Что меняет OAuth2 / OpenID Connect

Это самая важная часть: **текущий контракт авторизации несовместим с OIDC** и
его нужно менять осознанно, а не «подогнать».

Сейчас в `src/api/types.ts` объявлено:

```ts
auth: {
  login(credentials: Credentials): Promise<Session>;    // email + пароль
  register(input: RegisterInput): Promise<Session>;     // email + пароль
  ...
}
```

При OIDC пароль **никогда не должен доходить до витрины**. Логин и регистрация
происходят на стороне провайдера идентификации (Keycloak, Authentik, Ory
Hydra, Яндекс ID, VK ID — что выберете). Значит:

- `AuthDialog` с формами «Вход» и «Регистрация» (`src/components/auth/`)
  теряет смысл и удаляется;
- вместо него — одна кнопка «Войти», которая уводит на провайдера;
- `login` и `register` из контракта уходят, появляются `beginLogin` и
  `completeLogin`.

### 2.1. Выберите одну из двух моделей

**Вариант A — BFF (рекомендую).** Nest сам проводит весь OIDC-обмен и ставит
httpOnly-cookie сессии. Браузер никогда не видит токенов.

```
Браузер          Nest (BFF)                 Провайдер (OIDC)
  │  GET /auth/login │                              │
  │─────────────────>│  302 на /authorize + PKCE    │
  │<────────────────────────────────────────────────│
  │  вход у провайдера                              │
  │────────────────────────────────────────────────>│
  │  302 /auth/callback?code=…                      │
  │─────────────────>│  обмен code → tokens (server)│
  │                  │─────────────────────────────>│
  │<─ Set-Cookie: sid (httpOnly, Secure, SameSite=Lax)
```

Плюсы: токен недоступен XSS, refresh прозрачен, фронт не хранит ничего.
Минусы: нужен sticky-session или общее хранилище сессий (Redis) при
нескольких инстансах.

Что меняется на фронте:
- `src/api/tokens.ts` **удаляется целиком**;
- в `src/api/http.ts` убирается заголовок `Authorization` — там уже стоит
  `credentials: "include"`, этого достаточно;
- `AuthProvider` вместо `login()` делает
  `window.location.href = ${API}/auth/login`.

**Вариант B — публичный SPA-клиент с PKCE.** Фронт сам ходит к провайдеру,
держит access-токен в памяти, обновляет через rotating refresh token.

Что меняется на фронте:
- `tokens.ts` остаётся, но **перестаёт писать в `localStorage`** — токен
  живёт только в памяти, иначе он доступен любому XSS;
- добавляется тихий рефреш перед истечением и повтор запроса при `401`;
- нужен маршрут `/auth/callback` в приложении.

> Если нет жёсткого требования держать SPA независимой от бэкенда — берите A.
> Для интернет-магазина это меньше кода и заметно меньше рисков.

### 2.2. Новый контракт авторизации

Замените блок `auth` в `src/api/types.ts` на такой (вариант A):

```ts
auth: {
  /** Абсолютный URL, куда увести браузер для входа. */
  loginUrl(returnTo?: string): string;
  /** Текущий пользователь по cookie сессии; 401 → не авторизован. */
  me(signal?: AbortSignal): Promise<User>;
  updateProfile(patch: Partial<Omit<User, "id" | "email">>, signal?: AbortSignal): Promise<User>;
  logout(signal?: AbortSignal): Promise<void>;
}
```

`register` не нужен: аккаунт создаётся у провайдера при первом входе.
Профиль (`name`, `phone`, `address`) остаётся в вашей БД и правится через
`PATCH /auth/me`.

### 2.3. Связь пользователя провайдера и записи в БД

Не используйте `email` как первичный ключ — он меняется. Храните пару
«issuer + subject»:

```prisma
model User {
  id        String   @id @default(uuid())
  issuer    String   // iss из ID-токена
  subject   String   // sub из ID-токена
  email     String
  name      String
  phone     String?
  address   String?
  createdAt DateTime @default(now())

  orders    Order[]
  cart      CartItem[]
  reviews   Review[]

  @@unique([issuer, subject])
  @@index([email])
}
```

При первом входе — upsert по `[issuer, subject]`. Это же позволит позже
подключить второго провайдера без миграции данных.

---

## 3. Схема Prisma

Минимальная схема, покрывающая всё, что уже рисует фронт.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Category {
  /** Слаг: glasses, mugs, bowls, pitchers, plates, teasets, decor. */
  id       String    @id
  name     String
  imageUrl String
  sortOrder Int      @default(0)

  products Product[]
}

model Product {
  id          Int      @id @default(autoincrement())
  slug        String   @unique
  name        String
  description String
  price       Decimal  @db.Money
  oldPrice    Decimal? @db.Money
  inStock     Boolean  @default(true)
  isNew       Boolean  @default(false)
  /** Пары «характеристика → значение», порядок сохраняется в JSONB. */
  specs       Json     @default("{}")
  imageUrl    String
  images      String[] @default([])
  createdAt   DateTime @default(now())

  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])

  reviews     Review[]
  orderItems  OrderItem[]
  cartItems   CartItem[]

  @@index([categoryId])
  @@index([isNew])
  @@index([createdAt])
}

model Review {
  id        String   @id @default(uuid())
  rating    Int      // 1..5
  text      String
  createdAt DateTime @default(now())

  productId Int
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id])

  @@unique([productId, userId])   // один отзыв на товар от пользователя
  @@index([productId, createdAt])
}

model CartItem {
  userId    String
  productId Int
  quantity  Int      @default(1)
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id])

  @@id([userId, productId])
}

model Order {
  id              String      @id @default(uuid())
  /** Человекочитаемый номер для писем и поддержки. */
  number          String      @unique
  status          OrderStatus @default(CREATED)
  /** Сумма фиксируется на момент оформления. */
  total           Decimal     @db.Money
  deliveryAddress String
  phone           String
  comment         String?
  createdAt       DateTime    @default(now())

  userId          String
  user            User        @relation(fields: [userId], references: [id])
  items           OrderItem[]

  @@index([userId, createdAt])
}

model OrderItem {
  id        String  @id @default(uuid())
  /** Название и цена копируются: карточка потом может измениться. */
  name      String
  price     Decimal @db.Money
  quantity  Int

  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId Int
  product   Product @relation(fields: [productId], references: [id])
}

enum OrderStatus {
  CREATED
  PAID
  SHIPPED
  DELIVERED
  CANCELLED
}
```

Два момента, которые экономят боль потом:

- **`rating` и `reviewsCount` у товара не хранятся полем.** Считайте
  агрегатом (`_avg`, `_count`) или материализованным представлением,
  обновляемым триггером. Денормализованное поле почти всегда разъезжается.
- **Цена в `Decimal`/`money`, не в `Float`.** На фронте цена — `number` в
  рублях без копеек; в мапперe `dto.ts` при необходимости приведите.

---

## 4. Модули NestJS

```
src/
  catalog/      CatalogController, CatalogService     — публичный
  reviews/      ReviewsController, ReviewsService
  auth/         AuthController, OidcStrategy, SessionGuard
  users/        UsersController (профиль)
  cart/         CartController, CartService           — защищённый
  orders/       OrdersController, OrdersService       — защищённый
  content/      ContentController                     — публичный
  prisma/       PrismaService
```

Полезные умолчания:

- `ValidationPipe({ whitelist: true, transform: true })` глобально — иначе
  лишние поля из тела запроса доедут до Prisma.
- `ClassSerializerInterceptor` + DTO-классы на выход. Не отдавайте наружу
  модели Prisma напрямую: в `User` лежат `issuer`/`subject`.
- Фильтр исключений, приводящий всё к форме, которую ждёт фронт:

```ts
// { message: string, code?: string, details?: unknown }
@Catch()
export class ApiExceptionFilter implements ExceptionFilter { /* ... */ }
```

`src/api/errors.ts` на фронте разбирает именно эту форму и превращает в
`ApiError` с человеческим текстом. Не отдавайте массив строк в `message` —
Nest так делает по умолчанию для ошибок валидации, приведите к строке.

---

## 5. Контракт REST

Базовый путь — тот, что в `VITE_API_URL`. Все ответы — JSON.
«Защищено» означает: требуется сессия (вариант A) или Bearer (вариант B),
иначе `401`.

### Каталог — публично

| Метод | Путь | Ответ |
| --- | --- | --- |
| `GET` | `/categories` | `CategoryDto[]`, с `product_count` |
| `GET` | `/products` | `PaginatedDto<ProductDto>` |
| `GET` | `/products/{slug}` | `ProductDto` |
| `GET` | `/products/batch?ids=1,2,3` | `ProductDto[]` |
| `GET` | `/products/suggest?q=&limit=` | `ProductDto[]` |
| `GET` | `/products/{id}/reviews` | `ReviewDto[]` |

Параметры `/products`:

| Параметр | Значения |
| --- | --- |
| `filter` | `all`, `new`, `sale`, `category:<id>` |
| `sort` | `popular`, `price-asc`, `price-desc`, `rating` |
| `q` | строка поиска; при непустом `q` сортировка — по релевантности |
| `page` | с 1 |
| `per_page` | по умолчанию — все |

Строку `filter` формирует `filterKey()` из `src/lib/catalog.ts` — не
придумывайте свой формат, иначе мок и сервер разойдутся в понимании того,
что такое «новинки».

### Авторизация и профиль

| Метод | Путь | Примечание |
| --- | --- | --- |
| `GET` | `/auth/login?return_to=` | 302 на провайдера, PKCE + `state` |
| `GET` | `/auth/callback` | Обмен `code`, `Set-Cookie`, 302 обратно |
| `GET` | `/auth/me` | Защищено. `UserDto` |
| `PATCH` | `/auth/me` | Защищено. `{ name?, phone?, address? }` |
| `POST` | `/auth/logout` | Защищено. Гасит сессию, при необходимости RP-initiated logout у провайдера |

### Корзина, заказы, контент

| Метод | Путь | Примечание |
| --- | --- | --- |
| `GET` | `/cart` | Защищено. `{ items: [{ product_id, quantity }] }` |
| `PUT` | `/cart` | Защищено. Заменяет корзину целиком |
| `POST` | `/orders` | Защищено. Оформление, возвращает `OrderDto` |
| `GET` | `/orders` | Защищено. История |
| `GET` | `/pages/{slug}` | Публично. Текст страницы или `null` |

### Формат ошибок

```json
{ "message": "Товара нет в наличии", "code": "out_of_stock" }
```

Коды, которые фронт различает: `unauthorized` (`401`), `not_found` (`404`),
`validation` (`422`). Остальное показывается как общая ошибка с кнопкой
«Повторить».

---

## 6. Поиск в Postgres

Сейчас ранжирование живёт на клиенте (`src/lib/search.ts`): совпадение по
началу слова весит больше, чем внутри слова, название важнее описания, есть
запасной проход с исправлением раскладки (`rhe;rf` → «кружка»).

Когда поиск переедет на сервер, эту логику надо воспроизвести — иначе
результаты в подсказках и на странице разойдутся.

Рабочая связка для русского каталога — `pg_trgm` плюс префиксный поиск:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE "Product"
  ADD COLUMN search_text text
  GENERATED ALWAYS AS (name || ' ' || description) STORED;

CREATE INDEX product_search_trgm
  ON "Product" USING gin (search_text gin_trgm_ops);
```

Запрос с ранжированием, близким к клиентскому:

```sql
SELECT p.*,
       GREATEST(
         CASE WHEN p.name ILIKE $1 || '%'        THEN 1.0 ELSE 0 END,
         CASE WHEN p.name ILIKE '% ' || $1 || '%' THEN 0.7 ELSE 0 END,
         CASE WHEN p.name ILIKE '%' || $1 || '%'  THEN 0.35 ELSE 0 END,
         similarity(p.search_text, $1) * 0.3
       ) AS score
FROM "Product" p
WHERE p.search_text ILIKE '%' || $1 || '%'
   OR similarity(p.search_text, $1) > 0.2
ORDER BY score DESC, length(p.name) ASC
LIMIT $2;
```

Через Prisma это `$queryRaw` — обычный `findMany` так не умеет.

Что остаётся на клиенте в любом случае: **подсветка совпадений**. Сервер не
знает, какие символы подсветить, поэтому `highlightRanges()` считает диапазоны
локально по строке запроса. Ничего менять не нужно.

Исправление раскладки лучше делать на сервере тем же приёмом: если по запросу
ноль результатов — перевести по таблице `qwerty → йцукен` и повторить.
Таблица есть в `src/lib/search.ts`, константа `LAYOUT_EN_TO_RU`.

Отдельно: `/products/suggest` дёргается на каждое нажатие клавиши (на фронте
стоит дебаунс 150 мс). Поставьте на этот путь рейт-лимит.

---

## 7. Одно решение, которое нужно принять до старта

**snake_case или camelCase на проводе.**

Сейчас `src/api/dto.ts` ожидает snake_case (`old_price`, `image_url`,
`reviews_count`). Prisma и Nest естественно отдают camelCase.

Два пути:

- Оставить snake_case: в Nest нужен интерцептор-сериализатор либо ручные
  выходные DTO. Мапперы на фронте не трогаем.
- Перейти на camelCase: правится только `src/api/dto.ts` — тела мапперов
  становятся почти тождественными, часть можно удалить.

**Рекомендую camelCase.** Один слой преобразования исчезает совсем, а обе
стороны на TypeScript. Это правка одного файла на фронте, полчаса работы.

---

## 8. Порядок внедрения

Каждый шаг самостоятелен, между шагами приложение работает.

**Шаг 1 — каталог, только чтение.**
Эндпоинты: `/categories`, `/products`, `/products/batch`,
`/products/suggest`, `/products/{id}/reviews`.
Сид базы — из `src/data/products.ts` и `src/data/reviews.ts`.
Ставим `VITE_API_URL` на стенде. Разом переезжают главная, каталог, поиск,
избранное, сравнение и модалка товара — они уже читают через `api.catalog`.

**Шаг 2 — авторизация.**
Поднять провайдера, реализовать `/auth/*` по выбранной модели (раздел 2).
На фронте: удалить `AuthDialog`, переписать `AuthProvider` на редирект,
удалить или урезать `tokens.ts`.
Это единственный шаг, который трогает UI.

**Шаг 3 — заказы.**
`POST /orders`, `GET /orders`. Фронт готов: корзина оформляет через
`useMutation` и показывает состояние отправки, профиль рисует историю.
Сумму пересчитывайте на сервере и отклоняйте расхождение.

**Шаг 4 — серверная корзина.**
`api.cart` объявлен, но ни к одному экрану не подключён. При входе слить
гостевую корзину с серверной: прочитать `useStore().cartLines`, отправить
`PUT /cart`, затем `replaceCart()` ответом сервера. Это единственный новый
код на клиенте.

**Шаг 5 — тексты страниц.**
Перенести `src/data/content.ts` в БД или CMS и отдавать через
`/pages/{slug}`. `StaticPage` уже ходит за ними.

---

## 9. Чеклист на день переключения

- [ ] `VITE_API_URL` задан для каждого окружения
- [ ] CORS разрешает origin витрины **с `credentials: true`** — иначе cookie
      сессии не поедет
- [ ] Cookie сессии: `httpOnly`, `Secure`, `SameSite=Lax`, домен задан явно
- [ ] Тело ошибки — `{ message, code }`, `message` строкой, не массивом
- [ ] Истёкшая сессия отдаёт `401`, а не `403` — на `401` фронт разлогинивает
- [ ] `state` и PKCE проверяются на `/auth/callback`
- [ ] `return_to` валидируется по белому списку — иначе open redirect
- [ ] Рейт-лимит на `/products/suggest`
- [ ] Значения `product.slug` совпадают с фикстурой или настроены редиректы
- [ ] Прогон стенда против мока: те же экраны, те же состояния

---

## 10. Опционально: TanStack Query

`src/hooks/useQuery.ts` намеренно повторяет поверхность TanStack Query
(`data`, `error`, `status`, `isLoading`, `refetch`). Если понадобится общий
кеш, фоновое обновление или оптимистичные апдейты:

1. `npm i @tanstack/react-query`
2. Обернуть дерево в `QueryClientProvider` в `src/App.tsx`
3. Поменять импорт в `src/hooks/catalog.ts` и форму вызова на
   `useQuery({ queryKey, queryFn })`
4. Удалить `src/hooks/useQuery.ts` и `src/hooks/useMutation.ts`

Экраны не меняются — они используют типизированные хуки, а не generic.
