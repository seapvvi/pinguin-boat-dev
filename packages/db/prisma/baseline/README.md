# Schema baseline

`baseline/migration.sql` is a full `CREATE …` script generated from
`schema.prisma` with:

```bash
pnpm --filter @pinguin/db exec prisma migrate diff \
  --from-empty --to-schema-datamodel prisma/schema.prisma --script \
  > prisma/baseline/migration.sql
```

It exists so a brand-new database can be created in one step instead of
replaying incremental migrations whose intermediate states were never
backfilled. It is **not** placed in `migrations/` on purpose: existing
deployments already have those incremental migrations recorded in
`_prisma_migrations`, and dropping them would break their history.

## Fresh database

```bash
# 1. Create the schema in one step
psql "$DATABASE_URL" -f packages/db/prisma/baseline/migration.sql

# 2. Record every existing migration as already applied
pnpm --filter @pinguin/db exec prisma migrate resolve --applied 20260602000000_add_poll_advanced_features
pnpm --filter @pinguin/db exec prisma migrate resolve --applied 20260605000000_add_stream_notification_tracking
pnpm --filter @pinguin/db exec prisma migrate resolve --applied 20260605210000_add_notification_customization
pnpm --filter @pinguin/db exec prisma migrate resolve --applied 20260610000000_add_ticket_category_fields
pnpm --filter @pinguin/db exec prisma migrate resolve --applied 20260614000000_fix_ownerid_unknown
pnpm --filter @pinguin/db exec prisma migrate resolve --applied 20260615000000_add_rank_card_and_xp_multiplier
pnpm --filter @pinguin/db exec prisma migrate resolve --applied 20260619000000_add_pending_popup
pnpm --filter @pinguin/db exec prisma migrate resolve --applied 20260621000000_add_idempotency_records
pnpm --filter @pinguin/db exec prisma migrate resolve --applied 20260621000100_add_owner_2fa_recovery_codes

# 3. From now on, normal incremental migrations apply
pnpm --filter @pinguin/db db:migrate:prod
```

## Existing database

Nothing to do: it already has the incremental history. Keep using
`prisma migrate deploy` in CI and production (`pnpm db:migrate:prod`).

## Keeping the baseline honest

Whenever the schema changes, regenerate the baseline in the same PR:

```bash
pnpm --filter @pinguin/db exec prisma migrate diff \
  --from-empty --to-schema-datamodel prisma/schema.prisma --script \
  > prisma/baseline/migration.sql
```

`prisma migrate diff --from-migrations ./migrations --to-schema-datamodel prisma/schema.prisma`
should report "no difference" — that is the drift check to run in CI once a
database is available. The baseline is a convenience for brand-new databases;
the migrations in `migrations/` remain the source of truth, so the schema change
and the incremental migration must land together.
