import { prisma } from '@pinguin/db';
import { ensureUser } from './user';
import { isEventActive } from './events';
import { getEconomyConfig, invalidateGuildConfig } from './guild-config';
import { isModuleEnabled } from '../guards/module';

/** Cached per-guild economy configuration (settings + shop items). */
export async function getEconomySettings(guildId: string) {
  return getEconomyConfig(guildId);
}

export async function getOrCreateWallet(guildId: string, userId: string, startupBalance = 100) {
  await ensureUser(userId);
  let wallet = await prisma.economyWallet.findUnique({
    where: { guildId_userId: { guildId, userId } },
  });
  if (!wallet) {
    wallet = await prisma.economyWallet.create({
      data: { guildId, userId, wallet: startupBalance, bank: 0, totalEarned: startupBalance },
    });
  }
  return wallet;
}

export function formatCoins(amount: number, symbol: string, name: string): string {
  return `**${amount}** ${symbol} ${name}`;
}

export function invalidateEconomyCache(guildId: string): void {
  invalidateGuildConfig(guildId);
}

/** Module activé sur le serveur ou toggle « économie » dans le dashboard. */
export async function isEconomyActive(guildId: string): Promise<boolean> {
  const [settings, moduleEnabled] = await Promise.all([
    getEconomySettings(guildId),
    isModuleEnabled(guildId, 'economy'),
  ]);
  return settings.enabled || moduleEnabled;
}

export async function getEconomyMultiplier(): Promise<number> {
  if (await isEventActive('economy_bonus_x2')) return 2;
  return 1;
}
