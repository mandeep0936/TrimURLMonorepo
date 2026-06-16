# Trim — URL Shortener with Analytics

A full-stack URL shortener built with MongoDB, Express, React, and Node (MERN) in a pnpm + Turborepo monorepo.

## Quick Start

### Prerequisites
- Node 22+, pnpm 9+, MongoDB 7 (local or Atlas)

### Local development

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example packages/api/.env
# Edit packages/api/.env — set MONGODB_URI if not using localhost

# 3. Start both services (hot-reload)
pnpm dev
```

- API: http://localhost:4000
- Web: http://localhost:5173

### Docker (one command)

```bash
docker-compose up --build
```

- Web: http://localhost:5173
- API: http://localhost:4000

### Environment variables (packages/api/.env)

| Variable | Default | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb://localhost:27017/trim` | MongoDB connection string |
| `PORT` | `4000` | API port |
| `BASE_URL` | `http://localhost:4000` | Used to build short URLs returned by the API |
| `CLIENT_URL` | `http://localhost:5173` | CORS origin |
| `NODE_ENV` | `development` | |

---

## Architecture

```
monorepo/
├── packages/
│   ├── api/          Express 5 + Mongoose 8 + TypeScript
│   │   └── src/
│   │       ├── config/       MongoDB connection
│   │       ├── models/       Link, ClickEvent schemas
│   │       ├── routes/       /api/links, /:code redirect
│   │       ├── middleware/   Error handler
│   │       └── utils/        Short-code generation, redirect cache
│   └── web/          React 19 + Vite 6 + TanStack Query v5 + Tailwind v3
│       └── src/
│           ├── api/          Axios client
│           ├── hooks/        useLinks, useAnalytics, useCreateLink
│           ├── components/   CreateLinkForm, LinkTable, AnalyticsCharts
│           ├── pages/        HomePage, AnalyticsPage, NotFoundPage
│           └── types/        Shared TypeScript types
├── turbo.json
├── pnpm-workspace.yaml
└── docker-compose.yml
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/links` | Create a short link (optionally with custom alias) |
| `GET` | `/api/links` | List all links with click counts |
| `GET` | `/api/links/:code/analytics` | Per-link analytics |
| `GET` | `/:code` | Redirect to original URL |

---

## Design Decisions

### Short-code generation
I use **nanoid** with a 7-character base62 alphabet (`[0-9A-Za-z]`). This yields 62⁷ ≈ 3.5 trillion possible codes — collision probability is negligible at any realistic scale. On the rare collision (detected via a `findOne` before insert), the code retries up to 5 times. Custom aliases skip nanoid and go through a format validation regex + uniqueness check. I chose random over a counter because a counter leaks link volume to users; random is fine here with no distributed coordination needed.

### Storing clicks
I store **individual click events** (`ClickEvent` collection), not pre-aggregated counters. Each event records timestamp, referrer hostname, device type, browser, and OS. The `Link.clickCount` field is a denormalized counter incremented atomically with `$inc` for cheap list-page rendering.

**Trade-off**: Individual events give full flexibility (any time window, any breakdown, future filtering) but grow linearly with traffic. At high volume (millions of clicks/day) I'd add a TTL index to expire raw events after 90 days and maintain pre-aggregated daily buckets via a background job or MongoDB Atlas triggers — keeping the counter accurate while bounding storage.

### Indexes
- `Link`: `{ code: 1 }` unique — the redirect hot path; `{ createdAt: -1 }` — list endpoint sort.
- `ClickEvent`: `{ linkId: 1, createdAt: 1 }` — covers all analytics aggregation queries (match by link, sort/bucket by time).

### 301 vs 302
I use **302 (Found)**. A 301 is cached permanently by browsers, meaning the second visit from the same browser bypasses the server entirely — the click is never recorded. 302 forces the browser to ask the server every time, ensuring analytics accuracy. The cost is one extra HTTP round-trip per visit, which is acceptable for a shortener that values click tracking.

---

## What I'd do with more time

1. **Auth** — JWT-based login so links are scoped to users; the data model already has a natural place for `userId` on `Link`.
2. **Link expiry / click cap** — add `expiresAt: Date` and `clickCap: Number` fields; the redirect route checks them before redirecting.
3. **Tests** — unit tests for `generateUniqueCode`, `isSafeUrl`, and the analytics aggregation pipeline; integration tests with `mongodb-memory-server`.
4. **Pre-aggregated analytics** — daily bucket documents updated by a background job to bound ClickEvent collection growth.
5. **QR code generation** — trivial to add with `qrcode` npm package; useful for sharing.
