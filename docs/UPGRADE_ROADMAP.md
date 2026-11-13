# Pinguin BOAT — Upgrade Roadmap

> Audit-based plan · 2026-11-12 · **reconciled with the code on 2026-11-13**
>
> Status key: `[x]` shipped · `[~]` partial, see the item note · `[ ]` not started.
> Evidence lines describe the state **at audit time**; items marked done were
> verified against the current code, not against the audit.
> Scope: web, API, bot, database, infrastructure, security, developer experience.
> Every item cites the file and line that motivates it, so it can be verified against the code.

---

## Snapshot

Audited figures, with the reconciled value where it changed:

| Metric | Audit | Now |
|---|---|---|
| Dashboard pages | 50 | 50 |
| Pages using `'use client'` | 49 | 49 of 50 (+2 client error boundaries, W1) |
| Guild routes in `guild/index.ts` | 36 | 36 |
| Owner routes in `owner.ts` | 60+ | 60+, all POSTs idempotency-aware (A10) |
| Prisma schema | 1,876 lines | 1,893 (idempotency, 2FA recovery codes, explicit cascades) |
| Prisma migrations | 8 | 10 |
| Redis / shared cache | none | none (`docker-compose.yml` ships a Redis service, unused) |
| Bot processes | 1 (no sharding) | 1 |
| Test files | ~14 | 20 (web app now has a runner) |
| `loading.tsx` / `error.tsx` / `not-found.tsx` | none | 6 route files (W1, partial) |

---

## How to read this document

