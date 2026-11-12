import {
  prisma,
  type AutoModSettings,
  type EconomySettings,
  type ShopItem,
  type XPRoleReward,
  type XPSettings,
} from '@pinguin/db';
import { getCache, setCache, invalidateCache } from '../utils/cache';

/**
 * Single place where per-guild configuration is read on hot paths.
 *
 * Every consumer (XP, economy, automod, welcome, music) goes through these
 * helpers instead of querying Postgres per event, and every write path (API
 * settings route → internal bot API) invalidates the same keys.
 */
const TTL_MS = 60_000;

export const configKeys = {
  xp: (guildId: string) => `config:xp:${guildId}`,
  roleRewards: (guildId: string) => `config:role-rewards:${guildId}`,
  economy: (guildId: string) => `config:economy:${guildId}`,
  autoMod: (guildId: string) => `config:automod:${guildId}`,
  welcome: (guildId: string) => `config:welcome:${guildId}`,
};

export async function getXpSettings(guildId: string): Promise<XPSettings | null> {
  const key = configKeys.xp(guildId);
  const cached = getCache<XPSettings>(key);
  if (cached !== undefined && cached !== null) return cached;

  const settings = await prisma.xPSettings.findUnique({ where: { guildId } });
  if (settings) setCache(key, settings, TTL_MS);
  return settings;
}

export async function getRoleRewards(guildId: string): Promise<XPRoleReward[]> {
  const key = configKeys.roleRewards(guildId);
  const cached = getCache<XPRoleReward[]>(key);
  if (cached !== null) return cached;

  const rewards = await prisma.xPRoleReward.findMany({ where: { guildId } });
  setCache(key, rewards, TTL_MS);
  return rewards;
}

export async function getEconomyConfig(
  guildId: string
): Promise<EconomySettings & { shopItems: ShopItem[] }> {
  const key = configKeys.economy(guildId);
  const cached = getCache<EconomySettings & { shopItems: ShopItem[] }>(key);
  if (cached !== null) return cached;

  const settings = await prisma.economySettings.findUnique({
    where: { guildId },
    include: { shopItems: true },
  });

  if (settings) {
    setCache(key, settings, TTL_MS);
    return settings;
  }

  const created = await prisma.economySettings.create({
    data: { guildId },
    include: { shopItems: true },
  });
  setCache(key, created, TTL_MS);
  return created;
}

export async function getAutoModConfig(guildId: string): Promise<AutoModSettings | null> {
  const key = configKeys.autoMod(guildId);
  const cached = getCache<AutoModSettings>(key);
  if (cached !== null) return cached;

  const settings = await prisma.autoModSettings.findUnique({ where: { guildId } });
  if (settings) setCache(key, settings, TTL_MS);
  return settings;
}

export async function getWelcomeConfig(guildId: string) {
  const key = configKeys.welcome(guildId);
  const cached = getCache<Awaited<ReturnType<typeof loadWelcome>>>(key);
  if (cached !== null) return cached;

  const settings = await loadWelcome(guildId);
  setCache(key, settings, TTL_MS);
  return settings;
}

async function loadWelcome(guildId: string) {
  return prisma.welcomeSettings.findUnique({ where: { guildId } });
}

/** Drop every cached config slice for one guild. */
export function invalidateGuildConfig(guildId: string): void {
  for (const key of Object.values(configKeys)) invalidateCache(key(guildId));
}

/** Drop every cached guild config (used after bulk imports or restarts). */
export function invalidateAllGuildConfig(): void {
  invalidateCache('config:');
}