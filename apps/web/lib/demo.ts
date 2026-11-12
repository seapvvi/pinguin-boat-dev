// Sample data for the logged-out dashboard preview. Nothing here reaches the
// api: apiFetch falls back to it when a request is refused (401/403) or the api
// is unreachable, so the screens can be browsed without a discord session.
import type { GuildConfig, GuildItemDTO } from '@pinguin/shared';
import type { User } from './auth';

export const DEMO_USER: User = {
  id: '100000000000000001',
  username: 'preview',
  discriminator: '0',
  avatar: null,
  globalName: 'pinguin preview',
  locale: 'en',
  isOwner: false,
  isDonor: false,
  premium: false,
};

const now = Date.now();
const iso = (daysAgo: number) => new Date(now - daysAgo * 86_400_000).toISOString();

export const DEMO_GUILDS: GuildItemDTO[] = [
  {
    id: '200000000000000001',
    name: 'the harbour',
    icon: null,
    ownerId: '100000000000000001',
    memberCount: 4820,
    botPresent: true,
    premium: 'FREE' as GuildItemDTO['premium'],
  },
  {
    id: '200000000000000002',
    name: 'night watch',
    icon: null,
    ownerId: '100000000000000001',
    memberCount: 1264,
    botPresent: true,
    premium: 'FREE' as GuildItemDTO['premium'],
  },
  {
    id: '200000000000000003',
    name: 'paper boats',
    icon: null,
    ownerId: '100000000000000001',
    memberCount: 318,
    botPresent: false,
    premium: 'FREE' as GuildItemDTO['premium'],
  },
];

const DEMO_GUILD_ID = DEMO_GUILDS[0].id;

export const DEMO_STATS = {
  totalGuilds: DEMO_GUILDS.length,
  totalUsers: DEMO_GUILDS.reduce((n, g) => n + g.memberCount, 0),
  totalCommands: 184_302,
  uptime: 4_612_800,
  cpuUsage: 7,
  ramUsage: 31,
  premiumRevenue: 0,
  systemStatus: 'OPERATIONAL',
  onlineMembers: 912,
  activeChannels: 46,
};

