/**
 * Unit tests must not depend on a developer's real `.env`. The config package
 * validates required variables at import time, so tests get throwaway values.
 */
const defaults: Record<string, string> = {
  DISCORD_CLIENT_ID: 'test-client-id',
  DISCORD_CLIENT_SECRET: 'test-client-secret',
  DISCORD_TOKEN: 'test-bot-token',
  DISCORD_OWNER_ID: '100000000000000001',
  DISCORD_PUBLIC_KEY: 'test-public-key',
  NEXT_PUBLIC_DISCORD_CLIENT_ID: 'test-client-id',
  NEXT_PUBLIC_API_URL: 'http://localhost:4000',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  SESSION_SECRET: '0123456789abcdef0123456789abcdef',
  BOT_INTERNAL_SECRET: 'abcdef0123456789abcdef0123456789',
  OWNER_PASSWORD: 'test-owner-password-123',
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/pinguin_test',
};

for (const [key, value] of Object.entries(defaults)) {
  if (!process.env[key]) process.env[key] = value;
}