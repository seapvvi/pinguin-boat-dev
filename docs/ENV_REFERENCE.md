# Environment reference

Generated from `packages/config/src/index.ts` (single source of truth: fail-fast
validation at startup). Values marked **secret** must never be committed.

## Discord

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `DISCORD_CLIENT_ID` | yes | – | Application ID. |
| `DISCORD_CLIENT_SECRET` | yes | – | OAuth2 client secret. |
| `DISCORD_TOKEN` | yes | – | Bot token. |
| `DISCORD_PUBLIC_KEY` | yes | – | Interaction verification key. |
| `DISCORD_OWNER_ID` | yes | – | Discord user id allowed into the owner dashboard. |
| `DISCORD_SUPPORT_INVITE` | no | – | Used in the blacklist rejection message. |
| `DISCORD_DEV_GUILD_ID` | no | – | Dev guild for command registration. |
| `NEXT_PUBLIC_DISCORD_CLIENT_ID` | yes | – | Public client id used by the browser. |
| `BOT_ACTIVITY_TYPE` | no | `0` | Presence type (0 = playing). |
| `BOT_ACTIVITY_NAME` | no | `/help` | Presence text. |

## Database

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | yes | – | Postgres connection string. |
| `DATABASE_CONNECTION_LIMIT` | no | Prisma default | Added to the URL as `connection_limit`. |
| `DATABASE_POOL_TIMEOUT` | no | Prisma default | Added to the URL as `pool_timeout`. |

Put the API, bot and Next behind PgBouncer (transaction mode) and set a low
`DATABASE_CONNECTION_LIMIT` per process; see `docs/RUNBOOK.md`.

## Secrets and sessions

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `OWNER_PASSWORD` | yes (once set) | – | Min 12 chars. Bootstraps `owner_passwords`; the DB row then wins. |
| `SETUP_PASSWORD` | no | – | Consumed by `/api/setup/complete`, then removed. |
| `SESSION_SECRET` | yes | – | Min 32 chars. **Rotate on suspected exposure** (invalidates every session). |
| `SESSION_MAX_AGE` | no | `604800` | Seconds. |
| `BOT_INTERNAL_SECRET` | yes | dev fallback | Min 32 chars; required in production. Shared secret for the internal bot API. |
| `NEXTAUTH_SECRET` | no | – | Present for compatibility, unused today. |

## URLs and network

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `NODE_ENV` | no | `development` | `development` \| `production` \| `test`. |
| `API_HOST` | no | `0.0.0.0` | |
| `API_PORT` | no | `4000` | |
| `API_URL` | no | computed | Public API base. |
| `API_INTERNAL_PORT` | no | `3001` | Bot internal API port. |
| `BOT_INTERNAL_URL` | no | `http://localhost:3001` | |
| `NEXT_PUBLIC_API_URL` | no | `http://localhost:4000` | Browser-facing API base. |
| `NEXT_PUBLIC_APP_URL` | no | `http://localhost:3000` | Used to build OAuth redirect URIs. |
| `NEXT_PUBLIC_SITE_URL` | no | `http://localhost:3000` | Used by sitemap/robots. |
| `CORS_ORIGIN` | no | `http://localhost:3000` | Comma-separated allow-list. |

## Media providers

`YOUTUBE_COOKIE`, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`,
`SOUNDCLOUD_CLIENT_ID`, `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`,
`YOUTUBE_API_KEY`, `PASTEBIN_API_KEY` — all optional. Missing keys degrade that
provider only. `YOUTUBE_COOKIE` is written to a `0600` temp file and deleted on
exit.

## Deploy and release

`GITHUB_REPO`, `GITHUB_TOKEN` (optional), `GITHUB_BRANCH` (default `master`),
`DEPLOY_PATH` (default `/opt/pinguinboat/releases`), `DEPLOY_RELEASES_PATH`,
`DEPLOY_SHARED_PATH`, `DEPLOY_CURRENT_LINK`, `DEPLOY_BACKUPS_PATH`.

## Premium / feature flags

`PREMIUM_ENABLED` (default `true`), `ALPHA_ALL_FREE` (default `false`),
`LOG_LEVEL` (default `info`), `LOG_FORMAT` (`json` \| `pretty`).

## Data retention

Log tables are pruned by `apps/api/src/jobs/cleanup-retention.ts` every six
hours. Each table accepts an override in days; `0` or a negative value disables
pruning for that table.

| Variable | Default | Table pruned |
| --- | --- | --- |
| `AUDIT_LOGS_RETENTION_DAYS` | `180` | `audit_logs` (older than N days) |
| `OWNER_LOGS_RETENTION_DAYS` | `365` | `owner_logs` |
| `SYSTEM_METRICS_SNAPSHOTS_RETENTION_DAYS` | `30` | `system_metrics_snapshots` |
| `MUSIC_HISTORY_RETENTION_DAYS` | `180` | `music_history` |

## Webhooks

`OWNER_WEBHOOK_URL`, `DISCORD_WEBHOOK_IDS` / `DISCORD_WEBHOOK_URLS` — used for
owner alerts and moderation log routing.