- **P0** — do now; correctness, security or the largest performance win.
- **P1** — next; high value, moderate cost.
- **P2** — later; meaningful but not blocking.
- **Impact** — 1–5, expected user/system benefit.
- **Effort** — S (≤ 1 day), M (2–5 days), L (1–3 weeks).
- **Phase** — target delivery window (see [Roadmap](#roadmap)).

Suggested workflow: turn each item into a GitHub issue, label it with the area and priority, and attach the evidence line. Keep this file in `docs/` and update the status marker as work lands. An item only moves to `[x]` when the code, a test and the docs all agree.

---

## Do these first (this week) — all shipped

| # | Upgrade | Why | Status |
|---|---|---|---|
| 01 | Repair the PM2 config (`deploy/pm2.config.js`) | The file contained a duplicated apps block after the closing bracket — invalid JSON, so `pm2 start` failed. | `[x]` |
| 02 | Add `@fastify/compress` | Every JSON response is uncompressed; guild settings payloads are large. Brotli cuts 60–80%. | `[x]` |
| 03 | Stop the silent demo-data fallback | `apiGet` returns fake data on any error, so a 500 looks like real data. Gate it to preview mode. | `[x]` |
| 04 | Add composite indexes | `audit_logs`, `moderation_cases` and `economy_transactions` lack the indexes their queries use. | `[x]` |
| 05 | Cache XP config per guild | Every message reads XP settings and role rewards from Postgres. Cache and invalidate on write. | `[x]` (B2) |
| 06 | Add timeout/abort to `apiFetch` | No timeout today; a 429 sleeps 10 s and blocks the UI. Add backoff and typed errors. | `[x]` (W3) |

---

## Progress

### Phase 0 — Stabilize `[x]`

All of: pm2 config valid, Brotli/gzip on API responses, demo data gated to
preview, composite indexes in the schema, baseline SQL + migration tooling,
health split into `/health/live` and `/health/ready`.

### Phase 1 — Performance `[~]`

Shipped: `/api/overview` N+1 removed (A3), guild-config cache with invalidation
(A2/B2), XP hot path single-transaction + cached rewards (B1), durable music
queue with rehydration (B3), `next/image` with AVIF/WebP and code-split charts,
confetti and motion (W5/W6), session auth cache (A4), Discord REST queue with
429/backoff/circuit breaker (B6), DB pooling (D6), server-side ETag +
`Cache-Control` on the stable reads (A12).

Open: RSC dashboard pages (W1, boundaries landed), shared query layer (W2),
Redis (I3) — a compose service exists but nothing connects to it.

### Phase 2 — Experience `[~]`

Shipped: ⌘K command palette (W7), log retention (D3), owner 2FA recovery codes +
brute-force alert (S1), idempotency keys on owner POSTs (A10), input validation
on guild routes with unknown-key stripping (A8), runbook and env reference
sections (I10), welcome/rank card cache (B9), SSRF guard on remote card images
(S5), ETag + `Cache-Control` on stable reads (A12), explicit `onDelete` on every
relation (D5), route boundaries (W1), stray-file CI guard (I6).

Open: bulk actions (W8), real-time dashboard (W9), design-system consolidation
(W10), accessibility pass (W11), music rewrite (B4), cursor pagination on the
remaining list endpoints (A12), owner mutation audit coverage (S6).

### Phase 3 — Scale `[ ]`

Nothing started: sharding (B5), read replica (D10), blobs to object storage
(D4), OpenAPI client (A6), observability stack (I4), partitioning (D3 beyond
row retention), API versioning (A15), history-based rate limiting.

---

## Visual & UX wishlist

### Mission-control overview

- **KPI strip with sparklines** — servers, members, online, commands, CPU/RAM, each with a 24 h trend instead of a flat number.
- **Server health ring** — one score derived from bot presence, modules enabled, logs configured, tickets staffed, welcome configured.
- **Live status pills** — bot, API, DB, Discord, music; green/amber/red with last-check time.
- **Activity heatmap** — messages and commands by hour/day, using data already in audit logs.
- **“Needs attention” list** — guilds with no logs channel, no ticket staff, automod off, or no welcome message.

### Interaction & polish

- **⌘K command palette** — jump to any server, page or action; recent servers first.
- **Server switcher with search** — fuzzy match, recents, owner badge, bot-present dot.
- **Sticky page headers** — glyph, eyebrow, title, description, primary action; consistent across modules.
- **Skeleton parity** — every page gets a skeleton that matches the final layout; no spinner-only screens.
- **Optimistic toggles + undo toast** — module switches, deletes and bulk edits apply instantly, with rollback.
- **Motion with intent** — page transitions, count-up numbers, hover lift; respect `prefers-reduced-motion`.
- **Light / dark / system** — persist the existing `User.theme` instead of defaulting to dark.
- **Mobile bottom nav** — dashboard, servers, moderation, music, more; sidebar becomes a drawer.
- **Empty states with plate art** — reuse the existing SVG plates instead of bare “no data”.
- **In-app changelog drawer** — the changelog model already exists; surface it in the header.

---

## Practical features worth building

### Moderation & support

- **Case notes + appeals** — internal notes on a case, an appeal button, and a DM thread linked to the case.
- **Ticket SLA dashboard** — first response, resolution time, breach count, per-category staffing.
- **Canned responses** — saved replies with placeholders, insertable in tickets and mod notes.
- **Audit diff viewer** — show what changed between two settings versions, not just “updated”.
- **Bulk moderation** — select cases, apply warn/mute/close, export CSV.

### Community & music

- **Music playlists + queue sharing** — save queues, share a listen link, import/export.
- **Lyrics + filters** — synced lyrics, bassboost/nightcore/8D, volume normalization, 24/7 mode.
- **Leaderboard seasons** — XP and economy seasons with reset, rewards and a Hall of Fame.
- **Economy analytics** — inflation, richest members, shop conversion, quest completion.
- **Template gallery** — embeds, welcome cards and rank cards as one-click presets.
- **Settings import / export** — JSON backup of a guild’s modules, shareable between servers.
- **Maintenance banner** — scheduled windows shown in the dashboard and bot status.

---

## Performance budgets

| Target | Metric |
|---|---|
| < 1.5 s | LCP on dashboard, cached |
| < 180 KB | initial JS per route |
| < 200 ms | API p95, cached reads |
| < 50 ms | DB p95 for indexed reads |
| 0 | N+1 queries on hot paths |
| < 2 | DB queries per message |

---

## Roadmap

### Phase 0 — Stabilize (week 1) `[x]`

- [x] Fix pm2 config and add JSON validation
- [x] Compress API responses
- [x] Guard demo-data fallback
- [x] Add composite indexes
- [x] Create a migration baseline
- [x] Split health / readiness checks

### Phase 1 — Performance (weeks 2–3) `[~]`

- [x] Fix `/api/overview` N+1 and add guild config cache
- [x] Fix the XP hot path and cache config
- [x] Make the music queue durable
- [ ] Move the dashboard to RSC + a shared query layer
- [x] Add `next/image` and code-split heavy libraries
- [~] Introduce Redis and configure DB pooling

### Phase 2 — Experience (weeks 4–6) `[~]`

- [x] Command palette
- [ ] Bulk actions and saved views
- [ ] Real-time dashboard updates
- [ ] Design system consolidation and accessibility pass
- [ ] Music rewrite (playlists, filters, lyrics)
- [x] Retention jobs for log tables

### Phase 3 — Scale (weeks 7+) `[ ]`

- [ ] Sharding and presence audit
- [ ] Read replica / materialized views
- [ ] Blobs to object storage
- [ ] OpenAPI and generated client
- [ ] Observability and load tests
- [ ] Postgres partitioning

---

## Detailed backlog

### Web

| ID | Priority | Impact | Effort | Phase | Upgrade |
|---|---|---|---|---|---|
| W1 | P0 | 5 | L | 1 | Move the dashboard to Server Components |
| W2 | P0 | 5 | M | 1 | Add a shared query layer (TanStack Query) |
| W3 | P0 | 4 | S | 0 | Harden `apiFetch` |
| W4 | P0 | 4 | S | 0 | Stop the silent demo-data fallback |
| W5 | P1 | 4 | M | 1 | Use `next/image` |
| W6 | P1 | 4 | S | 1 | Code-split recharts, confetti, motion |
| W7 | P1 | 4 | M | 2 | Add a ⌘K command palette |
| W8 | P1 | 4 | L | 2 | Bulk actions, saved views, column config |
| W9 | P1 | 4 | L | 2 | Real-time dashboard updates |
| W10 | P1 | 4 | L | 2 | Consolidate the design system |
| W11 | P1 | 3 | M | 2 | Accessibility pass |
| W12 | P1 | 3 | M | 1 | Static landing page + OG images |
| W13 | P2 | 3 | M | 3 | PWA install + mobile navigation |
| W14 | P2 | 3 | L | 3 | Theme system and i18n |
| W15 | P2 | 1 | S | 0 | Remove stray files and dead config |

#### [~] W1 · Move the dashboard to Server Components

**P0 · impact 5/5 · effort L · phase 1 · status `[~]`** — route boundaries added (`loading.tsx`, `error.tsx`, `not-found.tsx` for the dashboard group, `servers/[guildId]/loading.tsx`, plus root `error.tsx`/`not-found.tsx`); the 49 client pages still fetch in `useEffect`, so the RSC conversion itself is open

- **Why:** 49 of 50 pages start with `'use client'` and fetch data in `useEffect` after hydration (`dashboard/page.tsx:36`). Every visit pays a spinner and a client bundle before content appears.
- **Do:** fetch on the server, stream with `Suspense`, keep only interactive islands as client components. Add `loading.tsx`, `error.tsx` and `not-found.tsx` boundaries per route.
- **Evidence:** 50 pages / 49 `'use client'`; `apps/web/app/(dashboard)/dashboard/page.tsx:36`; no boundary files exist.

#### [ ] W2 · Add a shared query layer (TanStack Query)

**P0 · impact 5/5 · effort M · phase 1 · status `[ ]`** — not started

- **Why:** every page re-implements `useState` + loading + error + `Promise.allSettled`. There is no cache, dedupe, retry or optimistic update.
- **Do:** add a query provider with stale times, retry/backoff, devtools and mutation helpers. Delete per-page loading/error boilerplate.
- **Evidence:** `apps/web/app/(dashboard)/dashboard/page.tsx:30`; `apps/web/lib/api.ts:133`; `apps/web/app/providers.tsx`.

#### [x] W3 · Harden `apiFetch`

**P0 · impact 4/5 · effort S · phase 0 · status `[x]`** — shipped: 15 s timeout, external AbortSignal, jittered backoff, typed ApiError, ETag cache

- **Why:** no `AbortController` or timeout. On 429 it awaits 10 s and blocks the caller; a hung request hangs the UI forever.
- **Do:** add a 15 s timeout, exponential backoff with jitter, typed API errors and an ETag cache for GETs. Respect an external `AbortSignal`.
- **Evidence:** `apps/web/lib/api.ts:133-183`; retry block at `:163-174`.

#### [x] W4 · Stop the silent demo-data fallback

**P0 · impact 4/5 · effort S · phase 0 · status `[x]`** — shipped: demo payload only via isPreview()/auth refusal; other errors rethrow

- **Why:** `apiGet` returns `demoPayload` on any error. A 500, 401 or CORS failure silently renders fake data — impossible to debug and misleading for users.
- **Do:** only use demo data when `isPreview()` is true. Log and rethrow real errors; show a retry state instead.
- **Evidence:** `apps/web/lib/api.ts:186-196`; `apps/web/lib/demo.ts`.

#### [x] W5 · Use `next/image`

**P1 · impact 4/5 · effort M · phase 1 · status `[x]`** — shipped: Discord CDN and user-supplied embed images go through `next/image` with AVIF/WebP; local SVG plates keep `<img>` on purpose (already sized, lazy, part of the static shell)

- **Why:** 17 raw `<img>` tags and zero `next/image` usages, even though `images.remotePatterns` is configured for `cdn.discordapp.com`.
- **Do:** replace raw `img` with `next/image`, add `sizes` and lazy loading, set `referrerPolicy`, and serve AVIF/WebP.
- **Evidence:** 17 `<img>` / 0 `next/image`; `apps/web/next.config.js:8-16`.

#### [x] W6 · Code-split recharts, confetti and motion

**P1 · impact 4/5 · effort S · phase 1 · status `[x]`** — shipped: every chart is a `next/dynamic` import, `canvas-confetti` loads on first use, and `motion` runs through `LazyMotion` + `m` with an async feature bundle in `app/providers.tsx`

- **Why:** charts, `canvas-confetti` and `motion` are imported eagerly on dashboard pages; only 6 dynamic imports exist across the app.
- **Do:** use `next/dynamic` for below-the-fold charts, confetti and animation. Keep motion in small client islands only where interaction needs it.
- **Evidence:** `apps/web/components/charts/*`; `apps/web/hooks/useConfetti.ts`; 6 dynamic imports total.

#### [x] W7 · Add a ⌘K command palette

**P1 · impact 4/5 · effort M · phase 2 · status `[x]`** — shipped: Cmd/Ctrl+K palette, fuzzy search, recents, owner pages, focus kept in the dialog

- **Why:** navigation is sidebar-only. There is no global search across servers, pages or actions.
- **Do:** add a `cmdk`-style dialog: fuzzy search servers, pages, modules and actions; recents; keyboard shortcuts; owner-only actions.
- **Evidence:** `apps/web/components/Sidebar.tsx`; `apps/web/components/ServerSelector.tsx`.

#### [ ] W8 · Bulk actions, saved views and column config

**P1 · impact 4/5 · effort L · phase 2 · status `[ ]`** — not started

- **Why:** moderation, tickets, members, forms and audit logs have no row selection, bulk operations, saved filters or column chooser.
- **Do:** add selection + bulk endpoints, saved filter presets per user, column visibility/order, and undo toasts for destructive actions.
- **Evidence:** `apps/web/app/(dashboard)/servers/[guildId]/moderation/page.tsx`; `.../tickets/page.tsx`.

#### [ ] W9 · Real-time dashboard updates

**P1 · impact 4/5 · effort L · phase 2 · status `[ ]`** — not started

- **Why:** SSE is used only for owner popups. Queue, tickets, logs and metrics require a manual refresh or full refetch.
- **Do:** add SSE/WebSocket channels for music queue, ticket updates, logs and metrics. Reconnect with backoff and pause when the tab is hidden.
- **Evidence:** `apps/web/hooks/useSSE.ts:31-70`.

#### [ ] W10 · Consolidate the design system

**P1 · impact 4/5 · effort L · phase 2 · status `[ ]`** — not started

- **Why:** many pages use inline style objects (`OwnerPasswordGate` alone has 100+ lines) and bespoke spacing. Themes drift from the tokens in `packages/ui`.
- **Do:** move to Tailwind/CSS modules + design tokens, unify page headers, cards, tables and form controls, and add focus/hover/active states.
- **Evidence:** `apps/web/components/OwnerPasswordGate.tsx:95-129`; `packages/ui/src/components/*`.

#### [ ] W11 · Accessibility pass

**P1 · impact 3/5 · effort M · phase 2 · status `[ ]`** — not started (palette and the 2FA gate ship keyboard + aria behaviour only)

- **Why:** icon-only buttons use glyphs (`⏻`, `×`, `▾`), modals lack a documented focus trap, and async results have no `aria-live` region.
- **Do:** add focus traps and focus restoration, `aria-live` for async results, keyboard navigation for menus/tables, visible focus rings and a contrast audit.
- **Evidence:** `apps/web/components/Sidebar.tsx:220`; `packages/ui/src/components/Modal.tsx`.

#### [ ] W12 · Static landing page + OG images

**P1 · impact 3/5 · effort M · phase 1 · status `[ ]`** — not started: opengraph-image.tsx, sitemap.ts and robots.ts exist; landing is still client-side

- **Why:** `landing-client.tsx` is 436 lines and `page.css` is 540 lines, shipped as a client component. There is no per-page OG image, sitemap or JSON-LD.
- **Do:** convert static sections to RSC, generate OG images with `next/og` (`tools/og.py` already exists), add sitemap, robots and structured data.
- **Evidence:** `apps/web/app/landing-client.tsx:1-436`; `apps/web/app/page.css:1-540`; `tools/og.py`.

#### [ ] W13 · PWA install + mobile navigation

**P2 · impact 3/5 · effort M · phase 3 · status `[ ]`** — not started

- **Why:** the dashboard is desktop-first: the sidebar becomes a drawer, but there is no installable app, offline shell or bottom navigation.
- **Do:** add a manifest, icons, service worker (stale-while-revalidate for static), and a mobile bottom nav for the five most-used destinations.
- **Evidence:** `apps/web/components/DashboardLayout.tsx:27-29`.

#### [ ] W14 · Theme system and i18n

**P2 · impact 3/5 · effort L · phase 3 · status `[ ]`** — not started

- **Why:** `User.theme` exists in the schema but the UI is effectively dark-only; strings are mixed French/English and API errors are French-only.
- **Do:** add `next-themes` or a cookie theme with system default, persist `User.theme`, and introduce `next-intl` with fr/en dictionaries.
- **Evidence:** `packages/db/prisma/schema.prisma:245`; `apps/web/components/ThemeSelector.tsx`.

#### [x] W15 · Remove stray files and dead config

**P2 · impact 1/5 · effort S · phase 0 · status `[x]`** — shipped: tracked scratch files removed (`.gg-tmp-roadmap.py`, `__pycache__/*.pyc`, `tools/_tmp/plates.bak`) and `scripts/check-stray-files.mjs` runs in CI as `pnpm check:stray`

- **Why:** the repo contains `economy/___temp_fix_guard.tsx`, `middleware.ts.bak` and `.gg-check-demo.mjs` — leftover experiments that confuse navigation.
- **Do:** delete dead files, add a `/verify` route or remove the no-op middleware, and add a CI check for TODO/temp files.
- **Evidence:** `apps/web/app/(dashboard)/servers/[guildId]/economy/___temp_fix_guard.tsx`; `apps/web/middleware.ts.bak`.

---

### API

| ID | Priority | Impact | Effort | Phase | Upgrade |
|---|---|---|---|---|---|
| A1 | P0 | 5 | S | 0 | Enable response compression |
| A2 | P0 | 5 | M | 1 | Cache guild config and Discord lookups |
| A3 | P0 | 5 | M | 1 | Fix `/api/overview` N+1 and full scan |
| A4 | P1 | 4 | S | 1 | Cache session authentication |
| A5 | P1 | 4 | M | 1 | Split the mega `/:guildId` payload |
| A6 | P1 | 4 | M | 3 | OpenAPI docs + generated client |
| A7 | P1 | 4 | S | 1 | Per-route rate limits and headers |
| A8 | P1 | 4 | M | 1 | Validate every input at the boundary |
| A9 | P1 | 4 | L | 3 | Move cleanup and deploys to a worker |
| A10 | P1 | 3 | M | 2 | Idempotency keys and mutation audit |
| A11 | P1 | 3 | S | 0 | Split liveness and readiness |
| A12 | P2 | 3 | M | 2 | ETags, Cache-Control, cursor pagination |
| A13 | P2 | 3 | L | 3 | Split `owner.ts` and `guild/index.ts` |
| A14 | P1 | 4 | M | 1 | Replace scattered `JSON.parse` with mappers |
| A15 | P2 | 2 | S | 3 | Version the public API |

#### [x] A1 · Enable response compression

**P0 · impact 5/5 · effort S · phase 0 · status `[x]`** — shipped: Brotli + gzip, 1 KB threshold, SSE skipped

- **Why:** no `@fastify/compress` is registered. Guild settings, audit logs and metrics responses are large JSON payloads sent uncompressed.
- **Do:** register `@fastify/compress` with Brotli + gzip, a 1 KB threshold and a sensible quality level.
- **Evidence:** `apps/api/src/index.ts:38-83`; `apps/api/package.json:17-32`.

#### [x] A2 · Cache guild config and Discord lookups

**P0 · impact 5/5 · effort M · phase 1 · status `[x]`** — shipped: cache util for Discord lookups and guild config, invalidated on write

- **Why:** `overview.ts` calls `getGuildMember` per guild on every request. `utils/cache.ts` exists but is barely used, and there is no shared cache across routes.
- **Do:** cache XP settings, modules, autoroles and Discord channels/roles in Redis or an LRU with TTL; invalidate on settings writes via the internal API.
- **Evidence:** `apps/api/src/routes/guild/overview.ts:50-63`; `apps/api/src/utils/cache.ts:1-53`; `apps/api/src/services/discord.ts`.

#### [x] A3 · Fix the `/api/overview` N+1 and full scan

**P0 · impact 5/5 · effort M · phase 1 · status `[x]`** — shipped: memberships query joins the guild; Discord lookups cached 60 s

- **Why:** it loads every guild with settings, then fetches each member's Discord roles in batches of ten, then queries premium separately. Cost grows with the member's guild count.
- **Do:** query only memberships for the user, join guild data, filter in Postgres, batch Discord lookups with `Promise.all`, and cache role checks for 60 s.
- **Evidence:** `apps/api/src/routes/guild/overview.ts:21-96`.

#### [x] A4 · Cache session authentication

**P1 · impact 4/5 · effort S · phase 1 · status `[x]`** — shipped: 30-60 s session + blacklist cache, invalidated on logout/rotation

- **Why:** `authenticate()` runs a session lookup with user include plus a blacklist lookup on every request — two to three queries before the route handler.
- **Do:** add a 30–60 s cache keyed by token hash, rotate sessions on privilege change, and use a `__Host-` prefixed cookie in production.
- **Evidence:** `apps/api/src/middleware/auth.ts:48-82`.

#### [ ] A5 · Split the mega `/:guildId` payload

**P1 · impact 4/5 · effort M · phase 1 · status `[ ]`** — not started

- **Why:** the guild overview returns settings, modules, logs, XP, role rewards, embeds, autoroles, channels, roles, premium and access arrays in one response.
- **Do:** add `?include=` or per-module endpoints; load only the tab the user opens. Return a small summary first, then stream the rest.
- **Evidence:** `apps/api/src/routes/guild/overview.ts:103-221`.

#### [ ] A6 · OpenAPI docs + generated client

**P1 · impact 4/5 · effort M · phase 3 · status `[ ]`** — not started

- **Why:** there are no API docs. The web client hand-maintains DTOs and sends `Record<string, unknown>`, so contract drift is invisible until runtime.
- **Do:** add `@fastify/swagger` + swagger-ui, derive schemas from zod, and generate a typed TS client for the web app.
- **Evidence:** `apps/web/lib/api.ts:1-23`; `apps/api/src/middleware/validate.ts`.

#### [x] A7 · Per-route rate limits and rate-limit headers

**P1 · impact 4/5 · effort S · phase 1 · status `[x]`** — shipped: per-domain limits, per-user/IP key, X-RateLimit-* and Retry-After headers

- **Why:** the global limit is 100/min for every route. Sensitive endpoints such as auth callbacks, music control and owner actions need tighter, per-key limits.
- **Do:** add route-level configs with `keyGenerator` by user/IP, return `X-RateLimit-*` and `Retry-After`, and exempt health checks.
- **Evidence:** `apps/api/src/index.ts:62-65`; `apps/api/src/routes/auth.ts:22-28`.

#### [x] A8 · Validate every input at the boundary

**P1 · impact 4/5 · effort M · phase 1 · status `[x]`** — shipped: guild bodies validated with zod (utils/route-schemas.ts) and unknown keys stripped

- **Why:** `validate.ts` exists, but many handlers cast `request.body` directly and `JSON.parse` stored settings without a schema. Malformed data becomes a 500.
- **Do:** use zod schemas for params, query and body on every route; strip unknown keys; wrap `JSON.parse` in safe-parse and return 400 on bad data.
- **Evidence:** `apps/api/src/middleware/validate.ts`; `apps/api/src/utils/safe-parse.ts`; `apps/api/src/routes/guild/overview.ts:174`.

#### [ ] A9 · Move cleanup and deploys to a worker

**P1 · impact 4/5 · effort L · phase 3 · status `[ ]`** — not started: deploys already run in a detached worker (`services/deploy-worker.ts`), but session/ticket/retention cleanup still runs on `setInterval` inside the API

- **Why:** session/ticket cleanup runs on `setInterval` inside the API, and deployments run in-process with `simple-git`. Restarts and latency spikes affect both.
- **Do:** add a Redis-backed worker (BullMQ) or system cron for cleanup, metrics snapshots and deploys. Make the API stateless.
- **Evidence:** `apps/api/src/jobs/cleanup.ts`; `apps/api/src/jobs/cleanup-tickets.ts`; `apps/api/src/services/deploy.ts`.

#### [x] A10 · Idempotency keys and mutation audit

**P1 · impact 3/5 · effort M · phase 2 · status `[x]`** — shipped: Idempotency-Key on every owner POST, stored 24 h with replay

- **Why:** deploy, restart, backup, premium grant and blacklist are dangerous POSTs with no idempotency key. `OwnerLog` exists but coverage is partial.
- **Do:** accept `Idempotency-Key` on dangerous routes, store the result for 24 h, and write an `AuditLog`/`OwnerLog` entry for every mutation.
- **Evidence:** `apps/api/src/routes/owner.ts:758`; `apps/api/src/routes/deploy.ts`; `packages/db/prisma/schema.prisma:1346-1380`.

#### [x] A11 · Split liveness and readiness

**P1 · impact 3/5 · effort S · phase 0 · status `[x]`** — shipped: /health/live and /health/ready, legacy /health kept

- **Why:** `/api/health` only checks the database. A running API with a dead bot proxy or failing Discord API still reports healthy.
- **Do:** add `/health/live` (process) and `/health/ready` (DB, bot internal API, Discord API, disk, memory) with timeouts and a 503 on dependency failure.
- **Evidence:** `apps/api/src/index.ts:155-171`.

#### [~] A12 · ETags, Cache-Control and cursor pagination

**P2 · impact 3/5 · effort M · phase 2 · status `[~]`** — shipped: `utils/http-cache.ts` adds a strong ETag plus `Cache-Control` to `/api/overview/public`, `/api/overview/top-guilds`, `/api/changelogs` and `/api/stats/public`, answering 304 on `If-None-Match`; cursor pagination is still open

- **Why:** read endpoints have no ETag or Cache-Control; the dashboard refetches full lists on every navigation. Offset pagination is used for large tables.
- **Do:** add ETag + `If-None-Match` for stable reads, private `max-age` for user data, and cursor pagination for audit logs, tickets and leaderboards.
- **Evidence:** `apps/api/src/index.ts:274-301`; `apps/web/lib/api.ts:133`.

#### [ ] A13 · Split `owner.ts` and `guild/index.ts`

**P2 · impact 3/5 · effort L · phase 3 · status `[ ]`** — not started

- **Why:** `owner.ts` is 1,377 lines with 60+ routes; `guild/index.ts` is 1,328 lines with 36 routes. The same concerns are registered in multiple places.
- **Do:** split into Fastify plugins by domain (owner/blacklist, owner/services, guild/settings...), each with encapsulated auth and schemas.
- **Evidence:** `apps/api/src/routes/owner.ts:1-1377`; `apps/api/src/routes/guild/index.ts:1-1328`.

#### [x] A14 · Replace scattered `JSON.parse` with typed mappers

**P1 · impact 4/5 · effort M · phase 1 · status `[x]`** — shipped: safeJsonParse/parseIdList replace inline JSON.parse on read paths

- **Why:** `modRoleIds`, `dashboard*Access`, `events`, `fields`, `ignoredChannels` and `ignoredRoles` are parsed inline in many routes. One bad string throws a 500.
- **Do:** create a mapper/schema per model in `shared`, use safe-parse, and return typed DTOs. Reuse it in bot and web.
- **Evidence:** `apps/api/src/utils/guild-helpers.ts`; `apps/api/src/routes/guild/overview.ts:174-215`.

#### [ ] A15 · Version the public API

**P2 · impact 2/5 · effort S · phase 3 · status `[ ]`** — not started

- **Why:** there is no `/v1` prefix, so any breaking change risks the web client and any future integrations.
- **Do:** mount routes under `/api/v1`, keep `/api` as a rewrite during migration, and add `Deprecation`/`Sunset` headers.
- **Evidence:** `apps/api/src/index.ts:107-118`.

---

### Bot

| ID | Priority | Impact | Effort | Phase | Upgrade |
|---|---|---|---|---|---|
| B1 | P0 | 5 | M | 1 | Fix the per-message XP hot path |
| B2 | P0 | 4 | S | 1 | Standardize per-guild config caching |
| B3 | P0 | 4 | M | 1 | Make the music queue durable |
| B4 | P1 | 5 | L | 2 | Rebuild music on a real audio backend |
| B5 | P1 | 4 | L | 3 | Add sharding and audit presences |
| B6 | P1 | 4 | M | 1 | Queue Discord REST calls with 429 handling |
| B7 | P1 | 3 | M | 2 | Harden the internal bot API |
| B8 | P1 | 3 | S | 1 | Graceful shutdown that drains work |
| B9 | P1 | 3 | S | 1 | Cache rendered welcome/rank cards |
| B10 | P1 | 3 | M | 2 | Expose bot metrics and health |
| B11 | P2 | 3 | M | 3 | Per-guild concurrency and error isolation |
| B12 | P2 | 3 | L | 3 | Fill the product gaps |

#### [x] B1 · Fix the per-message XP hot path

**P0 · impact 5/5 · effort M · phase 1 · status `[x]`** — shipped: cached settings and rewards, one transaction, no per-message ensureUser chain

- **Why:** `messageCreate` does protection, automod, economy, module and XP checks, then `addMessageXp` does `ensureUser` + settings + transaction + role rewards + event check — roughly 6–10 DB round-trips per message.
- **Do:** cache XP settings and role rewards per guild, buffer XP in memory and flush every 5–10 s, and replace the transaction with one atomic `UPDATE ... WHERE last_message_at < now() - cooldown`.
- **Evidence:** `apps/bot/src/events/messageCreate.ts:21-38`; `apps/bot/src/services/xp.ts:28-108`.

#### [x] B2 · Standardize per-guild config caching

**P0 · impact 4/5 · effort S · phase 1 · status `[x]`** — shipped: services/guild-config.ts is the single cached config entry point

- **Why:** module guards cache, but `isEconomyActive`, `XPSettings` and `AutoModSettings` are read from Postgres on every relevant event.
- **Do:** add one config cache service with TTL and invalidation through the internal API; use it in all hot paths.
- **Evidence:** `apps/bot/src/guards/module.ts`; `apps/bot/src/services/economy.ts`; `apps/bot/src/services/automod.ts`.

#### [x] B3 · Make the music queue durable

**P0 · impact 4/5 · effort M · phase 1 · status `[x]`** — shipped: queue persisted with debounce, rehydrated on demand, orphans pruned

- **Why:** queue state lives in an in-memory `Map` with a 500 ms DB debounce. A crash or restart can lose the current track, position, volume and loop mode.
- **Do:** persist on every state change (or in Redis), rehydrate on ready, and resume the track. Add a reconciliation job for stale guild states.
- **Evidence:** `apps/bot/src/services/music.ts:176-196`.

#### [ ] B4 · Rebuild music on a real audio backend

**P1 · impact 5/5 · effort L · phase 2 · status `[ ]`** — not started: still yt-dlp per track

- **Why:** every track and seek spawns `yt-dlp`; seek uses `--download-sections`, which re-downloads. There is no playlist persistence, lyrics, filters, 24/7 or volume normalization.
- **Do:** move to Lavalink (or `play-dl` + a shared cache), persist playlists and queue in Postgres/Redis, and add filters, lyrics, `/247`, autoplay and queue pagination.
- **Evidence:** `apps/bot/src/services/music.ts:107-168`; `apps/bot/src/commands/music/*`.

#### [ ] B5 · Add sharding and audit presences

**P1 · impact 4/5 · effort L · phase 3 · status `[ ]`** — not started

- **Why:** a single `Client` handles every guild. `GuildPresences` is a privileged, expensive intent used mainly for presence counts.
- **Do:** move to `ShardClient` or `discord-hybrid-sharding`; replace presence scans with approximate counts; add per-shard health and a resharding runbook.
- **Evidence:** `apps/bot/src/index.ts:15-28`; `apps/bot/src/internal/bot-api.ts:36-54`.

#### [x] B6 · Queue Discord REST calls with 429 handling

**P1 · impact 4/5 · effort M · phase 1 · status `[x]`** — shipped: shared concurrency queue, Retry-After backoff, circuit breaker

- **Why:** the API-side `discordFetch` has no `Retry-After` handling or global rate-limit queue. Dashboard channel/role calls can fail under load.
- **Do:** add a shared REST queue with per-route buckets, `Retry-After`, jitter and a circuit breaker; surface failures as partial data instead of a 500.
- **Evidence:** `apps/api/src/services/discord.ts:45-66`.

#### [~] B7 · Harden the internal bot API

**P1 · impact 3/5 · effort M · phase 2 · status `[~]`** — body limit, timeout, request IDs and auth exist; still a raw http server with string paths

- **Why:** it is a raw `http` server with string-matched paths, no zod validation, no body limit, no request timeout and a static shared secret.
- **Do:** reimplement as a Fastify plugin with zod schemas, `bodyLimit`, timeouts, request IDs, structured errors and the same auth guard.
- **Evidence:** `apps/bot/src/internal/bot-api.ts:16-70`.

#### [x] B8 · Graceful shutdown that drains work

**P1 · impact 3/5 · effort S · phase 1 · status `[x]`** — shipped: crons stopped, the guild-sync interval registered and stopped, music flushed, client destroyed, Prisma disconnected

- **Why:** `shutdown()` destroys the client and disconnects Prisma but does not stop intervals, destroy voice connections/players, or flush buffered XP.
- **Do:** stop all music, clear intervals, flush XP/cooldowns, wait for in-flight handlers with a timeout, then destroy and exit.
- **Evidence:** `apps/bot/src/index.ts:73-82`.

#### [x] B9 · Cache rendered welcome/rank cards

**P1 · impact 3/5 · effort S · phase 1 · status `[x]`** — shipped: LRU card cache keyed by member + settings hash (128 entries, 5 min TTL) in `services/WelcomeCardService.ts`, plus the same bounded 5 min cache for the `/rank` canvas in `commands/levels/rank.ts`

- **Why:** every join loads the remote avatar and renders a 700×250 canvas with no cache. A raid of joins can saturate the event loop.
- **Do:** add an LRU cache keyed by member + settings hash, preload common avatars, and render in a worker if p95 exceeds 100 ms.
- **Evidence:** `apps/bot/src/services/WelcomeCardService.ts:67-181`.

#### [~] B10 · Expose bot metrics and health

**P1 · impact 3/5 · effort M · phase 2 · status `[~]`** — /internal/metrics exists (memory, voice sessions, cache) but is not Prometheus format

- **Why:** the only health signal is `/internal/ping`. There is no visibility into messages/s, XP writes/s, music sessions, queue length or command errors.
- **Do:** add `/metrics` in Prometheus format: guilds, shards, messages/s, XP writes/s, active voice sessions, queue length, command usage and error rate.
- **Evidence:** `apps/bot/src/internal/bot-api.ts:31-55`.

#### [ ] B11 · Per-guild concurrency and error isolation

**P2 · impact 3/5 · effort M · phase 3 · status `[ ]`** — not started

- **Why:** event handlers are global; one slow guild or throwing handler can delay others, and failures are only logged to the bot log.
- **Do:** add a per-guild queue or `p-limit`, wrap handlers with try/catch + Sentry, and add a dead-letter log for failed interactions.
- **Evidence:** `apps/bot/src/events/_loader.ts`; `apps/bot/src/events/interactionCreate.ts`.

#### [ ] B12 · Fill the product gaps

**P2 · impact 3/5 · effort L · phase 3 · status `[ ]`** — not started

- **Why:** core modules exist, but common community features are missing: reports, appeals, reminders, AFK, temp voice, reaction roles, custom commands.
- **Do:** add `/report`, `/appeal`, `/remind`, `/afk`, `/tempvoice`, `/reactionroles` and `/customcommand` with dashboard configuration and audit logging.
- **Evidence:** `apps/bot/src/commands/*`.

---

### Database

| ID | Priority | Impact | Effort | Phase | Upgrade |
|---|---|---|---|---|---|
| D1 | P0 | 5 | S | 0 | Add the missing composite indexes |
| D2 | P0 | 4 | M | 0 | Create a real migration baseline |
| D3 | P1 | 4 | M | 2 | Retention and partitioning for log tables |
| D4 | P1 | 4 | L | 3 | Move blobs out of Postgres |
| D5 | P1 | 4 | M | 1 | Make cascade rules explicit |
| D6 | P1 | 4 | S | 1 | Configure connection pooling |
| D7 | P1 | 3 | L | 3 | Normalize settings stored as JSON strings |
| D8 | P1 | 2 | S | 1 | Drop redundant indexes |
| D9 | P2 | 3 | S | 2 | Money precision and CHECK constraints |
| D10 | P2 | 3 | L | 3 | Read replica and materialized analytics |
| D11 | P2 | 3 | M | 3 | Full-text search for staff tools |

#### [x] D1 · Add the missing composite indexes

**P0 · impact 5/5 · effort S · phase 0 · status `[x]`** — shipped: [guildId, createdAt], [guildId, active, createdAt], [botPresent, memberCount]

- **Why:** `AuditLog` has separate `[guildId]` and `[createdAt]` indexes but queries by guild + time. `ModerationCase` filters active cases; `EconomyTransaction` is read by guild + time.
- **Do:** add `[guildId, createdAt]` on `audit_logs`, `[guildId, active, createdAt]` on `moderation_cases`, `[guildId, createdAt]` on `economy_transactions`, and `[botPresent, memberCount]` on `guilds`.
- **Evidence:** `packages/db/prisma/schema.prisma:1346-1362`; `:516-537`; `:756-771`.

#### [x] D2 · Create a real migration baseline

**P0 · impact 4/5 · effort M · phase 0 · status `[x]`** — shipped: baseline SQL plus db:migrate running migrate dev non-interactively

- **Why:** the 1,876-line schema has only 8 incremental migrations. Dev likely uses `db:push`, so production history and dev schema can silently diverge.
- **Do:** generate a baseline with `prisma migrate diff --from-empty --to-schema-datamodel`, commit it, switch dev to `migrate dev`, and run `migrate deploy` in CI/prod.
- **Evidence:** `packages/db/prisma/migrations` (8 folders); `packages/db/prisma/schema.prisma:1-1876`.

#### [~] D3 · Retention and partitioning for log tables

**P1 · impact 4/5 · effort M · phase 2 · status `[~]`** — shipped this round: scheduled row retention in the API; no partitions or daily summaries yet

- **Why:** `AuditLog`, `MusicHistoryEntry`, `SystemMetricsSnapshot`, `OwnerLog` and `Deployment` grow forever. Backups and queries slow down over time.
- **Do:** add monthly range partitions or scheduled deletes (90–180 days), keep daily summaries in materialized views, and archive cold data.
- **Evidence:** `packages/db/prisma/schema.prisma:838-851`; `:1346-1399`.

#### [ ] D4 · Move blobs out of Postgres

**P1 · impact 4/5 · effort L · phase 3 · status `[ ]`** — not started

- **Why:** `GuildBackup.data`, `TranscriptMeta.content` and `Deployment.log` store large text in the primary database, inflating backups and slowing queries.
- **Do:** store blobs in S3/MinIO or disk, keep a URL + SHA-256 in Postgres, stream downloads, and add lifecycle rules.
- **Evidence:** `packages/db/prisma/schema.prisma:619-629`; `:1307-1328`; `:1803-1817`.

#### [~] D5 · Make cascade rules explicit

**P1 · impact 4/5 · effort M · phase 1 · status `[~]`** — every relation now declares `onDelete` (15 added) with `20260622000000_explicit_cascade_rules`, which flips the six user-owned per-guild rows (including `moderation_cases`) to `CASCADE`; a create-then-delete-a-guild integration test is still missing

- **Why:** many child relations have no `onDelete: Cascade`. Deleting a guild will fail on Restrict relations or leave orphaned rows.
- **Do:** audit every relation, add explicit `onDelete` (Cascade/SetNull/Restrict), and add an integration test that creates and deletes a full guild.
- **Evidence:** `packages/db/prisma/schema.prisma:321-375`; `:516-537`.

#### [x] D6 · Configure connection pooling

**P1 · impact 4/5 · effort S · phase 1 · status `[x]`** — shipped: DATABASE_CONNECTION_LIMIT / DATABASE_POOL_TIMEOUT appended to the URL

- **Why:** `DATABASE_URL` has no `connection_limit` or `pool_timeout`. Prisma's default pool per process can exhaust Postgres once the API, bot and Next SSR run together.
- **Do:** set `connection_limit`/`pool_timeout`, add PgBouncer (transaction mode) for serverless/Next, and a `directUrl` for migrations.
- **Evidence:** `packages/db/prisma/schema.prisma:7-11`; `packages/db/src/index.ts:7-18`.

#### [ ] D7 · Normalize settings stored as JSON strings

**P1 · impact 3/5 · effort L · phase 3 · status `[ ]`** — not started: JSON-string columns unchanged

- **Why:** `GuildSettings.modRoleIds`, `dashboard*Access`, `XPSettings.ignoredChannels`/`noXpRoles` and `SavedEmbed.fields` are JSON in a String column — not queryable and easy to corrupt.
- **Do:** use Postgres `text[]` or join tables, validate with zod, and migrate existing rows with a backfill script.
- **Evidence:** `packages/db/prisma/schema.prisma:400-433`; `:648-687`.

#### [x] D8 · Drop redundant indexes

**P1 · impact 2/5 · effort S · phase 1 · status `[x]`** — verified: no redundant `@@index` duplicates a unique constraint — `Session.token`, `PremiumSubscription.userId/guildId`, `BlacklistUser.targetId` and `PremiumPlan.name` rely on the unique index alone

- **Why:** unique constraints already create indexes; extra `@@index` entries on the same columns cost writes and storage (`Session.token`, `PremiumSubscription.userId/guildId`, `BlacklistUser.targetId`).
- **Do:** remove the redundant `@@index` lines after confirming query plans with `EXPLAIN`.
- **Evidence:** `packages/db/prisma/schema.prisma:274-292`; `:1210-1229`; `:1246-1255`.

#### [ ] D9 · Money precision and CHECK constraints

**P2 · impact 3/5 · effort S · phase 2 · status `[ ]`** — not started

- **Why:** `Donor.amount` is a `Float`, and there are no non-negative constraints on wallets, bank balances, XP or prices.
- **Do:** use `Decimal(12,2)` for money, integer cents for plans, and add `CHECK (amount >= 0)` / `CHECK (xp >= 0)` via raw migrations.
- **Evidence:** `packages/db/prisma/schema.prisma:1508-1523`; `:732-753`.

#### [ ] D10 · Read replica and materialized analytics

**P2 · impact 3/5 · effort L · phase 3 · status `[ ]`** — not started

- **Why:** leaderboards, metrics snapshots and audit queries run on the primary alongside transactional bot writes.
- **Do:** add a read replica for analytics, materialized views for daily guild stats and command usage, and refresh them on a schedule.
- **Evidence:** `apps/api/src/routes/guild/overview.ts:272-293`; `packages/db/prisma/schema.prisma:1383-1399`.

#### [ ] D11 · Full-text search for staff tools

**P2 · impact 3/5 · effort M · phase 3 · status `[ ]`** — not started

- **Why:** there is no search across audit details, moderation reasons, suggestions or ticket subjects — staff scroll or use client-side filters.
- **Do:** add `tsvector` columns + GIN indexes, a shared search endpoint, and a search UI in the dashboard.
- **Evidence:** `packages/db/prisma/schema.prisma:1346-1362`; `apps/web/lib/api.ts:556`.

---

### Infra / DevEx

| ID | Priority | Impact | Effort | Phase | Upgrade |
|---|---|---|---|---|---|
| I1 | P0 | 5 | S | 0 | Repair `pm2.config.json` |
| I2 | P1 | 4 | S | 1 | Harden nginx |
| I3 | P1 | 5 | M | 1 | Introduce Redis |
| I4 | P1 | 4 | L | 2 | Observability: errors, metrics, traces, alerts |
| I5 | P1 | 3 | M | 1 | One-command local environment |
| I6 | P1 | 3 | S | 1 | Make CI enforce quality |
| I7 | P2 | 3 | M | 3 | Load-test the hot paths |
| I8 | P2 | 2 | M | 3 | Release automation with changesets |
| I9 | P2 | 2 | S | 1 | Pre-commit hooks and editor defaults |
| I10 | P2 | 2 | S | 2 | Runbooks and an env reference |
| I11 | P2 | 2 | S | 1 | Windows-friendly scripts |
| I12 | P2 | 2 | S | 2 | Tune Turbo caching |

#### [x] I1 · Repair the PM2 config

**P0 · impact 5/5 · effort S · phase 0 · status `[x]`** — shipped: one `apps` array, valid config; the file is now `deploy/pm2.config.js` with `PINGUIN_ROOT`-relative paths

- **Why:** the file had a complete `apps` array, then a second copy of the same apps after the closing bracket. It was invalid JSON, so `pm2 start` failed.
- **Do:** keep one `apps` array, validate JSON in CI, and pin `max_memory_restart` per process. Add a smoke check that `pm2 start --dry-run` succeeds.
- **Evidence:** `deploy/pm2.config.js:1-60` (was `deploy/pm2.config.json`, audit time).

#### [x] I2 · Harden nginx

**P1 · impact 4/5 · effort S · phase 1 · status `[x]`** — shipped: HTTP/2, HSTS, Brotli/gzip, `client_max_body_size`, proxy timeouts, `server_tokens off` and per-surface `limit_req` zones; `server_name` stays a `votredomaine.com` placeholder on purpose

- **Why:** `server_name` is `votredomaine.com`, there is no HSTS, Brotli, body limit, proxy timeout or per-IP connection limit, and one 30 r/s zone covers all API users.
- **Do:** set the real domain, enable HTTP/2+ and Brotli, add HSTS, `client_max_body_size`, `proxy_read_timeout`, separate `limit_req` zones for auth/owner, and `server_tokens off`.
- **Evidence:** `deploy/nginx.conf:14-101`.

#### [ ] I3 · Introduce Redis

**P1 · impact 5/5 · effort M · phase 1 · status `[ ]`** — not started: Redis service is defined in docker-compose.yml but nothing connects

- **Why:** caches are per-process `Map`s, SSE events live in memory, music state is a `Map`, and there is no shared rate-limit or job queue. A second API instance breaks all of it.
- **Do:** add Redis for config/session caches, rate limits, music queue, SSE pub/sub and BullMQ jobs. Keep Postgres as the source of truth.
- **Evidence:** `apps/api/src/utils/cache.ts:1-53`; `apps/api/src/services/eventBus.ts`; `apps/bot/src/services/music.ts:194`.

#### [ ] I4 · Observability: errors, metrics, traces, alerts

**P1 · impact 4/5 · effort L · phase 2 · status `[ ]`** — not started

- **Why:** there are structured logs and a DB health check, but no error tracking, Prometheus metrics, tracing, dashboards or alerting.
- **Do:** add Sentry for web/API/bot, Prometheus metrics, pino log shipping, a Grafana dashboard and Discord/Twitch alerts for error-rate and uptime.
- **Evidence:** `apps/api/src/index.ts:85-103`; `packages/shared/src/logger.ts`; `scripts/healthcheck.sh`.

#### [~] I5 · One-command local environment

**P1 · impact 3/5 · effort M · phase 1 · status `[~]`** — compose has Postgres + Redis and a demo seed exists (`pnpm db:seed`); MinIO/MailHog and a task runner are still missing

- **Why:** setup is manual: PostgreSQL, env files, Prisma generate/migrate. There is no `docker-compose` for Postgres/Redis/MinIO.
- **Do:** add `docker-compose.yml` with Postgres, Redis, MinIO and MailHog; a make/task runner; and a seed script for realistic demo data.
- **Evidence:** `README.md:16-26`; `packages/db/src/seed.ts` (`db:seed` in `package.json`).

#### [~] I6 · Make CI enforce quality

**P1 · impact 3/5 · effort S · phase 1 · status `[~]`** — stray-file guard now runs in CI (`pnpm check:stray`); coverage gate, bundle budget, Playwright smoke test and `pnpm audit` are still open

- **Why:** turbo `lint` dependsOn `typecheck` (doubling the critical path), and there is no coverage gate, bundle budget, Playwright smoke test or audit step.
- **Do:** remove the `lint → typecheck` dependency, add coverage thresholds, `pnpm audit`, a Next bundle budget, Playwright smoke tests and a Lighthouse CI budget.
- **Evidence:** `turbo.json:13-22`; `.github/workflows/ci.yml:16-102`.

#### [ ] I7 · Load-test the hot paths

**P2 · impact 3/5 · effort M · phase 3 · status `[ ]`** — not started

- **Why:** no load tests exist for `/api/overview`, `/api/guilds/:id`, `/api/stats` or the music control endpoints, so capacity is unknown.
- **Do:** add k6/Artillery scenarios for dashboard load, guild switch, leaderboard and music control; track p50/p95/p99 and DB pool saturation.
- **Evidence:** `apps/api/src/routes/guild/overview.ts`; `apps/api/src/routes/music.ts`.

#### [ ] I8 · Release automation with changesets

**P2 · impact 2/5 · effort M · phase 3 · status `[ ]`** — not started

- **Why:** `CHANGELOG.md` is manual and there is no versioning or release-notes automation across the monorepo.
- **Do:** add changesets, semantic release or release-please, generate notes from merged PRs, and publish a versioned changelog.
- **Evidence:** `CHANGELOG.md`; `package.json:3`.

#### [x] I9 · Pre-commit hooks and editor defaults

**P2 · impact 2/5 · effort S · phase 1 · status `[x]`** — shipped: husky + lint-staged + commitlint + .editorconfig

- **Why:** formatting is enforced only by a manual script; there is no lint-staged, commitlint or `.editorconfig`.
- **Do:** add husky + lint-staged + prettier, commitlint, and `.editorconfig`. Keep hooks fast (< 5 s).
- **Evidence:** `package.json:27-28`; `eslint.config.mjs`.

#### [~] I10 · Runbooks and an env reference

**P2 · impact 2/5 · effort S · phase 2 · status `[~]`** — shipped this round: migration, retention, idempotency and 2FA recovery sections

- **Why:** deploy, rollback and backup exist as scripts, but there is no runbook for incidents, on-call or a complete env var reference.
- **Do:** add `RUNBOOK.md` (deploy, rollback, DB restore, bot restart), an architecture diagram, and generate env docs from the zod schema.
- **Evidence:** `docs/*`; `scripts/deploy.sh`; `scripts/rollback.sh`.

#### [~] I11 · Windows-friendly scripts

**P2 · impact 2/5 · effort S · phase 1 · status `[~]`** — `kill-ports.js` and `dev-with-preload.js` are Node; `install.sh`, `deploy.sh`, `rollback.sh`, `backup.sh`, `update.sh` and `healthcheck.sh` remain bash-only

- **Why:** several scripts are bash-only and the dev preload script spawns turbo with `shell: true`. Windows contributors hit avoidable friction.
- **Do:** use `cross-env`/`tsx` npm scripts, move platform-specific logic to Node, or document WSL as the supported path.
- **Evidence:** `scripts/kill-ports.js`; `scripts/dev-with-preload.js`; `scripts/install.sh`.

#### [~] I12 · Tune Turbo caching

**P2 · impact 2/5 · effort S · phase 2 · status `[~]`** — `inputs` declared for `lint`, `typecheck` and `test`; tests stay uncached until they run against a seeded database

- **Why:** `test` has `cache: false`, `lint` has no inputs, and outputs are not declared per package, so CI rebuilds more than necessary.
- **Do:** declare outputs/inputs per task, cache tests with a deterministic seed, and add a remote cache for CI.
- **Evidence:** `turbo.json:1-36`.

---

### Security

| ID | Priority | Impact | Effort | Phase | Upgrade |
|---|---|---|---|---|---|
| S1 | P1 | 4 | S | 1 | Owner lockout and 2FA recovery codes |
| S2 | P1 | 4 | S | 1 | Rotate sessions and harden cookies |
| S3 | P1 | 3 | S | 0 | Protect the YouTube cookie file |
| S4 | P1 | 3 | M | 1 | Add a Content Security Policy to the web app |
| S5 | P1 | 4 | M | 2 | Guard remote fetches against SSRF |
| S6 | P1 | 3 | M | 2 | Audit every owner mutation |
| S7 | P2 | 3 | M | 3 | Test the RBAC matrix |
| S8 | P2 | 2 | S | 1 | Add secret scanning |

#### [x] S1 · Owner lockout and 2FA recovery codes

**P1 · impact 4/5 · effort S · phase 1 · status `[x]`** — shipped: hashed one-time recovery codes, regenerate endpoint, lockout alert

- **Why:** owner password and 2FA routes have per-route rate limits, but there is no progressive lockout after repeated failures and no recovery path if the TOTP device is lost.
- **Do:** add exponential lockout per user/IP, one-time recovery codes (hashed), and an alert to the owner webhook on repeated failures.
- **Evidence:** `apps/api/src/routes/owner.ts:125-170`; `:1128-1190`.

#### [x] S2 · Rotate sessions and harden cookies

**P1 · impact 4/5 · effort S · phase 1 · status `[x]`** — shipped: __Host-session in production, rotation on owner/2FA, other sessions revoked

- **Why:** the session token is random and hashed, but the cookie is not `__Host-` prefixed, and there is no rotation on owner verification or password change.
- **Do:** use `__Host-session` in production, rotate the token on owner verification, and revoke other sessions on password/2FA change.
- **Evidence:** `apps/api/src/routes/auth.ts:111-158`; `apps/api/src/middleware/auth.ts:48-82`.

#### [x] S3 · Protect the YouTube cookie file

**P1 · impact 3/5 · effort S · phase 0 · status `[x]`** — shipped: cookie file written 0600, orphaned files removed on start

- **Why:** the yt-dlp cookie file is written with `writeFileSync` default permissions (0644), readable by other local users.
- **Do:** write with `mode: 0o600`, keep it outside the repo, and delete it on exit (already done) and on start.
- **Evidence:** `apps/bot/src/services/music.ts:70-99`.

#### [~] S4 · Add a Content Security Policy to the web app

**P1 · impact 3/5 · effort M · phase 1 · status `[~]`** — report-only CSP in next.config.js; not enforcing, unsafe-inline still allowed

- **Why:** Helmet is configured only on the API. The Next app sends no CSP, so an XSS in a markdown/embed preview can execute freely.
- **Do:** add a nonce-based CSP in `next.config.js` or middleware, allow only needed origins (Discord CDN, API), and drop `unsafe-inline`.
- **Evidence:** `apps/api/src/index.ts:67-83`; `apps/web/next.config.js`.

#### [x] S5 · Guard remote fetches against SSRF

**P1 · impact 4/5 · effort M · phase 2 · status `[x]`** — shipped: `apps/bot/src/utils/ssrf.ts` resolves the host and rejects private/loopback/link-local/metadata addresses, non-http(s) schemes, redirects, non-image content types and payloads over 8 MB; welcome-card backgrounds go through `fetchRemoteImage`

- **Why:** card backgrounds and avatars are loaded from user-supplied URLs; webhooks and pastebin also fetch remote content. Private IPs are not blocked.
- **Do:** resolve and reject private/loopback/link-local ranges, enforce https, set timeouts and size limits, and proxy through an allowlist.
- **Evidence:** `apps/bot/src/services/WelcomeCardService.ts:84-97`; `apps/api/src/services/pastebin.ts`.

#### [~] S6 · Audit every owner mutation

**P1 · impact 3/5 · effort M · phase 2 · status `[~]`** — logOwnerAction covers mutations; before/after values and coverage are inconsistent

- **Why:** `OwnerLog` covers some actions, but blacklist, premium, feature flags, maintenance and service restarts have inconsistent audit coverage.
- **Do:** add a shared `audit()` helper and call it from every owner route with actor, target, IP, user agent and before/after values.
- **Evidence:** `apps/api/src/routes/owner.ts`; `packages/db/prisma/schema.prisma:1365-1380`.

#### [ ] S7 · Test the RBAC matrix

**P2 · impact 3/5 · effort M · phase 3 · status `[ ]`** — not started

- **Why:** guild access is driven by `dashboard*Access` arrays in `GuildSettings`. There are no tests proving a moderator cannot open economy settings.
- **Do:** add a table-driven test for every module/role combination, plus a negative test for a non-member and a blacklisted user.
- **Evidence:** `apps/api/src/middleware/guild-auth.ts`; `packages/db/prisma/schema.prisma:400-423`.

#### [x] S8 · Add secret scanning

**P2 · impact 2/5 · effort S · phase 1 · status `[x]`** — shipped: gitleaks secret-scan workflow present

- **Why:** CodeQL and Dependabot are enabled, but there is no gitleaks/trufflehog step to catch committed tokens or cookies.
- **Do:** add a gitleaks workflow, a pre-commit hook, and a documented rotation procedure for Discord, GitHub and YouTube credentials.
- **Evidence:** `.github/workflows/security.yml`; `.github/dependabot.yml`.

---

## Appendix — evidence index

Files inspected for the audit. They describe the state **before** the work in
this round; read each item's status line for what is true now.

Files inspected for this plan:

- `apps/web/app/**` — 50 pages, 49 client components, no route-boundary files.
- `apps/web/lib/api.ts` — fetch client, 429 retry, demo fallback.
- `apps/web/next.config.js` — image config, rewrites, no CSP.
- `apps/web/components/DashboardLayout.tsx` — client-side auth check, sidebar state.
- `apps/web/components/OwnerPasswordGate.tsx` — inline-style gate.
- `apps/api/src/index.ts` — Fastify bootstrap, helmet, rate limit, health.
- `apps/api/src/middleware/auth.ts` — per-request session/blacklist lookups.
- `apps/api/src/routes/guild/overview.ts` — N+1 and full scan.
- `apps/api/src/routes/owner.ts` — 60+ routes, rate limits, audit coverage.
- `apps/api/src/services/discord.ts` — no 429 queue.
- `apps/bot/src/index.ts` — single client, intents, shutdown.
- `apps/bot/src/events/messageCreate.ts` — per-message query chain.
- `apps/bot/src/services/xp.ts` — transaction and role-reward queries.
- `apps/bot/src/services/music.ts` — yt-dlp process per track, in-memory queue.
- `apps/bot/src/services/WelcomeCardService.ts` — remote avatar + canvas per join.
- `apps/bot/src/internal/bot-api.ts` — raw http, string-matched routes.
- `packages/db/prisma/schema.prisma` — 1,876 lines, indexes, cascades, JSON columns.
- `packages/db/src/index.ts` — Prisma client, no pool config.
- `packages/shared/src/logger.ts` — structured logging.
- `deploy/pm2.config.json` — invalid JSON.
- `deploy/nginx.conf` — placeholder domain, no HSTS/Brotli/body limits.
- `turbo.json` — lint dependsOn typecheck; test cache disabled.
- `.github/workflows/ci.yml` — lint/typecheck/test/build jobs, no coverage/audit.

### Files added or changed in the 2026-11-12 round

- `apps/api/src/middleware/idempotency.ts` — `Idempotency-Key` claim, replay and
  capture; wired onto every owner POST in `apps/api/src/index.ts` (A10).
- `apps/api/src/utils/route-schemas.ts` — zod bodies for the guild routes that
  cast `request.body` (A8); `validate()` now strips unknown keys.
- `apps/api/src/services/owner2fa.ts`, `routes/owner.ts` — recovery codes
  (hashed, one-time, regenerable), lockout and recovery-code alerts (S1).
- `apps/api/src/utils/retention.ts`, `jobs/cleanup-retention.ts` — log table
  retention with per-table env overrides (D3).
- `apps/web/components/CommandPalette.tsx`, `lib/fuzzy.ts` — ⌘K palette (W7).
- `apps/web/app/**`, `apps/web/components/**` — `next/image` for Discord CDN and
  user-supplied embed images (W5).
- `apps/web/vitest.config.ts` — the web app finally has a test runner.
- `scripts/prisma-migrate.mjs` — non-interactive `db:migrate` (D2).
- `packages/db/prisma/migrations/20260621000000_add_idempotency_records`,
  `20260621000100_add_owner_2fa_recovery_codes` — migrations for the above.

### Files added or changed in the 2026-11-13 round

- `apps/api/src/utils/http-cache.ts`, `apps/api/src/tests/http-cache.test.ts` —
  strong ETag, `Cache-Control` policy and 304 handling (A12); applied to
  `/api/overview/public`, `/api/overview/top-guilds`, `/api/changelogs`
  (`apps/api/src/routes/overview.ts`) and `/api/stats/public`
  (`apps/api/src/index.ts`).
- `apps/web/app/(dashboard)/loading.tsx`, `error.tsx`, `not-found.tsx`,
  `servers/[guildId]/loading.tsx`, `apps/web/app/error.tsx`,
  `apps/web/app/not-found.tsx` — route boundaries (W1).
- `scripts/check-stray-files.mjs`, `package.json` (`check:stray`),
  `.github/workflows/ci.yml` — CI guard against tracked scratch files (W15).
- `.gitignore` — `__pycache__/`, `*.pyc`, `*.bak`, `*.orig`, `*.rej`.
- `apps/bot/src/events/ready.ts`, `apps/bot/src/index.ts` — the guild sync
  interval is now a managed interval and is stopped on shutdown (B8).
- `apps/bot/src/commands/levels/rank.ts` — bounded 5 min cache for rendered
  rank cards, completing B9 alongside the welcome-card cache.
- `apps/web/app/providers.tsx`, `apps/web/**` — `motion` now loads through
  `LazyMotion` with an async feature bundle; all 39 call sites use
  `m as motion` (W6).
- `packages/db/prisma/schema.prisma`,
  `packages/db/prisma/migrations/20260622000000_explicit_cascade_rules` — every
  relation declares `onDelete`; the migration flips the six user-owned
  per-guild rows (including `moderation_cases`) to `CASCADE` (D5).
- `turbo.json` — `inputs` declared for `lint`, `typecheck` and `test` (I12).
