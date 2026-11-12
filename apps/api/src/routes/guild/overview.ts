import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@pinguin/db';
import { authenticate } from '../../middleware/auth';
import { validateParams } from '../../middleware/validate';
import { success, error, sanitizeError } from '../../utils/response';
import { guildIdSchema, transformAutoroleSettings, getEconomySettings, mapLogsPayload, computeDisabledModules, parseIdList } from '../../utils/guild-helpers';
import { getGuildChannels, getGuildRoles, getGuildMember, getBotGuilds } from '../../services/discord';
import { get, set } from '../../utils/cache';
import { safeJsonParse } from '../../utils/safe-parse';

const guildParam = { preHandler: [authenticate, validateParams(guildIdSchema)] };

const userCache = new Map<string, { data: { id: string; username: string; avatar: string | null }; ts: number }>();

// Discord role lookups are the expensive part of the guild list; cache them per
// (guild, user) pair so switching pages or refreshing does not re-hit Discord.
const ROLE_CACHE_SECONDS = 60;

async function fetchMemberRoles(
  userId: string,
  guildIds: string[]
): Promise<Map<string, string[]>> {
  const roles = new Map<string, string[]>();
  const missing: string[] = [];

  for (const guildId of guildIds) {
    const key = `discord:roles:${guildId}:${userId}`;
    const cached = get<string[]>(key);
    if (cached !== undefined) roles.set(guildId, cached);
    else missing.push(guildId);
  }

  if (missing.length > 0) {
    const settled = await Promise.all(
      missing.map(async (guildId) => {
        const member = await getGuildMember(guildId, userId).catch(() => null);
        const memberRoles = member && Array.isArray(member.roles) ? (member.roles as string[]) : [];
        set(`discord:roles:${guildId}:${userId}`, memberRoles, ROLE_CACHE_SECONDS);
        return { guildId, roles: memberRoles };
      })
    );

    for (const entry of settled) roles.set(entry.guildId, entry.roles);
  }

  return roles;
}

