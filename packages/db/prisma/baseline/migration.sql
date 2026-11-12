-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "LogEventType" AS ENUM ('MESSAGE_DELETE', 'MESSAGE_EDIT', 'MEMBER_JOIN', 'MEMBER_LEAVE', 'MEMBER_BAN', 'MEMBER_UNBAN', 'MEMBER_KICK', 'MEMBER_TIMEOUT', 'MEMBER_ROLE_ADD', 'MEMBER_ROLE_REMOVE', 'CHANNEL_CREATE', 'CHANNEL_DELETE', 'CHANNEL_UPDATE', 'ROLE_CREATE', 'ROLE_DELETE', 'ROLE_UPDATE', 'VOICE_JOIN', 'VOICE_LEAVE', 'VOICE_MOVE', 'EMOJI_CREATE', 'EMOJI_DELETE', 'INVITE_CREATE', 'INVITE_DELETE', 'THREAD_CREATE', 'THREAD_DELETE', 'THREAD_UPDATE', 'STAGE_START', 'STAGE_END', 'AUTO_MOD', 'MEMBER_WARN', 'MEMBER_MUTE', 'MEMBER_UNMUTE');

-- CreateEnum
CREATE TYPE "LevelUpNotification" AS ENUM ('DM', 'CHANNEL', 'NONE');

-- CreateEnum
CREATE TYPE "ModerationCaseType" AS ENUM ('WARN', 'MUTE', 'UNMUTE', 'KICK', 'BAN', 'TEMPBAN', 'UNBAN', 'TIMEOUT');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'CLAIMED', 'PENDING', 'CLOSED', 'DELETED');

-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'ROLLED_BACK');

