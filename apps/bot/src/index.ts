import { getConfig } from '@pinguin/config';
import { prisma } from '@pinguin/db';
import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import { registerCommands } from './utils/register';
import { loadEvents } from './events/_loader';
import { loadCommands } from './commands/_loader';
import { startInternalBotApi } from './internal/bot-api';
import { startPublicApi } from './internal/public-api';
import { initMusicService, cleanupCookieFile, pruneOrphanQueues, stopAllMusic } from './services/music';
import { stopAllInterestCrons } from './services/economy-interests';
import { stopAllNotificationCrons } from './services/economy-notifications';
import { stopAllInactivityAlertCrons } from './services/ticket-inactivity-alert';
import { stopPollCron } from './services/poll-cron';
import { stopStreamNotificationCron } from './services/stream-notifications';
import { logger } from '@pinguin/shared';
import './interactions';

const config = getConfig();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildInvites,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();

async function start() {
  try {
    await prisma.$connect();
    logger.info('Connecté à PostgreSQL', { app: 'bot' });

    await loadCommands(client);
    loadEvents(client);

    await registerCommands(client);

    initMusicService().catch((err: unknown) => {
      logger.warn('Service musical indisponible', { err, app: 'bot' });
    });

    // Drop queue rows for guilds the bot left while the process was down.
    client.once('ready', async () => {
      try {
        await pruneOrphanQueues(new Set(client.guilds.cache.keys()));
      } catch (err: unknown) {
        logger.warn('Prune des files musicales orphelines impossible', { err, app: 'bot' });
      }
    });

    await client.login(config.DISCORD_TOKEN);
    logger.info('Connecté à Discord', { app: 'bot' });

    startInternalBotApi(client);
    logger.info('API interne démarrée', { app: 'bot' });

    startPublicApi(client, config.BOT_STATS_PORT);
    logger.info('API publique démarrée', { app: 'bot' });
  } catch (error: unknown) {
    logger.error('Erreur de démarrage', { error, app: 'bot' });
    process.exit(1);
  }
}

start();

// Dernier filet de sécurité : on journalise l'erreur puis on quitte proprement.
// Le gestionnaire de processus (pm2, Docker, systemd) se charge du redémarrage.
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled rejection', { reason, app: 'bot' });
  process.exit(1);
});
process.on('uncaughtException', (err: unknown) => {
  logger.error('Uncaught exception', { err, app: 'bot' });
  process.exit(1);
});

async function shutdown(): Promise<void> {
  logger.info('Arrêt...', { app: 'bot' });
  try {
    // 1. Stop background work so no new DB writes or Discord calls start.
    stopAllInterestCrons();
    stopAllNotificationCrons();
    stopAllInactivityAlertCrons();
    stopPollCron();
    stopStreamNotificationCron();

    // 2. Flush buffered queue state, then tear down voice connections.
    await stopAllMusic();

    // 3. Let in-flight handlers finish, bounded by a timeout.
    const destroyed = new Promise<void>((resolve) => {
      try {
        client.destroy();
      } finally {
        resolve();
      }
    });
    await Promise.race([destroyed, new Promise((resolve) => setTimeout(resolve, 5_000))]);

    cleanupCookieFile();
    await prisma.$disconnect();
    logger.info('Arrêt propre effectué', { app: 'bot' });
    process.exit(0);
  } catch (err) {
    logger.error('Erreur lors de l\'arrêt gracieux', { err, app: 'bot' });
    process.exit(1);
  }
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