export async function overviewRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userDiscordId = request.user!.discordId;

      // Only the current member's rows are fetched, with the guild joined in the
      // same query. The previous version loaded every guild, then every member,
      // then queried premium and each guild's Discord roles in batches of ten.
      const [memberships, botGuilds] = await Promise.all([
        prisma.guildMember.findMany({
          where: { userId: userDiscordId },
          select: {
            isOwner: true,
            guild: {
              select: {
                id: true, name: true, icon: true, ownerId: true, memberCount: true,
                botPresent: true, settings: true,
              },
            },
          },
        }),
        getBotGuilds().catch(() => null as Array<{ id: string }> | null),
      ]);

      const botGuildIds = botGuilds ? new Set(botGuilds.map((g) => g.id)) : null;

      const candidates = memberships
        .map((m) => ({ ...m.guild, isOwner: m.isOwner }))
        .filter((g) => (botGuildIds ? botGuildIds.has(g.id) : true));

      // Only non-owner members of guilds that gate access behind a role need a
      // Discord lookup.
      const needsRoleCheck = candidates.filter((g) => {
        if (g.isOwner || g.ownerId === userDiscordId) return false;
        try {
          const roles: string[] = g.settings ? JSON.parse(g.settings.dashboardAccessRoles || '[]') : [];
          return roles.length > 0;
        } catch {
          return false;
        }
      });

      const discordMemberRoles = await fetchMemberRoles(
        userDiscordId,
        needsRoleCheck.map((g) => g.id)
      );

      const accessible = candidates.filter((g) => {
        if (g.isOwner || g.ownerId === userDiscordId) return true;

        let dashboardRoles: string[] = [];
        try {
          dashboardRoles = g.settings ? JSON.parse(g.settings.dashboardAccessRoles || '[]') : [];
        } catch {
          dashboardRoles = [];
        }
        if (dashboardRoles.length === 0) return false;

        const memberRoles = discordMemberRoles.get(g.id) ?? [];
        return dashboardRoles.some((r) => memberRoles.includes(r));
      });

      accessible.sort((a, b) => {
        if (a.botPresent !== b.botPresent) return a.botPresent ? -1 : 1;
        return b.memberCount - a.memberCount;
      });

      const accessibleIds = accessible.map((g) => g.id);
      const premiumGuildIds = new Set(
        accessibleIds.length === 0
          ? []
          : (await prisma.premiumSubscription.findMany({
              where: { guildId: { in: accessibleIds }, status: 'ACTIVE' },
              select: { guildId: true },
            })).map((s) => s.guildId)
      );

      const guilds = accessible.map((g) => ({
        ...g,
        isMember: true,
        hasDashboardAccess: true,
        premium: (premiumGuildIds.has(g.id) ? 'BASIC' : 'FREE') as 'BASIC' | 'FREE',
      }));

      reply.send(success({ guilds }));
    } catch (err: unknown) {
      reply.status(500).send(error(sanitizeError(err)));
    }
  });

  app.get('/:guildId', guildParam, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { guildId } = request.params as { guildId: string };
      const guild = await prisma.guild.findUnique({
        where: { id: guildId },
        include: {
          settings: true, modulesEnabled: true, logSettings: true,
          xpSettings: true, welcomeSettings: true,
          protectionSettings: true,
          autoroleSettings: { include: { entries: true } },
          savedEmbeds: true,
          xpRoleRewards: true,
        },
      });
      if (!guild) return reply.status(404).send(error('Serveur introuvable'));
      if (!guild.autoroleSettings) {
        guild.autoroleSettings = await prisma.autoroleSettings.upsert({
          where: { guildId },
          update: {},
          create: { guildId },
          include: { entries: true },
        });
      }
      if (!guild.protectionSettings) {
        guild.protectionSettings = await prisma.protectionSettings.create({
          data: { guildId },
        });
      }
      const es = await getEconomySettings(guildId);
      let channelCount = 0, roleCount = 0;
      try {
        const [channels, roles] = await Promise.all([
          getGuildChannels(guildId),
          getGuildRoles(guildId),
        ]);
        channelCount = channels.filter((c: { type?: number }) => c.type !== 4).length;
        roleCount = roles.filter((r: { id?: string }) => r.id !== guildId).length;
      } catch {}
      const payload = {
        ...guild,
        autoroles: transformAutoroleSettings(guild.autoroleSettings),
        protection: guild.protectionSettings || { enabled: false, emergencyMode: false, antiRaid: false, raidThreshold: 10, raidInterval: 10, antiSpam: false, spamThreshold: 5, spamInterval: 5, antiMassMention: false, mentionThreshold: 5, antiLink: false, antiAlts: false, altAccountAge: 7, verificationLevel: 'NONE', captchaVerification: false, punishment: 'KICK' },
        economy: {
          enabled: es.enabled,
          currencyName: es.currencyName,
          currencySymbol: es.currencySymbol,
          dailyAmount: es.dailyAmount,
          weeklyAmount: es.weeklyAmount,
          startupBalance: es.startupBalance,
          workMin: es.workMin,
          workMax: es.workMax,
          workCooldown: es.workCooldown,
          robberyEnabled: es.robberyEnabled,
          robberyMaxAmount: es.robberyMaxAmount,
          robberyCooldown: es.robberyCooldown,
          interestRate: es.interestRate,
          interestInterval: es.interestInterval,
          bankCapacity: es.bankCapacity,
          shopItems: es.shopItems?.map((i) => ({
            id: i.id, name: i.name, description: i.description, price: i.price, roleId: i.roleId,
          })) ?? [],
        },
        levels: guild.xpSettings ? {
          enabled: guild.xpSettings.enabled,
          xpPerMessageMin: guild.xpSettings.xpPerMessageMin,
          xpPerMessageMax: guild.xpSettings.xpPerMessageMax,
          voiceXp: guild.xpSettings.voiceXp,
          messageCooldown: guild.xpSettings.messageCooldown,
          voiceCooldown: guild.xpSettings.voiceCooldown,
          levelFormula: guild.xpSettings.levelFormula,
          maxLevel: guild.xpSettings.maxLevel,
          ignoredChannels: parseIdList(guild.xpSettings.ignoredChannels),
          ignoredRoles: parseIdList(guild.xpSettings.ignoredRoles),
          announcementChannelId: guild.xpSettings.announcementChannelId,
          announcementMessage: guild.xpSettings.announcementMessage,
          roleRewards: guild.xpRoleRewards?.map((rr) => ({ level: rr.levelRequired, roleId: rr.roleId, xpMultiplier: rr.xpMultiplier })) ?? [],
        } : undefined,
        welcome: guild.welcomeSettings || undefined,
        logs: mapLogsPayload(guild.logSettings, guild.modulesEnabled),
        logSettings: guild.logSettings ? {
          logChannelId: guild.logSettings.logChannelId,
          events: parseIdList(guild.logSettings.events),
          ignoredChannels: parseIdList(guild.logSettings.ignoredChannels),
          ignoredRoles: parseIdList(guild.logSettings.ignoredRoles),
        } : undefined,
        embeds: (guild.savedEmbeds || []).map((e) => ({
          id: e.id,
          name: e.name,
          title: e.title,
          description: e.description,
          color: e.color,
          fields: safeJsonParse<unknown[]>(e.fields, []),
          footer: e.footer,
          image: e.image,
          thumbnail: e.thumbnail,
          timestamp: e.timestamp,
        })),
        disabledModules: computeDisabledModules(guild.modulesEnabled),
        memberCount: guild.memberCount, channelCount, roleCount,
        dashboardAccessRoles: guild.settings ? parseIdList(guild.settings.dashboardAccessRoles) : [],
        dashboardModerationAccess: guild.settings ? parseIdList(guild.settings.dashboardModerationAccess) : [],
        dashboardTicketsAccess: guild.settings ? parseIdList(guild.settings.dashboardTicketsAccess) : [],
        dashboardPollsAccess: guild.settings ? parseIdList(guild.settings.dashboardPollsAccess) : [],
        dashboardSuggestionsAccess: guild.settings ? parseIdList(guild.settings.dashboardSuggestionsAccess) : [],
        dashboardGiveawaysAccess: guild.settings ? parseIdList(guild.settings.dashboardGiveawaysAccess) : [],
        dashboardEconomyAccess: guild.settings ? parseIdList(guild.settings.dashboardEconomyAccess) : [],
        dashboardMusicAccess: guild.settings ? parseIdList(guild.settings.dashboardMusicAccess) : [],
        dashboardLevelsAccess: guild.settings ? parseIdList(guild.settings.dashboardLevelsAccess) : [],
        dashboardWelcomeAccess: guild.settings ? parseIdList(guild.settings.dashboardWelcomeAccess) : [],
        dashboardAutorolesAccess: guild.settings ? parseIdList(guild.settings.dashboardAutorolesAccess) : [],
        dashboardLogsAccess: guild.settings ? parseIdList(guild.settings.dashboardLogsAccess) : [],
        dashboardProtectionAccess: guild.settings ? parseIdList(guild.settings.dashboardProtectionAccess) : [],
        dashboardAuditAccess: guild.settings ? parseIdList(guild.settings.dashboardAuditAccess) : [],
      };
      reply.send(success({ guild: payload }));
    } catch (err: unknown) {
      reply.status(500).send(error(sanitizeError(err)));
    }
  });

  app.get('/:guildId/channels', guildParam, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { guildId } = request.params as { guildId: string };
      const channels = await getGuildChannels(guildId);
      reply.send(success({ channels }));
    } catch (err: unknown) {
      reply.status(500).send(error(sanitizeError(err)));
    }
  });

  app.get('/:guildId/roles', guildParam, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { guildId } = request.params as { guildId: string };
      const roles = await getGuildRoles(guildId);
      reply.send(success({ roles }));
    } catch (err: unknown) {
      reply.status(500).send(error(sanitizeError(err)));
    }
  });

  app.get('/:guildId/resolve-user/:userId', guildParam, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { guildId, userId } = request.params as { guildId: string; userId: string };
      const cached = userCache.get(userId);
      if (cached && (Date.now() - cached.ts) < 300_000) {
        return reply.send(success({ data: cached.data }));
      }
      let user = await prisma.user.findUnique({ where: { discordId: userId }, select: { discordId: true, username: true, avatar: true } });
      if (user) {
        userCache.set(userId, { data: { id: user.discordId, username: user.username, avatar: user.avatar }, ts: Date.now() });
        return reply.send(success({ data: { id: user.discordId, username: user.username, avatar: user.avatar } }));
      }
      const member = await getGuildMember(guildId, userId).catch(() => null);
      if (member && member.user) {
        const upserted = await prisma.user.upsert({
          where: { discordId: userId },
          update: { username: member.user.username, avatar: member.user.avatar ?? undefined },
          create: { discordId: userId, username: member.user.username, avatar: member.user.avatar ?? undefined },
          select: { discordId: true, username: true, avatar: true },
        });
        userCache.set(userId, { data: { id: upserted.discordId, username: upserted.username, avatar: upserted.avatar }, ts: Date.now() });
        return reply.send(success({ data: { id: upserted.discordId, username: upserted.username, avatar: upserted.avatar } }));
      }
      reply.status(404).send(error('Utilisateur introuvable'));
    } catch (err: unknown) {
      reply.status(500).send(error(sanitizeError(err)));
    }
  });

  app.get('/:guildId/leaderboard', guildParam, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { guildId } = request.params as { guildId: string };
      const q = request.query as Record<string, string | undefined>;
      const limit = Math.min(100, Math.max(1, parseInt(q.limit ?? '20', 10) || 10));
      const profiles = await prisma.xPProfile.findMany({
        where: { guildId },
        orderBy: { xp: 'desc' },
        take: limit,
        include: { user: { select: { username: true, avatar: true, discordId: true } } },
      });
      const entries = profiles.map((p, i) => ({
        rank: i + 1,
        userId: p.userId,
        username: p.user?.username ?? 'Inconnu',
        avatar: p.user?.avatar ?? null,
        xp: p.xp,
        level: p.level,
      }));
      reply.send(success({ entries }));
    } catch (err: unknown) { reply.status(500).send(error(sanitizeError(err))); }
  });

  app.get('/:guildId/invites/leaderboard', guildParam, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { guildId } = request.params as { guildId: string };

      const leaderboard = await prisma.$queryRaw<Array<{
        inviter_id: string;
        total_invites: bigint;
        fake_invites: bigint;
        left_invites: bigint;
        net_invites: bigint;
      }>>`
        SELECT
          inviter_id,
          COUNT(*) as total_invites,
          SUM(CASE WHEN is_fake = true THEN 1 ELSE 0 END) as fake_invites,
          SUM(CASE WHEN has_left = true THEN 1 ELSE 0 END) as left_invites,
          COUNT(*) - SUM(CASE WHEN is_fake = true THEN 1 ELSE 0 END) - SUM(CASE WHEN has_left = true THEN 1 ELSE 0 END) as net_invites
        FROM invite_tracks
        WHERE guild_id = ${guildId}
        GROUP BY inviter_id
        ORDER BY net_invites DESC
        LIMIT 50
      `;

      const inviterIds = leaderboard.map(e => e.inviter_id);
      const users = await prisma.user.findMany({
        where: { discordId: { in: inviterIds } },
        select: { discordId: true, username: true, avatar: true },
      });

      const userMap = new Map(users.map(u => [u.discordId, u]));

      const entries = leaderboard.map((entry, index) => {
        const user = userMap.get(entry.inviter_id);
        return {
          rank: index + 1,
          userId: entry.inviter_id,
          username: user?.username ?? 'Inconnu',
          avatar: user?.avatar,
          totalInvites: Number(entry.total_invites),
          fakeInvites: Number(entry.fake_invites),
          leftInvites: Number(entry.left_invites),
          netInvites: Number(entry.net_invites),
        };
      });

      reply.send(success({ leaderboard: entries }));
    } catch (err: unknown) {
      reply.status(500).send(error(sanitizeError(err)));
    }
  });
}
