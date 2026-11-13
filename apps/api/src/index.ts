import Fastify, { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import csrf from '@fastify/csrf-protection';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import { constants as zlibConstants } from 'zlib';
import { z } from 'zod';
import { getConfig } from '@pinguin/config';
import { prisma } from '@pinguin/db';
import { authRoutes } from './routes/auth';
import { guildRoutes } from './routes/guild/index';
import { overviewRoutes } from './routes/overview';
import { ownerRoutes } from './routes/owner';
import { deployRoutes } from './routes/deploy';
import { musicRoutes } from './routes/music';
import { webhookRoutes } from './routes/webhooks';
import { internalRoutes } from './routes/internal';
import { systemRoutes } from './routes/system';
import { onboardingRoutes } from './routes/onboarding';
import { notificationRoutes } from './routes/notifications';
import { blacklistRoutes } from './routes/blacklist';
import { embedRoutes } from './routes/embeds';
import { authenticate } from './middleware/auth';
import type { RouteOptions } from 'fastify';
import { idempotency, idempotent } from './middleware/idempotency';
import { checkMaintenance } from './middleware/maintenanceCheck';
import { success, error, paginated, sanitizeError, getErrorMessage } from './utils/response';
import { cachedJson } from './utils/http-cache';
import { ensureOwnerPasswordHash } from './services/ownerPassword';
import { getSystemMetrics, getGlobalStats } from './services/metrics';
import { botFetch } from './services/bot-proxy';
import { startSessionCleanup } from './jobs/cleanup';
import { startTicketCleanup } from './jobs/cleanup-tickets';
import { startRetentionCleanup } from './jobs/cleanup-retention';

const config = getConfig();

let app: ReturnType<typeof Fastify>;
let internalApp: ReturnType<typeof Fastify>;

async function main() {
  app = Fastify({ logger: true });

  await app.register(cors, {
    origin: config.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean),
    credentials: true,
  });

  await app.register(cookie, {
    secret: config.SESSION_SECRET,
  });

  await app.register(csrf, {
    secret: config.SESSION_SECRET,
    cookieOpts: {
      signed: true,
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    },
  });

  app.addHook('onRequest', checkMaintenance);

  // Response compression: Brotli for modern clients, gzip as fallback.
  // Streaming responses (SSE) and already-compressed payloads are skipped.
  await app.register(compress, {
    global: true,
    threshold: 1024,
    encodings: ['br', 'gzip'],
    brotli: {
      params: {
        [zlibConstants.BROTLI_PARAM_QUALITY]: 4,
        [zlibConstants.BROTLI_PARAM_MODE]: zlibConstants.BROTLI_DEFAULT_MODE,
      },
    },
    zlib: { level: 6 },
    filter: (_request: FastifyRequest, reply: FastifyReply) => {
      const contentType = reply.getHeader('content-type');
      if (typeof contentType === 'string' && contentType.includes('text/event-stream')) return false;
      return true;
    },
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    // `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` and
    // `Retry-After` are added by the plugin for every response.
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
      'retry-after': true,
    },
    keyGenerator: (request: FastifyRequest) => {
      // Authenticated callers share a bucket per user so one abusive token
      // cannot starve the rest of the API; anonymous traffic is per-IP.
      const header = request.headers.authorization;
      if (header?.startsWith('Bearer ')) return `token:${header.slice(7, 27)}`;
      const forwarded = request.headers['x-forwarded-for'];
      const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]?.trim();
      return ip || request.socket.remoteAddress || 'unknown';
    },
  });

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "https://cdn.discordapp.com", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameSrc: [],
        frameAncestors: ["'none'"],
      },
    },
  });

  app.setErrorHandler((error: FastifyError, _request: FastifyRequest, reply: FastifyReply) => {
    app.log.error(error);
    const statusCode = error.statusCode || 500;

    if (statusCode === 429) {
      const retryAfter = reply.getHeader('retry-after');
      reply.send({
        success: false,
        error: error.message || 'Trop de requêtes',
        retryAfter: retryAfter ? Number(retryAfter) : null,
      });
      return;
    }

    reply.status(statusCode).send({
      success: false,
      error: statusCode >= 500 ? sanitizeError(error) : (error.message || 'Erreur interne du serveur'),
    });
  });

  await ensureOwnerPasswordHash();

  // Per-domain rate limits: sensitive or expensive surfaces get a tighter
  // budget than the global 100 req/min, and the plugin emits the
  // X-RateLimit-* / Retry-After headers for each of them.
  await app.register(authRoutes, {
    prefix: '/api/auth',
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
  });
  await app.register(guildRoutes, { prefix: '/api/guilds' });
  await app.register(overviewRoutes, { prefix: '/api/overview' });
  // Owner POSTs honour `Idempotency-Key`: deploy, restart, backup, premium
  // grants and blacklist changes must not run twice when a client retries.
  await app.register(ownerRoutes, {
    prefix: '/api/owner',
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
    onRoute: (options: RouteOptions) => {
      if (options.method !== 'POST') return;
      options.preHandler = [idempotency(), ...[options.preHandler ?? []].flat()];
      if (options.handler) options.handler = idempotent(options.handler);
    },
  });
  await app.register(deployRoutes, {
    prefix: '/api/deploy',
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
  });
  await app.register(musicRoutes, {
    prefix: '/api/music',
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
  });
  await app.register(webhookRoutes, {
    prefix: '/api/webhooks',
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
  });
  await app.register(systemRoutes, { prefix: '/api/system' });
  await app.register(onboardingRoutes, { prefix: '/api' });
  await app.register(notificationRoutes, { prefix: '/api/guilds' });
  await app.register(blacklistRoutes, { prefix: '/api/guilds' });
  await app.register(embedRoutes, { prefix: '/api/guilds' });

  const inviteQuerySchema = z.object({
    guild_id: z.string().optional(),
  });

  app.get('/api/bot/invite', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = inviteQuerySchema.parse(request.query);
      const clientId = config.DISCORD_CLIENT_ID;
      if (!clientId) {
        return reply.status(500).send(error('DISCORD_CLIENT_ID non configuré'));
      }
      const permissions = '274877910496';
      const scope = encodeURIComponent('bot applications.commands');
      let url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=${scope}`;
      if (query.guild_id) url += `&guild_id=${query.guild_id}&disable_guild_select=true`;
      reply.send(success({ url }));
    } catch (err: unknown) {
      reply.status(500).send(error(sanitizeError(err)));
    }
  });

  app.get('/api/donors', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const donors = await prisma.donor.findMany({
        where: { isPublic: true, isDonor: true },
        select: { id: true, userId: true, username: true, avatarUrl: true, amount: true, message: true, donatedAt: true },
        orderBy: { amount: 'desc' },
        take: 50,
      });
      reply.send(success({ donors }));
    } catch (err: unknown) {
      reply.status(500).send(error(sanitizeError(err)));
    }
  });

  // ─── Health checks ──────────────────────────────────────────────────────────
  // Liveness answers "is this process alive?"; readiness answers "can it serve
  // traffic?". Keeping them apart means a dead dependency no longer reports the
  // API itself as down (which would trigger pointless restarts).

  type CheckState = 'ok' | 'error';
  interface CheckResult {
    state: CheckState;
    latencyMs: number;
    error?: string;
  }

  const CHECK_TIMEOUT_MS = 3_000;

  async function timedCheck(fn: () => Promise<void>, fallbackError = 'unknown error'): Promise<CheckResult> {
    const startedAt = Date.now();
    try {
      await fn();
      return { state: 'ok', latencyMs: Date.now() - startedAt };
    } catch (err: unknown) {
      return {
        state: 'error',
        latencyMs: Date.now() - startedAt,
        error: err instanceof Error ? err.message : fallbackError,
      };
    }
  }

  async function runReadinessChecks(): Promise<{
    ok: boolean;
    checks: Record<string, CheckResult>;
  }> {
    const [database, bot, discord] = await Promise.all([
      timedCheck(async () => {
        await prisma.$queryRaw`SELECT 1`;
      }),
      timedCheck(async () => {
        await botFetch('/internal/ping');
      }, 'BOT_OFFLINE'),
      timedCheck(async () => {
        const response = await fetch('https://discord.com/api/v10/gateway', {
          signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
        });
        if (!response.ok) throw new Error(`Discord API ${response.status}`);
      }),
    ]);

    const checks: Record<string, CheckResult> = { database, bot, discord };

    const memory = process.memoryUsage();
    const heapUsedMb = Math.round(memory.heapUsed / 1024 / 1024);
    const heapLimitMb = Math.round(memory.heapTotal / 1024 / 1024);
    checks.memory = {
      state: heapUsedMb / Math.max(1, heapLimitMb) > 0.95 ? 'error' : 'ok',
      latencyMs: 0,
    };

    return {
      ok: Object.values(checks).every((check) => check.state === 'ok'),
      checks,
    };
  }

  const healthConfig = { config: { rateLimit: false } } as const;

  // Liveness: no dependency checks, always 200 while the event loop runs.
  app.get('/api/health/live', healthConfig, async () => ({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }));

  // Readiness: 503 when a dependency is unhealthy so orchestrators stop routing.
  app.get('/api/health/ready', healthConfig, async (_request: FastifyRequest, reply: FastifyReply) => {
    const { ok, checks } = await runReadinessChecks();
    reply.status(ok ? 200 : 503).send({
      status: ok ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    });
  });

  // Backwards-compatible alias: existing probes and scripts use /api/health.
  app.get('/api/health', healthConfig, async (_request: FastifyRequest, reply: FastifyReply) => {
    const { ok, checks } = await runReadinessChecks();
    reply.status(ok ? 200 : 503).send({
      status: ok ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: Object.fromEntries(
        Object.entries(checks).map(([name, result]) => [name, result.state])
      ),
    });
  });

  app.get('/api/health/bot', { preHandler: [authenticate] }, async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      await botFetch('/internal/ping');
      reply.send({ success: true, status: 'ONLINE' });
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      if (message === 'BOT_OFFLINE' || (err instanceof Error && err.name === 'AbortError')) {
        reply.send({ success: true, status: 'OFFLINE' });
      } else {
        reply.send({ success: true, status: 'DEGRADED', error: sanitizeError(err) });
      }
    }
  });

  const paginationQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  });

  app.get('/api/stats/public', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const [guildCount, memberAgg, commandCount] = await Promise.all([
        prisma.guild.count({ where: { botPresent: true } }),
        prisma.guild.aggregate({
          where: { botPresent: true },
          _sum: { memberCount: true },
        }),
        prisma.auditLog.count(),
      ]);
      // Anonymous, identical for every visitor: let browsers and proxies reuse
      // it for a minute instead of recomputing three counts per page view.
      cachedJson(
        request,
        reply,
        success({
          totalGuilds: guildCount,
          totalUsers: memberAgg._sum.memberCount ?? 0,
          totalCommands: commandCount,
        }),
        { scope: 'public', maxAgeSeconds: 60, extensions: ['stale-while-revalidate=300'] },
      );
    } catch (err: unknown) {
      reply.status(500).send(error(sanitizeError(err)));
    }
  });

  app.get('/api/stats', {
    preHandler: [authenticate],
    config: {
      rateLimit: {
        max: 20,
        timeWindow: '1 minute',
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const discordId = request.user!.discordId;
      const isOwner = discordId === config.DISCORD_OWNER_ID;

      if (!isOwner) {
        const [guildCount, memberAgg] = await Promise.all([
          prisma.guild.count({ where: { botPresent: true } }),
          prisma.guild.aggregate({
            where: { botPresent: true },
            _sum: { memberCount: true },
          }),
        ]);
        let onlineMembers = 0;
        try {
          const botStats = await botFetch('/internal/stats') as { data?: { onlineMembers?: number } };
          onlineMembers = botStats?.data?.onlineMembers ?? 0;
        } catch { /* bot offline */ }
        return reply.send(success({
          isOwner: false,
          totalGuilds: guildCount,
          totalUsers: memberAgg._sum.memberCount ?? 0,
          onlineMembers,
          activeChannels: 0,
        }));
      }

      const [globalStats, metrics, commandCount] = await Promise.all([
        getGlobalStats(),
        getSystemMetrics(),
        prisma.auditLog.count(),
      ]);
      let onlineMembers = 0;
      try {
        const botStats = await botFetch('/internal/stats') as { data?: { onlineMembers?: number } };
        onlineMembers = botStats?.data?.onlineMembers ?? 0;
      } catch { /* bot offline */ }
      reply.send(success({
        isOwner: true,
        totalGuilds: globalStats.guilds,
        totalUsers: globalStats.users,
        totalCommands: commandCount,
        uptime: metrics.processUptime,
        cpuUsage: metrics.cpu,
        ramUsage: metrics.ram.percent,
        premiumRevenue: 0,
        systemStatus: 'OPERATIONAL',
        onlineMembers,
      }));
    } catch (err: unknown) {
      reply.status(500).send(error(sanitizeError(err)));
    }
  });

  app.get('/api/changelogs', {
    preHandler: [authenticate],
    config: {
      rateLimit: {
        max: 20,
        timeWindow: '1 minute',
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = paginationQuerySchema.parse(request.query);
      const [entries, total] = await Promise.all([
        prisma.changelog.findMany({
          where: { published: true },
          orderBy: { createdAt: 'desc' },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          include: {
            author: { select: { username: true, avatar: true } },
          },
        }),
        prisma.changelog.count({ where: { published: true } }),
      ]);
      // Published entries change rarely, and every reader sees the same list.
      cachedJson(request, reply, paginated(entries, total, query.page, query.limit), {
        scope: 'private',
        maxAgeSeconds: 60,
      });
    } catch (err: unknown) {
      reply.status(500).send(error(sanitizeError(err)));
    }
  });

  try {
    await app.listen({
      host: config.API_HOST,
      port: config.API_PORT,
    });
    app.log.info(`Serveur public démarré sur ${config.API_URL}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  internalApp = Fastify({ logger: true });
  await internalApp.register(internalRoutes, { prefix: '/api/internal' });
  internalApp.setErrorHandler((error: FastifyError, _request: FastifyRequest, reply: FastifyReply) => {
    internalApp.log.error(error);
    reply.status(error.statusCode || 500).send({
      success: false,
      error: error.message || 'Erreur interne du serveur',
    });
  });

  try {
    await internalApp.listen({
      host: '127.0.0.1',
      port: config.API_INTERNAL_PORT,
    });
    internalApp.log.info(`Serveur interne démarré sur 127.0.0.1:${config.API_INTERNAL_PORT}`);
  } catch (err) {
    internalApp.log.error(err);
    process.exit(1);
  }

  startSessionCleanup();
  startTicketCleanup();
  startRetentionCleanup();
}

main();

async function gracefulShutdown(signal: string) {
  console.log(`Signal ${signal} reçu, arrêt gracieux...`);
  try {
    await app.close();
    if (internalApp) await internalApp.close();
    await prisma.$disconnect();
    console.log('Arrêt propre effectué');
    process.exit(0);
  } catch (err) {
    console.error('Erreur lors de l\'arrêt gracieux:', err);
    process.exit(1);
  }
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
