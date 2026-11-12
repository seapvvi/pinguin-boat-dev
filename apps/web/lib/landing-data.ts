interface ModuleItem {
  name: string;
  desc: string;
  tag: string;
}

interface FeatureItem {
  glyph: string;
  title: string;
  desc: string;
}

export const MODULES: ModuleItem[] = [
  { name: 'moderation', desc: 'bans, mutes, timeouts, purge, with a case number and an actor.', tag: 'core' },
  { name: 'automod', desc: 'spam, invite, mention and word rules, built one condition at a time.', tag: 'core' },
  { name: 'protection', desc: 'anti-raid thresholds and automatic backups of the server settings.', tag: 'core' },
  { name: 'tickets', desc: 'categories, claim flow, transcripts, and a per-category staff role.', tag: 'utility' },
  { name: 'logs', desc: 'channel-scoped event logging, per event type, with an ignore list.', tag: 'utility' },
  { name: 'music', desc: 'queue, playlists, filters, and 24/7 playback in a voice channel.', tag: 'fun' },
  { name: 'notifications', desc: 'twitch and youtube stream alerts, on a poll interval you set.', tag: 'social' },
  { name: 'levels', desc: 'xp curve, role rewards at thresholds, and a rank card you can edit.', tag: 'fun' },
  { name: 'economy', desc: 'balance, daily claim, shop items and a transfer log.', tag: 'fun' },
  { name: 'giveaways', desc: 'timed draws, entry requirements, and automatic re-draws.', tag: 'fun' },
  { name: 'polls', desc: 'up to twenty options, single or multiple choice, with a close timer.', tag: 'utility' },
  { name: 'welcome', desc: 'join and leave messages, image cards, and autoroles on arrival.', tag: 'utility' },
  { name: 'suggestions', desc: 'a board channel with upvotes, downvotes, and a status label.', tag: 'utility' },
  { name: 'starboard', desc: 'messages that cross a reaction threshold get copied to a channel.', tag: 'fun' },
  { name: 'forms', desc: 'application forms with required fields, routed to a review channel.', tag: 'utility' },
  { name: 'clans', desc: 'player groups with a tag, a roster, and a leaderboard.', tag: 'fun' },
  { name: 'invites', desc: 'invite tracking, per-member counts, and a leaderboard.', tag: 'utility' },
  { name: 'embeds', desc: 'an embed builder with variables, saved per server.', tag: 'core' },
  { name: 'settings', desc: 'language, prefix, timezone, and module permissions per role.', tag: 'core' },
];

export const FEATURES: FeatureItem[] = [
  {
    glyph: '管',
    title: 'configuration lives in the web',
    desc: 'every setting is a field with a label. no command syntax to memorise, no config file to edit on the host.',
  },
  {
    glyph: '記',
    title: 'an audit trail, not a guess',
    desc: 'actions are written down with the moderator who took them. if something is reverted, the record says who and when.',
  },
  {
    glyph: '静',
    title: 'quiet by default',
    desc: 'the bot only speaks where it is told to. modules are off until you turn them on for a given server.',
  },
];