export const DEMO_GUILD_CONFIG: GuildConfig = {
  id: '300000000000000001',
  guildId: DEMO_GUILD_ID,
  locale: 'en',
  prefix: '!',
  premium: 'FREE' as GuildConfig['premium'],
  premiumSince: null,
  alphaMode: true,
  disabledModules: [],
  moderation: {
    enabled: true,
    modLogChannelId: '400000000000000010',
    modRoleId: '500000000000000001',
    adminRoleId: '500000000000000002',
    muteRoleId: '500000000000000003',
    defaultMuteDuration: 3600,
    maxWarns: 3,
    warnPunishment: null,
    dmOnWarn: true,
    dmOnMute: true,
    dmOnKick: false,
    dmOnBan: true,
  },
  protection: {
    enabled: true,
    antiRaid: true,
    raidThreshold: 8,
    raidInterval: 60,
    antiAlts: true,
    altAccountAge: 7,
    verificationLevel: 'MEDIUM',
    captchaVerification: false,
    verifiedRoleId: '500000000000000004',
    antiSpam: true,
    spamThreshold: 6,
    spamInterval: 5,
    antiMassMention: true,
    mentionThreshold: 5,
    antiLink: false,
    punishment: 'MUTE',
  },
  tickets: {
    enabled: true,
    categoryId: '400000000000000020',
    ticketChannelId: null,
    supportRoleIds: ['500000000000000001'],
    ticketLimit: 1,
    closeOnLeave: true,
    loggingEnabled: true,
    transcriptEnabled: true,
    customMessage: null,
    allowedCategories: ['support', 'report'],
  },
  logs: {
    enabled: true,
    logChannelId: '400000000000000011',
    enabledEvents: [],
    ignoreChannels: [],
    ignoreUsers: [],
  },
  levels: {
    enabled: true,
    xpRate: 15,
    voiceXpRate: 5,
    xpCooldown: 60,
    levelUpMessage: 'level {level} — nice.',
    levelUpChannelId: '400000000000000012',
    stackRoles: true,
    roleRewards: [],
  },
  economy: {
    enabled: true,
    currencyName: 'dollars',
    currencySymbol: '€',
    dailyAmount: 250,
    weeklyAmount: 1200,
    workMin: 40,
    workMax: 160,
    workCooldown: 3600,
    robberyEnabled: false,
    robberyCooldown: 7200,
    robberyMaxAmount: 300,
    interestRate: 2,
    interestInterval: 86_400,
    bankCapacity: 25_000,
    startupBalance: 500,
    shopItems: [],
  },
  music: {
    enabled: true,
    maxQueueLength: 50,
    maxPlaylistLength: 100,
    defaultVolume: 60,
    allowDjRole: true,
    djRoleId: null,
    restrictToVoiceChannel: true,
    voiceChannelId: null,
    announceTracks: true,
  },
  welcome: {
    enabled: true,
    welcomeChannelId: '400000000000000013',
    welcomeMessage: 'welcome to {server}, {user}.',
    welcomeEmbed: true,
    goodbyeChannelId: null,
    goodbyeMessage: null,
    goodbyeEmbed: false,
    goodbyeEnabled: false,
    welcomeDM: false,
    welcomeDMMessage: null,
    welcomeImageUrl: null,
    cardEnabled: false,
    cardBackground: 'COLOR',
    cardBgColor: '#0b0b0b',
    cardBgImage: null,
    cardTextColor: '#e9e2d6',
    cardSubtextColor: '#a09a90',
    cardAccentColor: '#e9e2d6',
    cardBlurBackground: false,
    cardText: '{user}',
    cardSubtext: 'member #{count}',
  },
  autoroles: {
    enabled: true,
    roleIds: [],
    delay: 0,
    botRoles: [],
    ignoreBots: true,
  },
  embeds: [],
  createdAt: iso(120),
  updatedAt: iso(1),
};

export const DEMO_CHANGELOGS = [
  { id: 'c1', version: '0.1.4', title: 'ticket transcripts, keepable', content: 'transcripts are stored as html and txt.', published: true, createdAt: iso(3) },
  { id: 'c2', version: '0.1.3', title: 'level rewards stack', content: 'role rewards no longer replace each other.', published: true, createdAt: iso(9) },
  { id: 'c3', version: '0.1.2', title: 'automod rule builder', content: 'rules are built from the dashboard now.', published: true, createdAt: iso(16) },
  { id: 'c4', version: '0.1.1', title: 'economy interest', content: 'daily interest on the bank balance.', published: true, createdAt: iso(24) },
  { id: 'c5', version: '0.1.0', title: 'first alpha', content: 'nineteen modules, one switch each.', published: true, createdAt: iso(31) },
];

export const DEMO_LEADERBOARD = [
  { rank: 1, userId: 'u1', username: 'harbourmaster', avatar: '', xp: 184_200, level: 84, guildId: DEMO_GUILD_ID },
  { rank: 2, userId: 'u2', username: 'lowtide', avatar: '', xp: 152_800, level: 76, guildId: DEMO_GUILD_ID },
  { rank: 3, userId: 'u3', username: 'papercrane', avatar: '', xp: 121_400, level: 68, guildId: DEMO_GUILD_ID },
  { rank: 4, userId: 'u4', username: 'nightferry', avatar: '', xp: 96_010, level: 61, guildId: DEMO_GUILD_ID },
  { rank: 5, userId: 'u5', username: 'saltwind', avatar: '', xp: 74_660, level: 55, guildId: DEMO_GUILD_ID },
];

export const DEMO_DONORS = [
  { id: 'd1', username: 'harbourmaster', amount: 15, message: 'keep the lights on' },
  { id: 'd2', username: 'lowtide', amount: 5, message: null },
];

