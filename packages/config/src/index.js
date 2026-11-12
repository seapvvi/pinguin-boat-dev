"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
exports.getAllowedRedirectUris = getAllowedRedirectUris;
exports.isPlaceholderSecret = isPlaceholderSecret;
exports.loadConfig = loadConfig;
exports.getConfig = getConfig;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load .env from project root (3 levels up from packages/config/src/)
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    // Discord
    DISCORD_CLIENT_ID: zod_1.z.string().min(1),
    DISCORD_CLIENT_SECRET: zod_1.z.string().min(1),
    DISCORD_TOKEN: zod_1.z.string().min(1),
    DISCORD_OWNER_ID: zod_1.z.string().min(1),
    DISCORD_PUBLIC_KEY: zod_1.z.string().min(1),
    DISCORD_DEV_GUILD_ID: zod_1.z.string().optional(),
    DISCORD_SUPPORT_INVITE: zod_1.z.union([zod_1.z.string().url(), zod_1.z.literal('')]).default(''),
    // Database
    DATABASE_URL: zod_1.z.string().trim().url(),
    // Optional pool tuning; applied to DATABASE_URL by @pinguin/db.
    // Defaults to Prisma's own pool when unset.
    DATABASE_CONNECTION_LIMIT: zod_1.z.coerce.number().int().positive().optional(),
    DATABASE_POOL_TIMEOUT: zod_1.z.coerce.number().int().positive().optional(),
    // Session
    SESSION_SECRET: zod_1.z.string().min(32),
    SESSION_MAX_AGE: zod_1.z.coerce.number().default(604800),
    // API
    API_HOST: zod_1.z.string().default('0.0.0.0'),
    API_PORT: zod_1.z.coerce.number().default(4000),
    API_URL: zod_1.z.string().url(),
    CORS_ORIGIN: zod_1.z.string().default('http://localhost:3000'),
    // ^ Multiples origines séparées par des virgules. Ex: "http://localhost:3000,https://bot.pinguin.ovh"
    API_INTERNAL_PORT: zod_1.z.coerce.number().default(3004),
    BOT_INTERNAL_PORT: zod_1.z.coerce.number().default(3003),
    BOT_INTERNAL_SECRET: zod_1.z.string().min(32),
    BOT_INTERNAL_URL: zod_1.z.string().url().default('http://127.0.0.1:3003'),
    BOT_STATS_PORT: zod_1.z.coerce.number().default(3010),
    // Web
    NEXT_PUBLIC_API_URL: zod_1.z.string().url(),
    NEXT_PUBLIC_APP_URL: zod_1.z.string().url(),
    NEXT_PUBLIC_DISCORD_CLIENT_ID: zod_1.z.string().min(1),
    NEXT_PUBLIC_SITE_URL: zod_1.z.string().url(),
    // Bot
    BOT_ACTIVITY_TYPE: zod_1.z.coerce.number().default(3),
    BOT_ACTIVITY_NAME: zod_1.z.string().default('🏔️ Pinguin BOAT | /help'),
    // Music (YouTube uniquement via yt-dlp)
    YOUTUBE_COOKIE: zod_1.z.string().optional(),
    // GitHub
    GITHUB_REPO: zod_1.z.string().default(''),
    GITHUB_BRANCH: zod_1.z.string().default('master'),
    GITHUB_TOKEN: zod_1.z.string().optional(),
    // Deploy
    DEPLOY_PATH: zod_1.z.string().default('/opt/pinguinboat'),
    DEPLOY_RELEASES_PATH: zod_1.z.string().default('/opt/pinguinboat/releases'),
    DEPLOY_SHARED_PATH: zod_1.z.string().default('/opt/pinguinboat/shared'),
    DEPLOY_BACKUPS_PATH: zod_1.z.string().default('/opt/pinguinboat/backups'),
    DEPLOY_CURRENT_LINK: zod_1.z.string().default('/opt/pinguinboat/current'),
    DEPLOY_ENV: zod_1.z.enum(['development', 'staging', 'production']).default('development'),
    DEPLOY_ALLOWED_BRANCHES: zod_1.z.string().default('master'),
    // ^ Guard: branches autorisées pour le déploiement (séparées par virgule).
    //   Production typiquement "master" seulement. Staging peut autoriser "develop,master".
    //   Un déploiement depuis une branche non listée sera refusé.
    DEPLOY_TIMEOUT: zod_1.z.coerce.number().default(600000),
    // ^ Guard: timeout total du déploiement en ms (défaut 10 min).
    DEPLOY_STEP_TIMEOUT: zod_1.z.coerce.number().default(120000),
    // ^ Guard: timeout par étape en ms (défaut 2 min).
    // Owner
    OWNER_PASSWORD: zod_1.z.string().trim().min(12, 'OWNER_PASSWORD est requis (min 12 caractères). Configurez-le dans votre fichier .env'),
    // Feature Flags
    ALPHA_ALL_FREE: zod_1.z
        .string()
        .transform((v) => v === 'true' || v === '1')
        .default('true'),
    PREMIUM_ENABLED: zod_1.z
        .string()
        .transform((v) => v === 'true' || v === '1')
        .default('false'),
    // Pastebin
    PASTEBIN_API_KEY: zod_1.z.string().optional().default(''),
    // Owner webhook
    OWNER_WEBHOOK_URL: zod_1.z.string().optional().default(''),
    // Twitch
    TWITCH_CLIENT_ID: zod_1.z.string().optional().default(''),
    TWITCH_CLIENT_SECRET: zod_1.z.string().optional().default(''),
    // YouTube
    YOUTUBE_API_KEY: zod_1.z.string().optional().default(''),
    // Logging
    LOG_LEVEL: zod_1.z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    LOG_FORMAT: zod_1.z.enum(['pretty', 'json']).default('pretty'),
});
exports.envSchema = envSchema;
let _allowedRedirectUris = null;
function getAllowedRedirectUris() {
    if (!_allowedRedirectUris) {
        const appUrl = getConfig().NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');
        _allowedRedirectUris = [`${appUrl}/auth/callback`];
    }
    return _allowedRedirectUris;
}
// Préfixes typiques des valeurs d'exemple à ne jamais utiliser en production.
const PLACEHOLDER_PREFIXES = ['changeme', 'change_me', 'your_', 'your-', 'example', 'password', 'secret', 'dev-secret'];
function isPlaceholderSecret(value) {
    const v = value.trim().toLowerCase();
    return PLACEHOLDER_PREFIXES.some((p) => v.startsWith(p));
}
function validateSecrets(env) {
    const isProd = env.NODE_ENV === 'production';
    const checks = [
        { key: 'SESSION_SECRET', value: env.SESSION_SECRET, minLength: 32, label: 'SESSION_SECRET', forbidden: ['changeme', 'secret', 'dev'] },
        { key: 'BOT_INTERNAL_SECRET', value: env.BOT_INTERNAL_SECRET, minLength: 32, label: 'BOT_INTERNAL_SECRET', forbidden: ['dev-secret', 'changeme_generate_a_random_32char_string'] },
        { key: 'OWNER_PASSWORD', value: env.OWNER_PASSWORD, minLength: 12, label: 'OWNER_PASSWORD' },
    ];
    for (const { value, minLength, label, forbidden } of checks) {
        if (value.length < minLength) {
            const msg = `${label} doit faire au moins ${minLength} caractères (actuellement ${value.length})`;
            if (isProd)
                throw new Error(msg);
            console.warn(`\x1b[33m⚠️  ${msg}\x1b[0m`);
            continue;
        }
        if (forbidden?.includes(value) || isPlaceholderSecret(value)) {
            const msg = `${label} est défini sur une valeur d'exemple dangereuse. Générez une chaîne aléatoire unique (openssl rand -hex 32).`;
            if (isProd)
                throw new Error(msg);
            console.warn(`\x1b[33m⚠️  ${msg}\x1b[0m`);
        }
    }
}
let config = null;
function loadConfig() {
    if (config)
        return config;
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
        console.error('Configuration invalide :');
        for (const issue of result.error.issues) {
            console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
        }
        throw new Error('Erreur de configuration. Vérifiez votre fichier .env');
    }
    config = result.data;
    validateSecrets(config);
    return config;
}
function getConfig() {
    if (!config) {
        return loadConfig();
    }
    return config;
}
//# sourceMappingURL=index.js.map