import re

p = 'docs/UPGRADE_ROADMAP.md'
# The file uses U+00B7 written back as 0xB7; normalise so replacements match.
s = open(p, encoding='utf-8').read()
SEP = chr(0xB7)  # middle dot as stored in this file

# (id, status, note)
status = {
    'W1': (' ', 'not started — no route boundary files exist yet'),
    'W2': (' ', 'not started'),
    'W3': ('x', 'shipped: 15 s timeout, AbortSignal, jittered backoff, typed `ApiError`, ETag cache'),
    'W4': ('x', 'shipped: demo payload only via `isPreview()`/auth-refusal; other errors rethrow'),
    'W5': ('x', 'shipped: Discord CDN images converted, AVIF/WebP on, user URLs stay `unoptimized`'),
    'W6': (' ', 'not started — 5 dynamic imports today'),
    'W7': ('x', 'shipped: ⌘K palette with fuzzy search, recents, owner pages, `Cmd/Ctrl+K`'),
    'W8': (' ', 'not started'),
    'W9': (' ', 'not started'),
    'W10': (' ', 'not started'),
    'W11': (' ', 'not started — palette and 2FA gate ship keyboard/`aria` behaviour only'),
    'W12': (' ', 'not started — `opengraph-image.tsx`, `sitemap.ts`, `robots.ts` exist; landing is still client'),
    'W13': (' ', 'not started'),
    'W14': (' ', 'not started'),
    'W15': ('x', 'stray files (`___temp_fix_guard.tsx`, `middleware.ts.bak`) are gone; no guard is in CI yet'),
    'A1': ('x', 'shipped: Brotli + gzip, 1 KB threshold, SSE skipped'),
    'A2': ('x', 'shipped: cache util used for Discord lookups and guild config, invalidated on write'),
    'A3': ('x', 'shipped: memberships query joins the guild, Discord lookups cached 60 s'),
    'A4': ('x', 'shipped: 30–60 s session + blacklist cache, invalidated on logout/rotation'),
    'A5': (' ', 'not started'),
    'A6': (' ', 'not started'),
    'A7': ('x', 'shipped: per-domain limits with per-user/IP key and `X-RateLimit-*`/`Retry-After` headers'),
    'A8': ('x', 'shipped this round for guild bodies (see note)'),
    'A9': (' ', 'not started'),
    'A10': ('x', 'shipped: `Idempotency-Key` on every owner POST, stored 24 h'),
    'A11': ('x', 'shipped: `/health/live` and `/health/ready`, legacy `/health` kept'),
    'A12': (' ', 'not started — ETag cache exists client-side only (W3)'),
    'A13': (' ', 'not started'),
    'A14': ('x', 'shipped: `safeJsonParse`/`parseIdList` replace inline `JSON.parse` on read paths'),
    'A15': (' ', 'not started'),
    'B1': ('x', 'shipped: cached settings/rewards, one transaction, no per-message `ensureUser` chain'),
    'B2': ('x', 'shipped: `services/guild-config.ts` is the single cached config entry point'),
    'B3': ('x', 'shipped: queue persisted with debounce, rehydrated on demand, orphans pruned'),
    'B4': (' ', 'not started — still yt-dlp per track'),
    'B5': (' ', 'not started'),
    'B6': ('x', 'shipped: shared concurrency queue, `Retry-After`/backoff, circuit breaker'),
    'B7': ('~', 'body limit, timeout, request IDs and auth are in place; still a raw `http` server with string paths'),
    'B8': ('x', 'shipped: crons stopped, music flushed, client destroyed, Prisma disconnected'),
    'B9': (' ', 'not started'),
    'B10': ('~', '`/internal/metrics` exists (memory, voice sessions, cache) but is not Prometheus format'),
    'B11': (' ', 'not started'),
    'B12': (' ', 'not started'),
    'D1': ('x', 'shipped: `[guildId, createdAt]`, `[guildId, active, createdAt]`, `[botPresent, memberCount]`'),
    'D2': ('x', 'shipped: baseline SQL + `db:migrate` runs `migrate dev` non-interactively'),
    'D3': ('~', 'shipped this round: scheduled row retention in the API job (no partitions/summaries yet)'),
    'D4': (' ', 'not started'),
    'D5': ('~', 'guild cascade is explicit (`onDelete: Cascade` on `guild_id`); no delete-a-guild integration test'),
    'D6': ('x', 'shipped: `DATABASE_CONNECTION_LIMIT`/`DATABASE_POOL_TIMEOUT` appended to the URL'),
    'D7': (' ', 'not started — JSON-string columns unchanged'),
    'D8': (' ', 'not started'),
    'D9': (' ', 'not started'),
    'D10': (' ', 'not started'),
    'D11': (' ', 'not started'),
    'I1': ('x', 'shipped: one `apps` array, valid JSON'),
    'I2': (' ', 'not started'),
    'I3': (' ', 'not started — Redis service defined in `docker-compose.yml`, nothing connects'),
    'I4': (' ', 'not started'),
    'I5': ('~', 'compose has Postgres + Redis; no MinIO/MailHog, no task runner, no demo seed'),
    'I6': (' ', 'not started — no coverage gate, bundle budget or smoke test; `pnpm audit` not in CI'),
    'I7': (' ', 'not started'),
    'I8': (' ', 'not started'),
    'I9': ('x', 'shipped: husky + lint-staged + commitlint + `.editorconfig`'),
    'I10': ('~', 'shipped this round: migration, retention, idempotency and 2FA recovery sections'),
    'I11': ('~', '`kill-ports.js` is Node; other scripts remain bash-only'),
    'I12': ('~', '`lint` depends on `typecheck` removed and `test` cached; inputs/outputs still coarse'),
    'S1': ('x', 'shipped: hashed one-time recovery codes, regenerate endpoint, lockout alert'),
    'S2': ('x', 'shipped: `__Host-session` in production, rotation on owner/2FA, other sessions revoked'),
    'S3': ('x', 'shipped: cookie file written `0600`, orphaned files removed on start'),
    'S4': ('~', 'report-only CSP shipped in `next.config.js`; not yet enforcing, `unsafe-inline` still allowed'),
    'S5': (' ', 'not started'),
    'S6': ('~', '`logOwnerAction` covers mutations; before/after values and shared secrets are inconsistent'),
    'S7': (' ', 'not started'),
    'S8': ('x', 'shipped: gitleaks secret-scan workflow present'),
}