// Generic payload for the guild-scoped screens: the same shape the api returns
// for each collection, so lists render with a handful of rows instead of errors.
function guildCollection(pathname: string) {
  const pagination = { page: 1, limit: 20, total: 3, totalPages: 1, hasMore: false };
  if (pathname.endsWith('/moderation')) {
    return {
      cases: [
        { id: 'm1', type: 'WARN', userId: 'u3', username: 'papercrane', moderatorId: 'u1', moderatorName: 'harbourmaster', reason: 'spam in #general', active: true, createdAt: iso(1) },
        { id: 'm2', type: 'MUTE', userId: 'u5', username: 'saltwind', moderatorId: 'u2', moderatorName: 'lowtide', reason: 'caps lock', active: true, createdAt: iso(4) },
        { id: 'm3', type: 'KICK', userId: 'u9', username: 'drifter', moderatorId: 'u1', moderatorName: 'harbourmaster', reason: 'raid attempt', active: false, createdAt: iso(12) },
      ],
      pagination,
    };
  }
  if (pathname.endsWith('/tickets')) {
    return {
      tickets: [
        { id: 't1', number: 41, category: 'support', subject: 'rank card not showing', userId: 'u3', username: 'papercrane', status: 'OPEN', priority: 'NORMAL', createdAt: iso(1) },
        { id: 't2', number: 40, category: 'report', subject: 'user advertising', userId: 'u5', username: 'saltwind', status: 'OPEN', priority: 'HIGH', createdAt: iso(2) },
        { id: 't3', number: 39, category: 'support', subject: 'daily claim failed', userId: 'u2', username: 'lowtide', status: 'CLOSED', priority: 'LOW', createdAt: iso(6) },
      ],
      pagination,
    };
  }
  if (pathname.endsWith('/giveaways')) {
    return {
      giveaways: [
        { id: 'g1', prize: 'nitro classic', hostId: 'u1', hostName: 'harbourmaster', channelId: '400000000000000012', winnersCount: 1, entriesCount: 214, status: 'ACTIVE', endsAt: iso(-2), createdAt: iso(1) },
        { id: 'g2', prize: 'rank card theme', hostId: 'u2', hostName: 'lowtide', channelId: '400000000000000012', winnersCount: 3, entriesCount: 96, status: 'ENDED', endsAt: iso(3), createdAt: iso(10) },
      ],
      pagination,
    };
  }
  if (pathname.endsWith('/polls')) {
    return {
      polls: [
        { id: 'p1', question: 'which module next?', authorId: 'u1', authorName: 'harbourmaster', channelId: '400000000000000012', options: [{ label: 'voice roles', votes: 88 }, { label: 'temp channels', votes: 54 }], totalVotes: 142, status: 'ACTIVE', createdAt: iso(2) },
      ],
      pagination,
    };
  }
  if (pathname.endsWith('/suggestions')) {
    return {
      suggestions: [
        { id: 's1', content: 'add a music queue view to the dashboard', authorId: 'u3', authorName: 'papercrane', upvotes: 64, downvotes: 3, status: 'OPEN', createdAt: iso(3) },
        { id: 's2', content: 'per-channel automod rules', authorId: 'u5', authorName: 'saltwind', upvotes: 41, downvotes: 9, status: 'OPEN', createdAt: iso(8) },
      ],
      pagination,
    };
  }
  if (pathname.endsWith('/levels/leaderboard')) {
    return { entries: DEMO_LEADERBOARD, pagination };
  }
  if (pathname.endsWith('/economy/leaderboard')) {
    return {
      entries: [
        { rank: 1, userId: 'u1', username: 'harbourmaster', avatar: '', balance: 182_400, bank: 25_000 },
        { rank: 2, userId: 'u2', username: 'lowtide', avatar: '', balance: 91_220, bank: 12_500 },
        { rank: 3, userId: 'u3', username: 'papercrane', avatar: '', balance: 40_310, bank: 6_000 },
      ],
      pagination,
    };
  }
  if (pathname.endsWith('/roles')) {
    return { roles: [{ id: '500000000000000001', name: 'moderator', color: 0xe9e2d6, position: 4 }, { id: '500000000000000004', name: 'verified', color: 0x9a9a8a, position: 2 }] };
  }
  if (pathname.endsWith('/starboard/entries')) {
    return {
      entries: [
        { id: 'sb1', messageId: '1', channelId: '400000000000000012', authorId: 'u3', authorName: 'papercrane', content: 'the plate generator is absurdly good', starCount: 24, createdAt: iso(2) },
        { id: 'sb2', messageId: '2', channelId: '400000000000000012', authorId: 'u5', authorName: 'saltwind', content: 'finally a bot that shuts up', starCount: 18, createdAt: iso(5) },
      ],
      pagination,
    };
  }
  return { entries: [], items: [], pagination };
}

