CREATE TABLE IF NOT EXISTS "idempotency_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "status" INTEGER,
    "response" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),

    CONSTRAINT "idempotency_records_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idempotency_records_expires_at_idx" ON "idempotency_records" ("expires_at");