-- CreateEnum
CREATE TYPE "DeployEnvironment" AS ENUM ('DEVELOPMENT', 'STAGING', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "AutoroleType" AS ENUM ('JOIN', 'BOT', 'LEVEL', 'REACTION');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DAILY', 'TRANSFER', 'SHOP_BUY', 'GAMBLE', 'ADMIN', 'EARN', 'INTEREST');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('ROLE', 'XP_BOOST', 'ANTI_THEFT', 'LOTTO_TICKET');

-- CreateEnum
CREATE TYPE "QuestType" AS ENUM ('DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "QuestStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "QuestObjectiveType" AS ENUM ('SEND_MESSAGES', 'WIN_BLACKJACK', 'WIN_ROULETTE', 'EARN_MONEY', 'USE_COMMAND', 'LEVEL_UP');

-- CreateEnum
CREATE TYPE "GiveawayStatus" AS ENUM ('RUNNING', 'ENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PollStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'IMPLEMENTED');

-- CreateEnum
CREATE TYPE "LoopMode" AS ENUM ('NONE', 'TRACK', 'QUEUE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('GUILD_UPDATE', 'GUILD_DELETE', 'MEMBER_KICK', 'MEMBER_BAN', 'MEMBER_UNBAN', 'MEMBER_TIMEOUT', 'MEMBER_WARN', 'MEMBER_MUTE', 'MEMBER_UNMUTE', 'TICKET_CREATE', 'TICKET_CLOSE', 'TICKET_DELETE', 'MESSAGE_CREATE', 'MESSAGE_PURGE', 'ROLE_CREATE', 'ROLE_DELETE', 'ROLE_UPDATE', 'CHANNEL_CREATE', 'CHANNEL_DELETE', 'CHANNEL_UPDATE', 'SETTINGS_UPDATE', 'PREMIUM_UPDATE', 'ECONOMY_ADMIN', 'PLUGIN_ENABLE', 'PLUGIN_DISABLE', 'BLACKLIST_ADD', 'BLACKLIST_REMOVE', 'BLACKLIST_USER', 'UNBLACKLIST_USER', 'BLACKLIST_GUILD', 'UNBLACKLIST_GUILD', 'FORCE_LEAVE', 'DEPLOYMENT_START', 'DEPLOYMENT_SUCCESS', 'DEPLOYMENT_FAILURE', 'DEPLOYMENT_ROLLBACK', 'PREMIUM_GRANT', 'PREMIUM_REVOKE', 'ALPHA_MODE_TOGGLE', 'CHANGELOG_PUBLISH', 'GLOBAL_ANNOUNCEMENT', 'SERVICE_RESTART', 'BACKUP_CREATED', 'BACKUP_RESTORED', 'SETTINGS_CHANGE', 'OWNER_LOGIN', 'OWNER_LOGOUT', 'MODERATION_CASE_DELETED', 'MODERATION_CASE_REVOKED', 'AUTO_MOD_VIOLATION', 'AUTO_MOD_SANCTION');

-- CreateEnum
CREATE TYPE "stream_platform" AS ENUM ('TWITCH', 'YOUTUBE');

-- CreateEnum
CREATE TYPE "MarketListingStatus" AS ENUM ('ACTIVE', 'SOLD', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ClanRole" AS ENUM ('OWNER', 'OFFICER', 'MEMBER');

-- CreateEnum
CREATE TYPE "ClanWarStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "discord_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "display_name" TEXT,
    "avatar" TEXT,
    "email" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'fr',
    "theme" TEXT NOT NULL DEFAULT 'DARK',
    "snowflakes" BOOLEAN NOT NULL DEFAULT true,
    "notify_daily" BOOLEAN NOT NULL DEFAULT false,
    "notify_weekly" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "guild_id" TEXT,
    "token" TEXT NOT NULL,
    "discord_access_token" TEXT,
    "discord_refresh_token" TEXT,
    "discord_token_expires_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "owner_verified_at" TIMESTAMP(3),
    "owner_2fa_verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owner_2fa" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "last_verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owner_2fa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owner_password" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owner_password_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guilds" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "owner_id" TEXT,
    "member_count" INTEGER NOT NULL DEFAULT 0,
    "bot_present" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guilds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "music_settings" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "max_queue_length" INTEGER NOT NULL DEFAULT 50,
    "max_playlist_length" INTEGER NOT NULL DEFAULT 50,
    "default_volume" INTEGER NOT NULL DEFAULT 50,
    "allow_dj_role" BOOLEAN NOT NULL DEFAULT false,
    "dj_role_id" TEXT,
    "restrict_to_voice_channel" BOOLEAN NOT NULL DEFAULT false,
    "voice_channel_id" TEXT,
    "announce_tracks" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "music_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guild_settings" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "prefix" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'fr',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Paris',
    "mod_log_channel" TEXT,
    "mod_role_ids" TEXT NOT NULL DEFAULT '[]',
    "admin_role_ids" TEXT NOT NULL DEFAULT '[]',
    "mute_role_id" TEXT,
    "dashboard_access_roles" TEXT NOT NULL DEFAULT '[]',
    "dashboard_moderation_access" TEXT NOT NULL DEFAULT '[]',
    "dashboard_tickets_access" TEXT NOT NULL DEFAULT '[]',
    "dashboard_polls_access" TEXT NOT NULL DEFAULT '[]',
    "dashboard_suggestions_access" TEXT NOT NULL DEFAULT '[]',
    "dashboard_giveaways_access" TEXT NOT NULL DEFAULT '[]',
    "dashboard_economy_access" TEXT NOT NULL DEFAULT '[]',
    "dashboard_music_access" TEXT NOT NULL DEFAULT '[]',
    "dashboard_levels_access" TEXT NOT NULL DEFAULT '[]',
    "dashboard_welcome_access" TEXT NOT NULL DEFAULT '[]',
    "dashboard_autoroles_access" TEXT NOT NULL DEFAULT '[]',
    "dashboard_logs_access" TEXT NOT NULL DEFAULT '[]',
    "dashboard_protection_access" TEXT NOT NULL DEFAULT '[]',
    "dashboard_audit_access" TEXT NOT NULL DEFAULT '[]',
    "changelog_channel" TEXT,
    "suggestion_channel_id" TEXT,
    "onboarding_done" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guild_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_sources" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "onboarding_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules_enabled" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "moderation" BOOLEAN NOT NULL DEFAULT true,
    "protection" BOOLEAN NOT NULL DEFAULT true,
    "tickets" BOOLEAN NOT NULL DEFAULT true,
    "logs" BOOLEAN NOT NULL DEFAULT true,
    "levels" BOOLEAN NOT NULL DEFAULT true,
    "economy" BOOLEAN NOT NULL DEFAULT false,
    "music" BOOLEAN NOT NULL DEFAULT true,
    "giveaways" BOOLEAN NOT NULL DEFAULT true,
    "polls" BOOLEAN NOT NULL DEFAULT true,
    "suggestions" BOOLEAN NOT NULL DEFAULT true,
    "welcome" BOOLEAN NOT NULL DEFAULT true,
    "autoroles" BOOLEAN NOT NULL DEFAULT true,
    "embeds" BOOLEAN NOT NULL DEFAULT true,
    "minigames" BOOLEAN NOT NULL DEFAULT true,
    "starboard" BOOLEAN NOT NULL DEFAULT false,
    "forms" BOOLEAN NOT NULL DEFAULT false,
    "clans" BOOLEAN NOT NULL DEFAULT false,
    "notifications" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modules_enabled_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stream_notifications" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "platform" "stream_platform" NOT NULL,
    "channel_name" TEXT NOT NULL,
    "channel_id" TEXT,
    "discord_channel_id" TEXT NOT NULL,
    "last_live_at" TIMESTAMP(3),
    "is_live" BOOLEAN NOT NULL DEFAULT false,
    "last_video_id" TEXT,
    "last_live_id" TEXT,
    "custom_title" TEXT,
    "custom_description" TEXT,
    "custom_color" TEXT,
    "custom_footer" TEXT,
    "mention_role_id" TEXT,
    "ping_everyone_on_live" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stream_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_cases" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "moderator_id" TEXT NOT NULL,
    "type" "ModerationCaseType" NOT NULL,
    "reason" TEXT NOT NULL,
    "duration" INTEGER,
    "expires_at" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moderation_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warnings" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "moderator_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "category_id" TEXT,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "claimed_by_id" TEXT,
    "closed_by_id" TEXT,
    "closed_at" TIMESTAMP(3),
    "transcript_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_claims" (
    "id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "claimed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_categories" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "staff_role_ids" TEXT NOT NULL DEFAULT '[]',
    "max_tickets_per_user" INTEGER NOT NULL DEFAULT 5,
    "opening_mode" TEXT NOT NULL DEFAULT 'BUTTON',
    "form_id" TEXT,
    "welcome_message" TEXT,
    "color" TEXT NOT NULL DEFAULT '#5865F2',
    "emoji" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcript_metas" (
    "id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "file_url" TEXT,
    "content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transcript_metas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_settings" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "log_channel_id" TEXT,
    "events" TEXT NOT NULL DEFAULT '[]',
    "ignored_channels" TEXT NOT NULL DEFAULT '[]',
    "ignored_roles" TEXT NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "log_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_settings" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "xp_per_message_min" INTEGER NOT NULL DEFAULT 15,
    "xp_per_message_max" INTEGER NOT NULL DEFAULT 25,
    "voice_xp" INTEGER NOT NULL DEFAULT 10,
    "message_cooldown" INTEGER NOT NULL DEFAULT 60,
    "voice_cooldown" INTEGER NOT NULL DEFAULT 120,
    "level_formula" TEXT NOT NULL DEFAULT '100 * level * 1.5',
    "max_level" INTEGER NOT NULL DEFAULT 1000,
    "ignored_channels" TEXT NOT NULL DEFAULT '[]',
    "ignored_roles" TEXT NOT NULL DEFAULT '[]',
    "announcement_channel_id" TEXT,
    "announcement_message" TEXT,
    "xp_curve" TEXT NOT NULL DEFAULT 'exponential',
    "xp_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "no_xp_roles" TEXT NOT NULL DEFAULT '[]',
    "no_xp_channels" TEXT NOT NULL DEFAULT '[]',
    "booster_roles" TEXT NOT NULL DEFAULT '[]',
    "booster_channels" TEXT NOT NULL DEFAULT '[]',
    "xp_in_threads" BOOLEAN NOT NULL DEFAULT true,
    "xp_in_forum_posts" BOOLEAN NOT NULL DEFAULT true,
    "xp_vocal_messages" BOOLEAN NOT NULL DEFAULT false,
    "show_other_levels" BOOLEAN NOT NULL DEFAULT true,
    "reset_on_leave" BOOLEAN NOT NULL DEFAULT false,
    "reset_on_ban" BOOLEAN NOT NULL DEFAULT false,
    "double_xp_long_messages" BOOLEAN NOT NULL DEFAULT false,
    "online_leaderboard" BOOLEAN NOT NULL DEFAULT true,
    "discord_leaderboard" BOOLEAN NOT NULL DEFAULT true,
    "level_color" TEXT NOT NULL DEFAULT '#14b8a6',
    "reward_announce" BOOLEAN NOT NULL DEFAULT true,
    "reward_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "xp_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_profiles" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 0,
    "voice_xp" INTEGER NOT NULL DEFAULT 0,
    "message_count" INTEGER NOT NULL DEFAULT 0,
    "voice_minutes" INTEGER NOT NULL DEFAULT 0,
    "last_message_at" TIMESTAMP(3),
    "last_voice_at" TIMESTAMP(3),
    "level_up_notification" "LevelUpNotification" NOT NULL DEFAULT 'CHANNEL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "xp_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_role_rewards" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "level_required" INTEGER NOT NULL,
    "remove_on_level" BOOLEAN NOT NULL DEFAULT false,
    "xp_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_role_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "economy_wallets" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "wallet" INTEGER NOT NULL DEFAULT 0,
    "bank" INTEGER NOT NULL DEFAULT 0,
    "total_earned" INTEGER NOT NULL DEFAULT 0,
    "last_daily_at" TIMESTAMP(3),
    "last_weekly_at" TIMESTAMP(3),
    "xp_boost_ends_at" TIMESTAMP(3),
    "xp_boost_multiplier" INTEGER NOT NULL DEFAULT 2,
    "anti_theft_ends_at" TIMESTAMP(3),
    "lotto_tickets_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "economy_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "economy_transactions" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "from_user_id" TEXT,
    "to_user_id" TEXT,
    "amount" INTEGER NOT NULL,
    "type" "TransactionType" NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "economy_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quests" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "type" "QuestType" NOT NULL,
    "objective_type" "QuestObjectiveType" NOT NULL,
    "objective_target" INTEGER NOT NULL,
    "reward" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_progress" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "quest_id" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" "QuestStatus" NOT NULL DEFAULT 'ACTIVE',
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quest_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "music_queues" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "tracks" TEXT NOT NULL DEFAULT '[]',
    "current_track" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "loop_mode" "LoopMode" NOT NULL DEFAULT 'NONE',
    "autoplay" BOOLEAN NOT NULL DEFAULT false,
    "volume" INTEGER NOT NULL DEFAULT 50,
    "voice_channel_id" TEXT,
    "text_channel_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "music_queues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "music_history_entries" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "track_title" TEXT NOT NULL,
    "track_url" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "requested_by_id" TEXT NOT NULL,
    "played_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "music_history_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "giveaways" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "message_id" TEXT,
    "prize" TEXT NOT NULL,
    "winner_count" INTEGER NOT NULL DEFAULT 1,
    "duration" INTEGER NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "required_role_id" TEXT,
    "required_level" INTEGER NOT NULL DEFAULT 0,
    "required_account_age" INTEGER NOT NULL DEFAULT 0,
    "status" "GiveawayStatus" NOT NULL DEFAULT 'RUNNING',
    "winners" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "giveaways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "giveaway_entries" (
    "id" TEXT NOT NULL,
    "giveaway_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "giveaway_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polls" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "message_id" TEXT,
    "question" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "status" "PollStatus" NOT NULL DEFAULT 'OPEN',
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "multi_choice" BOOLEAN NOT NULL DEFAULT false,
    "ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "polls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_votes" (
    "id" TEXT NOT NULL,
    "poll_id" TEXT NOT NULL,
    "user_id" TEXT,
    "option_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poll_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suggestions" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "message_id" TEXT,
    "author_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "voters" TEXT NOT NULL DEFAULT '{}',
    "status" "SuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "staff_response" TEXT,
    "staff_responder_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "welcome_settings" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "welcome_channel_id" TEXT,
    "welcome_message" TEXT,
    "welcome_embed" BOOLEAN NOT NULL DEFAULT true,
    "welcome_embed_color" TEXT NOT NULL DEFAULT '#e0e0e0',
    "welcome_embed_title" TEXT,
    "welcome_embed_description" TEXT,
    "welcome_embed_footer" TEXT,
    "welcome_embed_image" TEXT,
    "welcome_dm" BOOLEAN NOT NULL DEFAULT false,
    "welcome_dm_message" TEXT,
    "mention_member" BOOLEAN NOT NULL DEFAULT true,
    "goodbye_enabled" BOOLEAN NOT NULL DEFAULT true,
    "goodbye_channel_id" TEXT,
    "goodbye_message" TEXT,
    "goodbye_embed" BOOLEAN NOT NULL DEFAULT true,
    "goodbye_embed_color" TEXT NOT NULL DEFAULT '#888888',
    "card_enabled" BOOLEAN NOT NULL DEFAULT false,
    "card_background" TEXT NOT NULL DEFAULT 'COLOR',
    "card_bg_color" TEXT NOT NULL DEFAULT '#23272a',
    "card_bg_image" TEXT,
    "card_text_color" TEXT NOT NULL DEFAULT '#ffffff',
    "card_subtext_color" TEXT NOT NULL DEFAULT '#b9bbbe',
    "card_accent_color" TEXT NOT NULL DEFAULT '#5865f2',
    "card_blur_background" BOOLEAN NOT NULL DEFAULT false,
    "card_text" TEXT NOT NULL DEFAULT 'Bienvenue sur {server} !',
    "card_subtext" TEXT NOT NULL DEFAULT 'Tu es le {memberCount}ème membre',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "welcome_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "economy_settings" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "currency_name" TEXT NOT NULL DEFAULT 'pièces',
    "currency_symbol" TEXT NOT NULL DEFAULT '🪙',
    "daily_amount" INTEGER,
    "weekly_amount" INTEGER NOT NULL DEFAULT 1000,
    "startup_balance" INTEGER NOT NULL DEFAULT 100,
    "work_min" INTEGER NOT NULL DEFAULT 10,
    "work_max" INTEGER NOT NULL DEFAULT 50,
    "work_cooldown" INTEGER NOT NULL DEFAULT 60,
    "robbery_enabled" BOOLEAN NOT NULL DEFAULT false,
    "robbery_max_amount" INTEGER NOT NULL DEFAULT 500,
    "robbery_cooldown" INTEGER NOT NULL DEFAULT 3600,
    "interest_rate" INTEGER NOT NULL DEFAULT 5,
    "interest_interval" INTEGER NOT NULL DEFAULT 86400,
    "bank_capacity" INTEGER NOT NULL DEFAULT 50000,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "economy_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_items" (
    "id" TEXT NOT NULL,
    "economy_settings_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "type" "ItemType" NOT NULL DEFAULT 'ROLE',
    "role_id" TEXT,
    "duration" INTEGER,
    "effect_value" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shop_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_entries" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_listings" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "status" "MarketListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "buyer_id" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "sold_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protection_settings" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "anti_raid" BOOLEAN NOT NULL DEFAULT false,
    "raid_threshold" INTEGER NOT NULL DEFAULT 10,
    "raid_interval" INTEGER NOT NULL DEFAULT 10,
    "anti_spam" BOOLEAN NOT NULL DEFAULT false,
    "spam_threshold" INTEGER NOT NULL DEFAULT 5,
    "spam_interval" INTEGER NOT NULL DEFAULT 5,
    "anti_mass_mention" BOOLEAN NOT NULL DEFAULT false,
    "mention_threshold" INTEGER NOT NULL DEFAULT 5,
    "anti_link" BOOLEAN NOT NULL DEFAULT false,
    "anti_alts" BOOLEAN NOT NULL DEFAULT false,
    "alt_account_age" INTEGER NOT NULL DEFAULT 7,
    "verification_level" TEXT NOT NULL DEFAULT 'NONE',
    "captcha_verification" BOOLEAN NOT NULL DEFAULT false,
    "verified_role_id" TEXT,
    "punishment" TEXT NOT NULL DEFAULT 'KICK',
    "emergency_mode" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "protection_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "captcha_verifications" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "captcha_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "autorole_settings" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "on_join" BOOLEAN NOT NULL DEFAULT true,
    "on_level_up" BOOLEAN NOT NULL DEFAULT false,
    "on_reaction" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "autorole_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "autorole_entries" (
    "id" TEXT NOT NULL,
    "settings_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "type" "AutoroleType" NOT NULL,
    "level_required" INTEGER,
    "reaction_channel_id" TEXT,
    "reaction_emoji" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "autorole_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_embeds" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#e0e0e0',
    "fields" TEXT NOT NULL DEFAULT '[]',
    "footer" TEXT,
    "image" TEXT,
    "thumbnail" TEXT,
    "author_name" TEXT,
    "author_icon" TEXT,
    "timestamp" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_embeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "premium_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "max_guilds" INTEGER NOT NULL DEFAULT 1,
    "features" TEXT NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "premium_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "premium_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "guild_id" TEXT,
    "plan_id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "premium_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "premium_feature_flags" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "min_tier" TEXT NOT NULL DEFAULT 'FREE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "premium_feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blacklist_users" (
    "id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "moderator_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blacklist_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blacklist_guilds" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "moderator_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blacklist_guilds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guild_blacklist_users" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "moderator_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guild_blacklist_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "changelogs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "author_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "changelogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deployments" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "release_path" TEXT NOT NULL,
    "environment" "DeployEnvironment" NOT NULL DEFAULT 'DEVELOPMENT',
    "git_ref" TEXT,
    "status" "DeploymentStatus" NOT NULL DEFAULT 'PENDING',
    "log" TEXT,
    "triggered_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "deployments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deployment_releases" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "release_path" TEXT NOT NULL,
    "deployment_id" TEXT,
    "status" "DeploymentStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deployment_releases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT,
    "user_id" TEXT,
    "action" "AuditAction" NOT NULL,
    "details" TEXT,
    "ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owner_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "ip" TEXT NOT NULL,
    "user_agent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "owner_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_metrics_snapshots" (
    "id" TEXT NOT NULL,
    "cpu_usage" DOUBLE PRECISION NOT NULL,
    "ram_usage" DOUBLE PRECISION NOT NULL,
    "ram_total" DOUBLE PRECISION NOT NULL,
    "uptime_seconds" INTEGER NOT NULL,
    "guild_count" INTEGER NOT NULL,
    "user_count" INTEGER NOT NULL,
    "command_count" INTEGER NOT NULL,
    "messages_today" INTEGER NOT NULL,
    "active_channels" INTEGER NOT NULL,
    "online_members" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_metrics_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "starts_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auto_mod_settings" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "banned_words" BOOLEAN NOT NULL DEFAULT false,
    "banned_words_list" TEXT NOT NULL DEFAULT '[]',
    "discord_invites" BOOLEAN NOT NULL DEFAULT false,
    "external_links" BOOLEAN NOT NULL DEFAULT false,
    "excessive_caps" BOOLEAN NOT NULL DEFAULT false,
    "caps_threshold" INTEGER NOT NULL DEFAULT 70,
    "excessive_emojis" BOOLEAN NOT NULL DEFAULT false,
    "emojis_threshold" INTEGER NOT NULL DEFAULT 10,
    "excessive_mentions" BOOLEAN NOT NULL DEFAULT false,
    "mentions_threshold" INTEGER NOT NULL DEFAULT 5,
    "forbidden_pings" BOOLEAN NOT NULL DEFAULT false,
    "forbidden_ping_roles" TEXT NOT NULL DEFAULT '[]',
    "message_spam" BOOLEAN NOT NULL DEFAULT false,
    "spam_threshold" INTEGER NOT NULL DEFAULT 5,
    "spam_interval" INTEGER NOT NULL DEFAULT 5,
    "forbidden_markdown" BOOLEAN NOT NULL DEFAULT false,
    "forbidden_markdown_list" TEXT NOT NULL DEFAULT '[]',
    "warn_enabled" BOOLEAN NOT NULL DEFAULT true,
    "mute_enabled" BOOLEAN NOT NULL DEFAULT false,
    "mute_duration" INTEGER NOT NULL DEFAULT 10,
    "kick_enabled" BOOLEAN NOT NULL DEFAULT false,
    "ban_enabled" BOOLEAN NOT NULL DEFAULT false,
    "auto_sanction_threshold" INTEGER NOT NULL DEFAULT 3,
    "auto_warn_mute_threshold" INTEGER,
    "auto_warn_ban_threshold" INTEGER,
    "auto_warn_mute_duration" INTEGER NOT NULL DEFAULT 60,
    "whitelist_roles" TEXT NOT NULL DEFAULT '[]',
    "whitelist_channels" TEXT NOT NULL DEFAULT '[]',
    "log_channel_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auto_mod_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_settings" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "category_id" TEXT,
    "log_channel_id" TEXT,
    "validation_channel_id" TEXT,
    "transcript_channel_id" TEXT,
    "require_validation" BOOLEAN NOT NULL DEFAULT false,
    "require_open_reason" BOOLEAN NOT NULL DEFAULT false,
    "require_close_reason" BOOLEAN NOT NULL DEFAULT false,
    "channel_format" TEXT NOT NULL DEFAULT 'ticket-{username}',
    "moderator_roles" TEXT NOT NULL DEFAULT '[]',
    "access_roles" TEXT NOT NULL DEFAULT '[]',
    "mention_moderators" BOOLEAN NOT NULL DEFAULT true,
    "max_open_per_user" INTEGER NOT NULL DEFAULT 1,
    "auto_delete" BOOLEAN NOT NULL DEFAULT false,
    "inactivity_alert_hours" INTEGER NOT NULL DEFAULT 24,
    "welcome_message_no_reason" TEXT NOT NULL DEFAULT 'Un membre de l''équipe va te répondre sous peu.',
    "transcript_format" TEXT NOT NULL DEFAULT 'HTML',
    "open_message" TEXT NOT NULL DEFAULT 'Bienvenue ! Décris ton problème.',
    "panel_message" TEXT NOT NULL DEFAULT 'Cliquez sur le bouton ci-dessous pour ouvrir un ticket de support.
Notre équipe vous répondra dès que possible.',
    "panel_button_text" TEXT NOT NULL DEFAULT 'Ouvrir un ticket',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guild_members" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "permissions" TEXT NOT NULL DEFAULT '0',
    "is_owner" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guild_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donors" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatar_url" TEXT,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "message" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "is_donor" BOOLEAN NOT NULL DEFAULT true,
    "embed_color" TEXT,
    "donated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owner_notes" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owner_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pending_popups" (
    "id" TEXT NOT NULL,
    "target_user_id" TEXT,
    "message" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pending_popups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "minigame_settings" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "games_channel_id" TEXT,
    "bet_min" INTEGER NOT NULL DEFAULT 10,
    "bet_max" INTEGER NOT NULL DEFAULT 1000,
    "blackjack_reward" INTEGER NOT NULL DEFAULT 150,
    "rps_reward" INTEGER NOT NULL DEFAULT 50,
    "morpion_reward" INTEGER NOT NULL DEFAULT 100,
    "guess_reward" INTEGER NOT NULL DEFAULT 200,
    "guess_range" INTEGER NOT NULL DEFAULT 100,
    "hangman_reward" INTEGER NOT NULL DEFAULT 150,
    "hangman_word_categories" TEXT NOT NULL DEFAULT '{}',
    "connect4_reward" INTEGER NOT NULL DEFAULT 200,
    "poker_reward" INTEGER NOT NULL DEFAULT 300,
    "horse_race_reward" INTEGER NOT NULL DEFAULT 250,
    "slot_machine_reward" INTEGER NOT NULL DEFAULT 500,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "minigame_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jackpot_wins" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bet" INTEGER NOT NULL,
    "payout" INTEGER NOT NULL,
    "symbols" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jackpot_wins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "minigame_sessions" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "game_type" TEXT NOT NULL,
    "bet" INTEGER NOT NULL DEFAULT 0,
    "payout" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "game_state" TEXT,
    "opponent_id" TEXT,
    "channel_id" TEXT NOT NULL,
    "message_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "minigame_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clans" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clan_members" (
    "id" TEXT NOT NULL,
    "clan_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "ClanRole" NOT NULL DEFAULT 'MEMBER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clan_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clan_wars" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "challenger_id" TEXT NOT NULL,
    "opponent_id" TEXT NOT NULL,
    "status" "ClanWarStatus" NOT NULL DEFAULT 'PENDING',
    "started_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "challenger_xp" INTEGER NOT NULL DEFAULT 0,
    "opponent_xp" INTEGER NOT NULL DEFAULT 0,
    "winner_id" TEXT,
    "prize_pool" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clan_wars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "starboard_settings" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "channel_id" TEXT,
    "star_emoji" TEXT NOT NULL DEFAULT '⭐',
    "min_stars" INTEGER NOT NULL DEFAULT 3,
    "self_star" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "starboard_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "starboard_entries" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "original_id" TEXT NOT NULL,
    "starboard_id" TEXT,
    "author_id" TEXT NOT NULL,
    "star_count" INTEGER NOT NULL DEFAULT 0,
    "content" TEXT NOT NULL,
    "attachment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "starboard_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_settings" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "channel_id" TEXT,
    "log_channel" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_templates" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fields" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_submissions" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "responses" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invite_tracks" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "inviter_id" TEXT NOT NULL,
    "invite_code" TEXT NOT NULL,
    "joined_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_fake" BOOLEAN NOT NULL DEFAULT false,
    "has_left" BOOLEAN NOT NULL DEFAULT false,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "invite_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guild_backups" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "channel_count" INTEGER NOT NULL DEFAULT 0,
    "role_count" INTEGER NOT NULL DEFAULT 0,
    "size" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guild_backups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_windows" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_windows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rank_card_settings" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "background_type" TEXT NOT NULL DEFAULT 'COLOR',
    "background_color" TEXT NOT NULL DEFAULT '#23272a',
    "background_image" TEXT,
    "gradient_from" TEXT NOT NULL DEFAULT '#23272a',
    "gradient_to" TEXT NOT NULL DEFAULT '#2c2f33',
    "xp_bar_color" TEXT NOT NULL DEFAULT '#5865f2',
    "xp_bar_background" TEXT NOT NULL DEFAULT '#4f545c',
    "text_color" TEXT NOT NULL DEFAULT '#ffffff',
    "avatar_border" BOOLEAN NOT NULL DEFAULT true,
    "avatar_border_color" TEXT NOT NULL DEFAULT '#5865f2',
    "font_family" TEXT NOT NULL DEFAULT 'Sans-serif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rank_card_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "command_cooldowns" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "command_name" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "command_cooldowns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bot_metrics" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" BIGINT NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bot_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_discord_id_key" ON "users"("discord_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "owner_2fa_user_id_key" ON "owner_2fa"("user_id");

-- CreateIndex
CREATE INDEX "guilds_bot_present_member_count_idx" ON "guilds"("bot_present", "member_count");

-- CreateIndex
CREATE UNIQUE INDEX "music_settings_guild_id_key" ON "music_settings"("guild_id");

-- CreateIndex
CREATE UNIQUE INDEX "guild_settings_guild_id_key" ON "guild_settings"("guild_id");

-- CreateIndex
CREATE INDEX "onboarding_sources_source_idx" ON "onboarding_sources"("source");

-- CreateIndex
CREATE INDEX "onboarding_sources_created_at_idx" ON "onboarding_sources"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "modules_enabled_guild_id_key" ON "modules_enabled"("guild_id");

-- CreateIndex
CREATE UNIQUE INDEX "stream_notifications_guild_id_platform_channel_name_key" ON "stream_notifications"("guild_id", "platform", "channel_name");

-- CreateIndex
CREATE INDEX "moderation_cases_guild_id_user_id_idx" ON "moderation_cases"("guild_id", "user_id");

-- CreateIndex
CREATE INDEX "moderation_cases_guild_id_moderator_id_idx" ON "moderation_cases"("guild_id", "moderator_id");

-- CreateIndex
CREATE INDEX "moderation_cases_guild_id_created_at_idx" ON "moderation_cases"("guild_id", "created_at");

-- CreateIndex
CREATE INDEX "moderation_cases_guild_id_active_created_at_idx" ON "moderation_cases"("guild_id", "active", "created_at");

-- CreateIndex
CREATE INDEX "warnings_guild_id_user_id_idx" ON "warnings"("guild_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_channel_id_key" ON "tickets"("channel_id");

-- CreateIndex
CREATE INDEX "tickets_guild_id_status_idx" ON "tickets"("guild_id", "status");

-- CreateIndex
CREATE INDEX "tickets_guild_id_creator_id_idx" ON "tickets"("guild_id", "creator_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_claims_ticket_id_user_id_key" ON "ticket_claims"("ticket_id", "user_id");

-- CreateIndex
CREATE INDEX "ticket_categories_guild_id_idx" ON "ticket_categories"("guild_id");

-- CreateIndex
CREATE UNIQUE INDEX "transcript_metas_ticket_id_key" ON "transcript_metas"("ticket_id");

-- CreateIndex
CREATE UNIQUE INDEX "log_settings_guild_id_key" ON "log_settings"("guild_id");

-- CreateIndex
CREATE UNIQUE INDEX "xp_settings_guild_id_key" ON "xp_settings"("guild_id");

-- CreateIndex
CREATE INDEX "xp_profiles_guild_id_xp_idx" ON "xp_profiles"("guild_id", "xp");

-- CreateIndex
CREATE INDEX "xp_profiles_guild_id_level_idx" ON "xp_profiles"("guild_id", "level");

-- CreateIndex
CREATE UNIQUE INDEX "xp_profiles_guild_id_user_id_key" ON "xp_profiles"("guild_id", "user_id");

-- CreateIndex
CREATE INDEX "xp_role_rewards_guild_id_level_required_idx" ON "xp_role_rewards"("guild_id", "level_required");

-- CreateIndex
CREATE UNIQUE INDEX "xp_role_rewards_guild_id_role_id_key" ON "xp_role_rewards"("guild_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "economy_wallets_guild_id_user_id_key" ON "economy_wallets"("guild_id", "user_id");

-- CreateIndex
CREATE INDEX "economy_transactions_guild_id_from_user_id_idx" ON "economy_transactions"("guild_id", "from_user_id");

-- CreateIndex
CREATE INDEX "economy_transactions_guild_id_to_user_id_idx" ON "economy_transactions"("guild_id", "to_user_id");

-- CreateIndex
CREATE INDEX "economy_transactions_guild_id_created_at_idx" ON "economy_transactions"("guild_id", "created_at");

-- CreateIndex
CREATE INDEX "quests_guild_id_type_idx" ON "quests"("guild_id", "type");

-- CreateIndex
CREATE INDEX "quests_guild_id_starts_at_ends_at_idx" ON "quests"("guild_id", "starts_at", "ends_at");

-- CreateIndex
CREATE INDEX "quest_progress_guild_id_user_id_idx" ON "quest_progress"("guild_id", "user_id");

-- CreateIndex
CREATE INDEX "quest_progress_quest_id_idx" ON "quest_progress"("quest_id");

-- CreateIndex
CREATE UNIQUE INDEX "quest_progress_guild_id_user_id_quest_id_key" ON "quest_progress"("guild_id", "user_id", "quest_id");

-- CreateIndex
CREATE UNIQUE INDEX "music_queues_guild_id_key" ON "music_queues"("guild_id");

-- CreateIndex
CREATE INDEX "music_history_entries_guild_id_played_at_idx" ON "music_history_entries"("guild_id", "played_at");

-- CreateIndex
CREATE INDEX "giveaways_guild_id_status_idx" ON "giveaways"("guild_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "giveaway_entries_giveaway_id_user_id_key" ON "giveaway_entries"("giveaway_id", "user_id");

-- CreateIndex
CREATE INDEX "polls_guild_id_status_idx" ON "polls"("guild_id", "status");

-- CreateIndex
CREATE INDEX "polls_status_ends_at_idx" ON "polls"("status", "ends_at");

-- CreateIndex
CREATE INDEX "poll_votes_poll_id_user_id_idx" ON "poll_votes"("poll_id", "user_id");

-- CreateIndex
CREATE INDEX "suggestions_guild_id_status_idx" ON "suggestions"("guild_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "welcome_settings_guild_id_key" ON "welcome_settings"("guild_id");

-- CreateIndex
CREATE UNIQUE INDEX "economy_settings_guild_id_key" ON "economy_settings"("guild_id");

-- CreateIndex
CREATE INDEX "shop_items_economy_settings_id_idx" ON "shop_items"("economy_settings_id");

-- CreateIndex
CREATE INDEX "inventory_entries_guild_id_user_id_idx" ON "inventory_entries"("guild_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_entries_guild_id_user_id_item_id_key" ON "inventory_entries"("guild_id", "user_id", "item_id");

-- CreateIndex
CREATE INDEX "market_listings_guild_id_status_idx" ON "market_listings"("guild_id", "status");

-- CreateIndex
CREATE INDEX "market_listings_seller_id_idx" ON "market_listings"("seller_id");

-- CreateIndex
CREATE INDEX "market_listings_expires_at_idx" ON "market_listings"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "protection_settings_guild_id_key" ON "protection_settings"("guild_id");

-- CreateIndex
CREATE INDEX "captcha_verifications_guild_id_user_id_idx" ON "captcha_verifications"("guild_id", "user_id");

-- CreateIndex
CREATE INDEX "captcha_verifications_expires_at_idx" ON "captcha_verifications"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "autorole_settings_guild_id_key" ON "autorole_settings"("guild_id");

-- CreateIndex
CREATE INDEX "autorole_entries_guild_id_type_idx" ON "autorole_entries"("guild_id", "type");

-- CreateIndex
CREATE INDEX "saved_embeds_guild_id_idx" ON "saved_embeds"("guild_id");

-- CreateIndex
CREATE UNIQUE INDEX "premium_plans_name_key" ON "premium_plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "premium_subscriptions_user_id_key" ON "premium_subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "premium_subscriptions_guild_id_key" ON "premium_subscriptions"("guild_id");

-- CreateIndex
CREATE INDEX "premium_subscriptions_plan_id_idx" ON "premium_subscriptions"("plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "premium_feature_flags_key_key" ON "premium_feature_flags"("key");

-- CreateIndex
CREATE UNIQUE INDEX "blacklist_users_target_id_key" ON "blacklist_users"("target_id");

-- CreateIndex
CREATE UNIQUE INDEX "blacklist_guilds_guild_id_key" ON "blacklist_guilds"("guild_id");

-- CreateIndex
CREATE INDEX "blacklist_guilds_guild_id_idx" ON "blacklist_guilds"("guild_id");

-- CreateIndex
CREATE INDEX "guild_blacklist_users_guild_id_idx" ON "guild_blacklist_users"("guild_id");

-- CreateIndex
CREATE INDEX "guild_blacklist_users_user_id_idx" ON "guild_blacklist_users"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "guild_blacklist_users_guild_id_user_id_key" ON "guild_blacklist_users"("guild_id", "user_id");

-- CreateIndex
CREATE INDEX "changelogs_created_at_idx" ON "changelogs"("created_at");

-- CreateIndex
CREATE INDEX "deployments_created_at_idx" ON "deployments"("created_at");

-- CreateIndex
CREATE INDEX "deployments_status_idx" ON "deployments"("status");

-- CreateIndex
CREATE INDEX "deployments_environment_idx" ON "deployments"("environment");

-- CreateIndex
CREATE INDEX "deployment_releases_created_at_idx" ON "deployment_releases"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_guild_id_created_at_idx" ON "audit_logs"("guild_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "owner_logs_created_at_idx" ON "owner_logs"("created_at");

-- CreateIndex
CREATE INDEX "owner_logs_user_id_idx" ON "owner_logs"("user_id");

-- CreateIndex
CREATE INDEX "system_metrics_snapshots_timestamp_idx" ON "system_metrics_snapshots"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_key_key" ON "feature_flags"("key");

-- CreateIndex
CREATE INDEX "feature_flags_key_enabled_starts_at_expires_at_idx" ON "feature_flags"("key", "enabled", "starts_at", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "auto_mod_settings_guild_id_key" ON "auto_mod_settings"("guild_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_settings_guild_id_key" ON "ticket_settings"("guild_id");

-- CreateIndex
CREATE INDEX "guild_members_user_id_idx" ON "guild_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "guild_members_guild_id_user_id_key" ON "guild_members"("guild_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "donors_user_id_key" ON "donors"("user_id");

-- CreateIndex
CREATE INDEX "pending_popups_target_user_id_idx" ON "pending_popups"("target_user_id");

-- CreateIndex
CREATE INDEX "pending_popups_expires_at_idx" ON "pending_popups"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "minigame_settings_guild_id_key" ON "minigame_settings"("guild_id");

-- CreateIndex
CREATE INDEX "jackpot_wins_guild_id_created_at_idx" ON "jackpot_wins"("guild_id", "created_at");

-- CreateIndex
CREATE INDEX "minigame_sessions_guild_id_user_id_idx" ON "minigame_sessions"("guild_id", "user_id");

-- CreateIndex
CREATE INDEX "minigame_sessions_game_type_status_idx" ON "minigame_sessions"("game_type", "status");

-- CreateIndex
CREATE INDEX "clans_guild_id_idx" ON "clans"("guild_id");

-- CreateIndex
CREATE UNIQUE INDEX "clans_guild_id_name_key" ON "clans"("guild_id", "name");

-- CreateIndex
CREATE INDEX "clan_members_clan_id_idx" ON "clan_members"("clan_id");

-- CreateIndex
CREATE INDEX "clan_members_guild_id_user_id_idx" ON "clan_members"("guild_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "clan_members_guild_id_user_id_key" ON "clan_members"("guild_id", "user_id");

-- CreateIndex
CREATE INDEX "clan_wars_guild_id_status_idx" ON "clan_wars"("guild_id", "status");

-- CreateIndex
CREATE INDEX "clan_wars_challenger_id_idx" ON "clan_wars"("challenger_id");

-- CreateIndex
CREATE INDEX "clan_wars_opponent_id_idx" ON "clan_wars"("opponent_id");

-- CreateIndex
CREATE UNIQUE INDEX "starboard_settings_guild_id_key" ON "starboard_settings"("guild_id");

-- CreateIndex
CREATE UNIQUE INDEX "starboard_entries_starboard_id_key" ON "starboard_entries"("starboard_id");

-- CreateIndex
CREATE INDEX "starboard_entries_guild_id_star_count_idx" ON "starboard_entries"("guild_id", "star_count");

-- CreateIndex
CREATE UNIQUE INDEX "starboard_entries_guild_id_original_id_key" ON "starboard_entries"("guild_id", "original_id");

-- CreateIndex
CREATE UNIQUE INDEX "form_settings_guild_id_key" ON "form_settings"("guild_id");

-- CreateIndex
CREATE INDEX "form_templates_guild_id_enabled_idx" ON "form_templates"("guild_id", "enabled");

-- CreateIndex
CREATE INDEX "form_submissions_guild_id_status_idx" ON "form_submissions"("guild_id", "status");

-- CreateIndex
CREATE INDEX "form_submissions_template_id_idx" ON "form_submissions"("template_id");

-- CreateIndex
CREATE INDEX "invite_tracks_guild_id_inviter_id_idx" ON "invite_tracks"("guild_id", "inviter_id");

-- CreateIndex
CREATE INDEX "invite_tracks_guild_id_joined_id_idx" ON "invite_tracks"("guild_id", "joined_id");

-- CreateIndex
CREATE INDEX "invite_tracks_inviter_id_idx" ON "invite_tracks"("inviter_id");

-- CreateIndex
CREATE INDEX "guild_backups_guild_id_idx" ON "guild_backups"("guild_id");

-- CreateIndex
CREATE INDEX "maintenance_windows_active_ends_at_idx" ON "maintenance_windows"("active", "ends_at");

-- CreateIndex
CREATE UNIQUE INDEX "rank_card_settings_guild_id_key" ON "rank_card_settings"("guild_id");

-- CreateIndex
CREATE INDEX "command_cooldowns_expires_at_idx" ON "command_cooldowns"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "command_cooldowns_user_id_command_name_key" ON "command_cooldowns"("user_id", "command_name");

-- CreateIndex
CREATE UNIQUE INDEX "bot_metrics_key_key" ON "bot_metrics"("key");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owner_2fa" ADD CONSTRAINT "owner_2fa_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "music_settings" ADD CONSTRAINT "music_settings_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guild_settings" ADD CONSTRAINT "guild_settings_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules_enabled" ADD CONSTRAINT "modules_enabled_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stream_notifications" ADD CONSTRAINT "stream_notifications_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_cases" ADD CONSTRAINT "moderation_cases_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_cases" ADD CONSTRAINT "moderation_cases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("discord_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("discord_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ticket_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_claimed_by_id_fkey" FOREIGN KEY ("claimed_by_id") REFERENCES "users"("discord_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_claims" ADD CONSTRAINT "ticket_claims_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_claims" ADD CONSTRAINT "ticket_claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("discord_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_categories" ADD CONSTRAINT "ticket_categories_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_settings" ADD CONSTRAINT "log_settings_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_settings" ADD CONSTRAINT "xp_settings_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_profiles" ADD CONSTRAINT "xp_profiles_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_profiles" ADD CONSTRAINT "xp_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("discord_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_role_rewards" ADD CONSTRAINT "xp_role_rewards_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "economy_wallets" ADD CONSTRAINT "economy_wallets_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "economy_wallets" ADD CONSTRAINT "economy_wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("discord_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "economy_transactions" ADD CONSTRAINT "economy_transactions_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quests" ADD CONSTRAINT "quests_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_progress" ADD CONSTRAINT "quest_progress_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_progress" ADD CONSTRAINT "quest_progress_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "music_queues" ADD CONSTRAINT "music_queues_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "music_history_entries" ADD CONSTRAINT "music_history_entries_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "giveaways" ADD CONSTRAINT "giveaways_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "giveaway_entries" ADD CONSTRAINT "giveaway_entries_giveaway_id_fkey" FOREIGN KEY ("giveaway_id") REFERENCES "giveaways"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "giveaway_entries" ADD CONSTRAINT "giveaway_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polls" ADD CONSTRAINT "polls_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("discord_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "welcome_settings" ADD CONSTRAINT "welcome_settings_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "economy_settings" ADD CONSTRAINT "economy_settings_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_items" ADD CONSTRAINT "shop_items_economy_settings_id_fkey" FOREIGN KEY ("economy_settings_id") REFERENCES "economy_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_entries" ADD CONSTRAINT "inventory_entries_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "shop_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_listings" ADD CONSTRAINT "market_listings_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "shop_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protection_settings" ADD CONSTRAINT "protection_settings_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autorole_settings" ADD CONSTRAINT "autorole_settings_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autorole_entries" ADD CONSTRAINT "autorole_entries_settings_id_fkey" FOREIGN KEY ("settings_id") REFERENCES "autorole_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autorole_entries" ADD CONSTRAINT "autorole_entries_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_embeds" ADD CONSTRAINT "saved_embeds_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "premium_subscriptions" ADD CONSTRAINT "premium_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "premium_subscriptions" ADD CONSTRAINT "premium_subscriptions_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "premium_subscriptions" ADD CONSTRAINT "premium_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "premium_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blacklist_guilds" ADD CONSTRAINT "blacklist_guilds_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guild_blacklist_users" ADD CONSTRAINT "guild_blacklist_users_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "changelogs" ADD CONSTRAINT "changelogs_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployment_releases" ADD CONSTRAINT "deployment_releases_deployment_id_fkey" FOREIGN KEY ("deployment_id") REFERENCES "deployments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owner_logs" ADD CONSTRAINT "owner_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_mod_settings" ADD CONSTRAINT "auto_mod_settings_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_settings" ADD CONSTRAINT "ticket_settings_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guild_members" ADD CONSTRAINT "guild_members_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "minigame_settings" ADD CONSTRAINT "minigame_settings_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "minigame_sessions" ADD CONSTRAINT "minigame_sessions_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "minigame_settings"("guild_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clans" ADD CONSTRAINT "clans_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clan_members" ADD CONSTRAINT "clan_members_clan_id_fkey" FOREIGN KEY ("clan_id") REFERENCES "clans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clan_members" ADD CONSTRAINT "clan_members_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clan_wars" ADD CONSTRAINT "clan_wars_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clan_wars" ADD CONSTRAINT "clan_wars_challenger_id_fkey" FOREIGN KEY ("challenger_id") REFERENCES "clans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clan_wars" ADD CONSTRAINT "clan_wars_opponent_id_fkey" FOREIGN KEY ("opponent_id") REFERENCES "clans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "starboard_settings" ADD CONSTRAINT "starboard_settings_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "starboard_entries" ADD CONSTRAINT "starboard_entries_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "starboard_settings"("guild_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_settings" ADD CONSTRAINT "form_settings_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_templates" ADD CONSTRAINT "form_templates_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "form_settings"("guild_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "form_settings"("guild_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guild_backups" ADD CONSTRAINT "guild_backups_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rank_card_settings" ADD CONSTRAINT "rank_card_settings_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