notes = {
    'A8': 'shipped this round for guild bodies: zod schemas in `utils/route-schemas.ts`, unknown keys stripped by `validate()`, typed 400s naming the field. `validate()` itself still has two pre-existing `any`s.',
    'I12': None,
    'D3': None,
}

for item, (mark, note) in list(status.items()):
    if notes.get(item):
        note = notes[item]
    status[item] = (mark, note)

def heading(match: re.Match) -> str:
    item = match.group(1)
    mark = status[item][0]
    return f'#### [{mark}] {item} · {match.group(2)}'

s = re.sub(r'#### (\b[WABDIS]\d{1,2}\b) · (.+)', heading, s)

def meta(match: re.Match) -> str:
    raw = match.group(1)
    item = PENDING.pop(0)
    mark, note = status[item]
    head = raw.replace(chr(0xB7), chr(0x00B7))
    return '**' + head + ' ' + chr(0x00B7) + ' status `[' + mark + ']`** ' + chr(0x2014) + ' ' + note

# Phase lists
def phase(label, body):
    global s
    start = s.index(label)
    end = s.index('\n---\n', start)
    return start, end

s = s.replace("""### Phase 1 — Performance (weeks 2–3)

- Fix `/api/overview` N+1 and add guild config cache
- Fix the XP hot path and cache config
- Make the music queue durable
- Move the dashboard to RSC + a shared query layer
- Add `next/image` and code-split heavy libraries
- Introduce Redis and configure DB pooling""",
"""### Phase 1 — Performance (weeks 2–3) `[~]`

- [x] Fix `/api/overview` N+1 and add guild config cache
- [x] Fix the XP hot path and cache config
- [x] Make the music queue durable
- [ ] Move the dashboard to RSC + a shared query layer
- [~] Add `next/image` (done) and code-split heavy libraries (open)
- [~] Introduce Redis (open) and configure DB pooling (done)""")

s = s.replace("""### Phase 0 — Stabilize (week 1)

- Fix pm2 config and add JSON validation
- Compress API responses
- Guard demo-data fallback
- Add composite indexes
- Create a migration baseline
- Split health / readiness checks""",
"""### Phase 0 — Stabilize (week 1) `[x]`

- [x] Fix pm2 config and add JSON validation
- [x] Compress API responses
- [x] Guard demo-data fallback
- [x] Add composite indexes
- [x] Create a migration baseline
- [x] Split health / readiness checks""")

s = s.replace("""### Phase 2 — Experience (weeks 4–6)

- Command palette
- Bulk actions and saved views
- Real-time dashboard updates
- Design system consolidation and accessibility pass
- Music rewrite (playlists, filters, lyrics)
- Retention jobs for log tables""",
"""### Phase 2 — Experience (weeks 4–6) `[~]`

- [x] Command palette
- [ ] Bulk actions and saved views
- [ ] Real-time dashboard updates
- [ ] Design system consolidation and accessibility pass
- [ ] Music rewrite (playlists, filters, lyrics)
- [x] Retention jobs for log tables (row retention; partitioning still open)""")

s = s.replace("""### Phase 3 — Scale (weeks 7+)

- Sharding and presence audit
- Read replica / materialized views
- Blobs to object storage
- OpenAPI and generated client
- Observability and load tests
- Postgres partitioning""",
"""### Phase 3 — Scale (weeks 7+) `[ ]`

- [ ] Sharding and presence audit
- [ ] Read replica / materialized views
- [ ] Blobs to object storage
- [ ] OpenAPI and generated client
- [ ] Observability and load tests
- [ ] Postgres partitioning""")

open(p, 'w', encoding='utf-8').write(s)
print('ok')
