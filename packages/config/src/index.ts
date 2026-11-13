import { existsSync, statSync } from "node:fs";
import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

// Find the repo-root .env by walking up from the cwd and, when compiled (CJS),
// from this file. A fixed number of `..` hops is not enough: the bundle lands at
// apps/<app>/dist/packages/config/src/ (different depth from the source tree) and
// PM2's cwd depends on how it was started, so the root is reached differently.
function findEnvFile(): string | undefined {
  const starts = [
    process.cwd(),
    ...(typeof __dirname === "string" ? [__dirname] : []),
  ];
  for (const start of starts) {
    let dir = path.resolve(start);
    for (;;) {
      const candidate = path.join(dir, ".env");
      if (existsSync(candidate)) return candidate;
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }
  return undefined;
}

const envFile = findEnvFile();
// `ls -l` gives every stat field but the device, and it doubles as the read time.
let envStamp = envFile ? statSync(envFile).mtimeMs : undefined;

if (envFile) dotenv.config({ path: envFile });

/**
 * Reload .env when it changed after this module first read it, and only when a
 * required key is still blank: /setup writes the file under a running process,
 * and without this a value set too late could never reach an import-time reader.
 */
function reloadEnvIfStale(): boolean {
  if (!envFile || !envStamp) return false;
  let stamp: number;
  try {
    stamp = statSync(envFile).mtimeMs;
  } catch {
    return false;
  }
  if (stamp <= envStamp) return false;
  envStamp = stamp;
  // force: the first read already set the blank values dotenv would otherwise keep.
  dotenv.config({ path: envFile, override: true });
  return true;
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Discord
  DISCORD_CLIENT_ID: z.string().min(1),
  DISCORD_CLIENT_SECRET: z.string().min(1),
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_OWNER_ID: z.string().min(1),
  DISCORD_PUBLIC_KEY: z.string().min(1),
  DISCORD_DEV_GUILD_ID: z.string().optional(),
  DISCORD_SUPPORT_INVITE: z
    .union([z.string().url(), z.literal("")])
    .default(""),

  // Database
  DATABASE_URL: z.string().trim().url(),
  // Optional pool tuning; applied to DATABASE_URL by @pinguin/db.
  // Defaults to Prisma's own pool when unset.
  DATABASE_CONNECTION_LIMIT: z.coerce.number().int().positive().optional(),
  DATABASE_POOL_TIMEOUT: z.coerce.number().int().positive().optional(),

  // Session
  SESSION_SECRET: z.string().min(32),
  SESSION_MAX_AGE: z.coerce.number().default(604800),

  // API
  API_HOST: z.string().default("0.0.0.0"),
  API_PORT: z.coerce.number().default(4000),
  API_URL: z.string().url(),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  // ^ Multiples origines séparées par des virgules. Ex: "http://localhost:3000,https://bot.pinguin.ovh"
  API_INTERNAL_PORT: z.coerce.number().default(3004),
  BOT_INTERNAL_PORT: z.coerce.number().default(3003),
  BOT_INTERNAL_SECRET: z.string().min(32),
  BOT_INTERNAL_URL: z.string().url().default("http://127.0.0.1:3003"),
  BOT_STATS_PORT: z.coerce.number().default(3010),

  // Web
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_DISCORD_CLIENT_ID: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url(),

  // Bot
  BOT_ACTIVITY_TYPE: z.coerce.number().default(3),
  BOT_ACTIVITY_NAME: z.string().default("🏔️ Pinguin BOAT | /help"),

  // Music (YouTube uniquement via yt-dlp)
  YOUTUBE_COOKIE: z.string().optional(),

  // GitHub
  GITHUB_REPO: z.string().default(""),
  GITHUB_BRANCH: z.string().default("master"),
  GITHUB_TOKEN: z.string().optional(),

  // Deploy
  DEPLOY_PATH: z.string().default("/opt/pinguinboat"),
  DEPLOY_RELEASES_PATH: z.string().default("/opt/pinguinboat/releases"),
  DEPLOY_SHARED_PATH: z.string().default("/opt/pinguinboat/shared"),
  DEPLOY_BACKUPS_PATH: z.string().default("/opt/pinguinboat/backups"),
  DEPLOY_CURRENT_LINK: z.string().default("/opt/pinguinboat/current"),
  DEPLOY_ENV: z
    .enum(["development", "staging", "production"])
    .default("development"),
  DEPLOY_ALLOWED_BRANCHES: z.string().default("master"),
  // ^ Guard: branches autorisées pour le déploiement (séparées par virgule).
  //   Production typiquement "master" seulement. Staging peut autoriser "develop,master".
  //   Un déploiement depuis une branche non listée sera refusé.
  DEPLOY_TIMEOUT: z.coerce.number().default(600000),
  // ^ Guard: timeout total du déploiement en ms (défaut 10 min).
  DEPLOY_STEP_TIMEOUT: z.coerce.number().default(120000),
  // ^ Guard: timeout par étape en ms (défaut 2 min).

  // Owner
  OWNER_PASSWORD: z
    .string()
    .trim()
    .min(
      12,
      "OWNER_PASSWORD est requis (min 12 caractères). Configurez-le dans votre fichier .env",
    ),

  // Feature Flags
  ALPHA_ALL_FREE: z
    .string()
    .transform((v) => v === "true" || v === "1")
    .default("true"),
  PREMIUM_ENABLED: z
    .string()
    .transform((v) => v === "true" || v === "1")
    .default("false"),

  // Pastebin
  PASTEBIN_API_KEY: z.string().optional().default(""),

  // Owner webhook
  OWNER_WEBHOOK_URL: z.string().optional().default(""),

  // Twitch
  TWITCH_CLIENT_ID: z.string().optional().default(""),
  TWITCH_CLIENT_SECRET: z.string().optional().default(""),

  // YouTube
  YOUTUBE_API_KEY: z.string().optional().default(""),

  // Logging
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  LOG_FORMAT: z.enum(["pretty", "json"]).default("pretty"),
});

