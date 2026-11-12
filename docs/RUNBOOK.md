# Runbook

Operational procedures for the single-VPS production deployment described in
`docs/UPGRADE_ROADMAP.md`.

## Health checks

| Endpoint | Answers | Expected |
| --- | --- | --- |
| `GET /api/health/live` | Is the process alive? | `200` while the event loop runs. Never restarts on dependency failure. |
| `GET /api/health/ready` | Can it serve traffic? | `200` when database, bot internal API and Discord API respond; `503` otherwise. |
| `GET /api/health` | Legacy alias for readiness | Kept for existing probes. |
| `GET /internal/ping` | Bot internal API liveness | `{ success: true, uptime }` |
| `GET /internal/metrics` | Process + voice session counters | Bot-side metrics (memory, voice sessions, cache size). |

Nginx and the monitoring stack should point at `/api/health/live` for liveness
and `/api/health/ready` for load-balancer eligibility.

## Deploy

The owner dashboard triggers the GitHub Actions release workflow. On the server,
`scripts/install.sh` is idempotent and ends with a blue-green switch:

```bash
sudo -u pinguin bash scripts/install.sh
```

The script runs `pnpm install --frozen-lockfile`, `prisma generate`,
`next build`, restarts PM2 apps, then smoke-tests the API and the web server.
`/opt/pinguinboat/releases` keeps the last five releases; `/opt/pinguinboat/backup`
holds nightly dumps.

### Rollback

```bash
ln -sfn /opt/pinguinboat/releases/<previous-sha> /opt/pinguinboat/current
pm2 restart pinguin-api pinguin-bot pinguin-web
```

If a migration is the problem, restore the nightly dump from
`/opt/pinguinboat/backup` and re-run `prisma migrate resolve` for the failing
migration before redeploying.

## Database

### Connection pooling

Postgres limits connections per database. With three Node processes each opening
a Prisma pool, the default pool size can exhaust Postgres during a spike. Set:

```env
DATABASE_CONNECTION_LIMIT=5     # per process
DATABASE_POOL_TIMEOUT=10
```

`@pinguin/db` appends these to `DATABASE_URL` as `connection_limit` and
`pool_timeout`.

### Migrations

* Development: `pnpm --filter @pinguin/db db:migrate` (`prisma migrate dev`).
* Production / CI: `pnpm db:migrate:prod` (`prisma migrate deploy`).
* Fresh database: load `packages/db/prisma/baseline/migration.sql`, then
  `prisma migrate resolve --applied` for each existing migration (see
  `packages/db/prisma/baseline/README.md`). Regenerate the baseline whenever the
  schema changes so the two paths stay equivalent.
* `pnpm --filter @pinguin/db db:migrate` runs `migrate dev` with the
  non-interactive flags; it never resets a database. `db:migrate:status` shows
  pending migrations, and `db:migrate:baseline` marks every migration in the
  folder as applied on a database that already has the schema.

Never edit an applied migration. To change a column type or backfill JSON, add a
new migration with a documented rollout (backfill, switch, drop).

## Backup and restore

`backup.sh` produces nightly dumps in `DEPLOY_BACKUPS_PATH`.

To restore a guild whose data was wiped, use the dashboard backup/restore feature
(`GET/PUT /api/guilds/:guildId/backup`) — it restores channels, roles and
permissions through the bot, not the database.

To restore the whole database:

```bash
pg_restore --clean --if-exists -d "$DATABASE_URL" <dump-file>
pnpm --filter @pinguin/db db:migrate:prod
pm2 restart pinguin-api pinguin-bot
```

## Cache invalidation

The bot caches guild configuration (XP, economy, automod, welcome, music) for 60 s.
After a dashboard change the API calls:

```bash
POST /internal/guilds/:guildId/config/invalidate
POST /internal/config/invalidate      # every guild
```

Both are wired automatically: the guild routes fire an `onResponse` hook after
any successful mutation. If a setting appears stale for more than a minute,
check the bot logs for `invalidateBotGuildConfig failed`.

## Secrets

* Rotate `SESSION_SECRET` to invalidate every session immediately.
* Regenerate `BOT_INTERNAL_SECRET` and restart both the API and the bot together.
* `OWNER_PASSWORD` is hashed with Argon2 into `owner_passwords`; the env var is
  only a bootstrap value. Rotating the DB row is the supported path.
* `gitleaks` runs in CI and on a weekly schedule
  (`.github/workflows/secret-scan.yml`).

## Common alerts

| Symptom | Check |
| --- | --- |
| `503` on `/api/health/ready` with `bot.error = BOT_OFFLINE` | Bot process, `BOT_INTERNAL_URL`, internal secret. |
| `503` with `database.error` | Postgres reachable from the API host; connection pool not exhausted. |
| Dashboard shows stale settings | Bot config cache: see above. |
| Music playback stops after restart | Queue rows are rehydrated lazily; confirm `music_queues` rows exist and the bot is in the guild. |
| High memory on web | Next standalone with `instances: 2`; check `/internal/metrics` for the bot side. |
## Owner 2FA recovery codes

Recovery codes are generated (eight, `xxxx-xxxx-xxxx`) when 2FA is set up and
shown once. Only SHA-256 hashes are stored in `owner_2fa.recovery_codes`, and
each code is single-use. The `2FA` page shows how many remain and can reissue
them after a valid TOTP code (`POST /api/owner/2fa/recovery-codes`).

If the owner loses both the TOTP device and the codes, clear the factor from the
server (the owner is still protected by `OWNER_PASSWORD` and the lockout):

```bash
psql "$DATABASE_URL" -c 'UPDATE owner_2fa SET enabled = false, verified = false, recovery_codes = NULL;'
pm2 restart pinguin-api
```

Then sign in with the owner password and re-enrol from the dashboard.

## Retention and idempotency

* Log retention: every six hours the API deletes rows past each window
  (`AUDIT_LOGS_RETENTION_DAYS` and friends, see `docs/ENV_REFERENCE.md`). Lower
  a window before an expected backup run if the dump is too large; set it to
  `0` to keep everything.
* `idempotency_records` keeps replayed responses for 24 h. Dangerous POSTs sent
  with an `Idempotency-Key` header are replayed (`Idempotent-Replayed: true`)
  instead of executed twice; a repeated key with a different body returns 422,
  and a retry while the first request still runs returns 409.
