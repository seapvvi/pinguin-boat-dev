-- D5: make every relation's delete rule explicit.
--
-- Most policies already existed in the baseline SQL but were implicit in the
-- Prisma schema. This migration covers the six rows whose policy actually
-- changes: per-guild rows that belong to a user (moderation cases, XP, wallet,
-- ticket claims, giveaway entries, premium subscription) are meaningless
-- without them, so they cascade instead of blocking a user delete with a
-- foreign-key error.

-- moderation_cases
ALTER TABLE "moderation_cases" DROP CONSTRAINT IF EXISTS "moderation_cases_user_id_fkey";
ALTER TABLE "moderation_cases" ADD CONSTRAINT "moderation_cases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("discord_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ticket_claims
ALTER TABLE "ticket_claims" DROP CONSTRAINT IF EXISTS "ticket_claims_user_id_fkey";
ALTER TABLE "ticket_claims" ADD CONSTRAINT "ticket_claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("discord_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- xp_profiles
ALTER TABLE "xp_profiles" DROP CONSTRAINT IF EXISTS "xp_profiles_user_id_fkey";
ALTER TABLE "xp_profiles" ADD CONSTRAINT "xp_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("discord_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- economy_wallets
ALTER TABLE "economy_wallets" DROP CONSTRAINT IF EXISTS "economy_wallets_user_id_fkey";
ALTER TABLE "economy_wallets" ADD CONSTRAINT "economy_wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("discord_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- giveaway_entries
ALTER TABLE "giveaway_entries" DROP CONSTRAINT IF EXISTS "giveaway_entries_user_id_fkey";
ALTER TABLE "giveaway_entries" ADD CONSTRAINT "giveaway_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- premium_subscriptions
ALTER TABLE "premium_subscriptions" DROP CONSTRAINT IF EXISTS "premium_subscriptions_user_id_fkey";
ALTER TABLE "premium_subscriptions" ADD CONSTRAINT "premium_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;