export type EnvConfig = z.infer<typeof envSchema>;

let _allowedRedirectUris: string[] | null = null;

export function getAllowedRedirectUris(): string[] {
  if (!_allowedRedirectUris) {
    const appUrl = getConfig().NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
    _allowedRedirectUris = [`${appUrl}/auth/callback`];
  }
  return _allowedRedirectUris;
}

// Préfixes typiques des valeurs d'exemple à ne jamais utiliser en production.
const PLACEHOLDER_PREFIXES = [
  "changeme",
  "change_me",
  "your_",
  "your-",
  "example",
  "password",
  "secret",
  "dev-secret",
];

export function isPlaceholderSecret(value: string): boolean {
  const v = value.trim().toLowerCase();
  return PLACEHOLDER_PREFIXES.some((p) => v.startsWith(p));
}

function validateSecrets(env: EnvConfig): void {
  const isProd = env.NODE_ENV === "production";

  const checks: {
    key: string;
    value: string;
    minLength: number;
    label: string;
    forbidden?: string[];
  }[] = [
    {
      key: "SESSION_SECRET",
      value: env.SESSION_SECRET,
      minLength: 32,
      label: "SESSION_SECRET",
      forbidden: ["changeme", "secret", "dev"],
    },
    {
      key: "BOT_INTERNAL_SECRET",
      value: env.BOT_INTERNAL_SECRET,
      minLength: 32,
      label: "BOT_INTERNAL_SECRET",
      forbidden: ["dev-secret", "changeme_generate_a_random_32char_string"],
    },
    {
      key: "OWNER_PASSWORD",
      value: env.OWNER_PASSWORD,
      minLength: 12,
      label: "OWNER_PASSWORD",
    },
  ];

  for (const { value, minLength, label, forbidden } of checks) {
    if (value.length < minLength) {
      const msg = `${label} doit faire au moins ${minLength} caractères (actuellement ${value.length})`;
      if (isProd) throw new Error(msg);
      console.warn(`\x1b[33m⚠️  ${msg}\x1b[0m`);
      continue;
    }
    if (forbidden?.includes(value) || isPlaceholderSecret(value)) {
      const msg = `${label} est défini sur une valeur d'exemple dangereuse. Générez une chaîne aléatoire unique (openssl rand -hex 32).`;
      if (isProd) throw new Error(msg);
      console.warn(`\x1b[33m⚠️  ${msg}\x1b[0m`);
    }
  }
}

let config: EnvConfig | null = null;

export function loadConfig(): EnvConfig {
  if (config) return config;

  let result = envSchema.safeParse(process.env);
  if (!result.success && reloadEnvIfStale()) {
    // A stale process must not keep answering with the old (blank) values.
    config = null;
    result = envSchema.safeParse(process.env);
  }
  if (!result.success) {
    console.error("Configuration invalide :");
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    console.error(
      envFile
        ? `Fichier .env chargé : ${envFile}`
        : `Aucun fichier .env trouvé depuis ${process.cwd()} (ni dans ses parents).`,
    );
    throw new Error("Erreur de configuration. Vérifiez votre fichier .env");
  }

  config = result.data;
  validateSecrets(config);
  return config;
}

export function getConfig(): EnvConfig {
  if (!config) {
    return loadConfig();
  }
  return config;
}

export { envSchema };