export function demoPayload(pathname: string): unknown {
  if (pathname === '/api/auth/me') return DEMO_USER;
  if (pathname === '/api/stats') return DEMO_STATS;
  if (pathname === '/api/overview') return { guilds: DEMO_GUILDS.length, users: DEMO_STATS.totalUsers, uptime: DEMO_STATS.uptime };

  const guildMatch = pathname.match(/^\/api\/guilds\/([^/]+)(\/.*)?$/);
  if (pathname === '/api/guilds') return { guilds: DEMO_GUILDS };
  if (guildMatch) {
    const id = guildMatch[1];
    const rest = guildMatch[2] ?? '';
    const guild = DEMO_GUILDS.find((g) => g.id === id) ?? DEMO_GUILDS[0];
    if (!rest) return { guild: { ...DEMO_GUILD_CONFIG, guildId: guild.id, onboardingDone: true } };
    if (rest === '/onboarding-data') {
      return {
        guildSettings: { onboardingDone: true, modRoleIds: ['500000000000000001'] },
        logSettings: { logChannelId: DEMO_GUILD_CONFIG.logs.logChannelId },
        welcomeSettings: {
          enabled: DEMO_GUILD_CONFIG.welcome.enabled,
          welcomeChannelId: DEMO_GUILD_CONFIG.welcome.welcomeChannelId,
          welcomeMessage: DEMO_GUILD_CONFIG.welcome.welcomeMessage,
        },
        economySettings: {
          enabled: DEMO_GUILD_CONFIG.economy.enabled,
          currencyName: DEMO_GUILD_CONFIG.economy.currencyName,
          currencySymbol: DEMO_GUILD_CONFIG.economy.currencySymbol,
        },
        ticketSettings: {
          enabled: DEMO_GUILD_CONFIG.tickets.enabled,
          logChannelId: DEMO_GUILD_CONFIG.tickets.ticketChannelId,
          panelMessage: 'click the button below to open a support ticket.',
        },
        channels: [
          { id: '400000000000000010', name: 'mod-log' },
          { id: '400000000000000011', name: 'bot-log' },
          { id: '400000000000000012', name: 'general' },
          { id: '400000000000000013', name: 'welcome' },
        ],
        roles: [
          { id: '500000000000000001', name: 'moderator' },
          { id: '500000000000000004', name: 'verified' },
        ],
      };
    }
    if (rest === '/my-permissions') return { permissions: { management: true, moderation: true, admin: true, owner: false } };
    if (rest === '/logs') return { ...DEMO_GUILD_CONFIG.logs, enabledEvents: ['MESSAGE_DELETE', 'MEMBER_JOIN'] };
    if (rest === '/protection') return { settings: DEMO_GUILD_CONFIG.protection };
    if (rest === '/economy') return { settings: DEMO_GUILD_CONFIG.economy };
    if (rest === '/welcome') return { settings: DEMO_GUILD_CONFIG.welcome };
    if (rest === '/levels') return { settings: DEMO_GUILD_CONFIG.levels, roleRewards: [] };
    if (rest === '/tickets/settings') return { settings: DEMO_GUILD_CONFIG.tickets };
    if (rest === '/automod') {
      return {
        enabled: true,
        raidProtection: true,
        spamProtection: true,
        bannedWords: true,
        bannedWordsList: ['free nitro', 'crypto'],
        forbiddenPingRoles: [],
        forbiddenMarkdownList: [],
        maxMentions: 5,
        maxCapsPercent: 70,
        maxEmojis: 10,
        antiInvite: true,
        antiLink: false,
      };
    }
    if (rest === '/automod/history') return { entries: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    if (rest === '/music/queue') {
      return {
        tracks: [
          { title: 'slow harbour', url: '', duration: 214, thumbnail: '', author: 'lowtide', source: 'OTHER' },
          { title: 'paper boats', url: '', duration: 187, thumbnail: '', author: 'papercrane', source: 'OTHER' },
        ],
        currentTrack: { title: 'night ferry', url: '', duration: 241, thumbnail: '', author: 'harbourmaster', source: 'OTHER' },
        playing: true,
      };
    }
    if (rest === '/backup') return { backups: [] };
    if (rest === '/forms') return { templates: [], settings: { enabled: false } };
    const userMatch = rest.match(/^\/resolve-user\/(.+)$/);
    if (userMatch) return { userId: userMatch[1], username: 'member-' + userMatch[1].slice(-2), displayName: null, avatar: null };
    if (rest === '/tickets/categories') return { categories: [{ id: 'cat1', name: 'support', emoji: '🎫', description: null, position: 0 }] };
    if (rest === '/channels') {
      return {
        channels: [
          { id: '400000000000000010', name: 'mod-log', type: 0 },
          { id: '400000000000000011', name: 'bot-log', type: 0 },
          { id: '400000000000000012', name: 'general', type: 0 },
          { id: '400000000000000013', name: 'welcome', type: 0 },
        ],
      };
    }
    return guildCollection(pathname.split('?')[0]);
  }

  if (pathname === '/api/changelogs') {
    return { entries: DEMO_CHANGELOGS, pagination: { page: 1, limit: 5, total: DEMO_CHANGELOGS.length, totalPages: 1, hasMore: false } };
  }
  if (pathname === '/api/overview/leaderboard/global') return { entries: DEMO_LEADERBOARD };
  if (pathname === '/api/donors') return { donors: DEMO_DONORS };
  if (pathname === '/api/deployments') return { deployments: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasMore: false } };
  if (pathname === '/api/system/metrics') {
    return { cpu: DEMO_STATS.cpuUsage, ram: DEMO_STATS.ramUsage, uptime: DEMO_STATS.uptime, guilds: DEMO_STATS.totalGuilds, users: DEMO_STATS.totalUsers };
  }
  if (pathname === '/api/system/services') {
    return {
      services: [
        { name: 'bot', displayName: 'discord bot', status: 'RUNNING', uptime: DEMO_STATS.uptime, memory: 412, cpu: 3 },
        { name: 'api', displayName: 'api', status: 'RUNNING', uptime: DEMO_STATS.uptime, memory: 180, cpu: 1 },
        { name: 'web', displayName: 'web', status: 'RUNNING', uptime: DEMO_STATS.uptime, memory: 120, cpu: 1 },
      ],
    };
  }
  if (pathname === '/api/owner/users') {
    return {
      users: DEMO_GUILDS.map((g, i) => ({
        id: `ou${i}`,
        discordId: g.ownerId,
        username: g.name,
        discriminator: '0',
        avatar: null,
        globalName: g.name,
        blacklisted: false,
        createdAt: iso(30 + i),
      })),
      pagination: { page: 1, limit: 20, total: DEMO_GUILDS.length, totalPages: 1 },
    };
  }
  if (pathname === '/api/owner/servers') {
    return {
      servers: DEMO_GUILDS.map((g) => ({ id: g.id, name: g.name, memberCount: g.memberCount, premium: g.premium, createdAt: iso(60) })),
      pagination: { page: 1, limit: 20, total: DEMO_GUILDS.length, totalPages: 1 },
    };
  }
  if (pathname.startsWith('/api/')) return { ...guildCollection(pathname), success: true, data: null };
  return { success: true, data: null };
}
