import { z } from "zod";

// Body schemas for routes that used to cast `request.body` to a loose record.
// Unknown keys are now stripped by `validate()`; scalar coercions keep the
// existing client payloads (strings from HTML inputs) working.

const id = z.string().min(1).max(64);
const nullableId = z.string().max(64).nullable().optional();
const dateInput = z
  .union([z.string().max(64), z.date()])
  .optional()
  .nullable();

export const musicControlSchema = z.object({
  action: z.enum([
    "play",
    "pause",
    "resume",
    "skip",
    "stop",
    "volume",
    "loop",
    "shuffle",
  ]),
  value: z.union([z.string().max(2048), z.number()]).optional(),
});

export const pollCreateSchema = z.object({
  question: z.string().trim().min(1).max(256),
  options: z.array(z.string().trim().min(1).max(256)).min(2).max(25),
  channelId: id,
  // Dashboard sends minutes.
  duration: z.coerce
    .number()
    .int()
    .min(1)
    .max(60 * 24 * 30)
    .optional(),
  anonymous: z.boolean().optional(),
  multiChoice: z.boolean().optional(),
  endsAt: dateInput,
});

export const pollUpdateSchema = z.object({
  status: z.enum(["OPEN", "CLOSED"]).optional(),
});

export const giveawayCreateSchema = z.object({
  prize: z.string().trim().min(1).max(256),
  duration: z.coerce
    .number()
    .int()
    .min(1)
    .max(60 * 60 * 24 * 90),
  channelId: id,
  winners: z.coerce.number().int().min(1).max(100).optional(),
  requirements: z
    .object({ requiredRoleId: z.string().max(64).optional() })
    .passthrough()
    .optional(),
});

export const giveawayUpdateSchema = z.object({
  status: z.enum(["ENDED", "CANCELLED"]).optional(),
  // Reroll redraws winners; only a true value is meaningful.
  reroll: z.literal(true).optional(),
  prize: z.string().trim().min(1).max(256).optional(),
  winnerCount: z.coerce.number().int().min(1).max(100).optional(),
});

export const suggestionSendSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  channelId: id,
});

export const suggestionUpdateSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "IMPLEMENTED"]).optional(),
  staffResponse: z.string().max(2000).optional(),
});

export const suggestionRespondSchema = z.object({
  action: z.enum(["APPROVED", "REJECTED"]),
  response: z.string().trim().min(1).max(2000),
});

export const suggestionVoteSchema = z.object({
  vote: z.enum(["up", "down"]),
});

export const automodUpdateSchema = z.object({
  enabled: z.boolean().optional(),
  antiSpam: z.boolean().optional(),
  antiLink: z.boolean().optional(),
  antiInvite: z.boolean().optional(),
  antiCaps: z.boolean().optional(),
  antiMassMention: z.boolean().optional(),
  spamThreshold: z.coerce.number().int().min(1).max(100).optional(),
  mentionThreshold: z.coerce.number().int().min(1).max(100).optional(),
  capsThreshold: z.coerce.number().int().min(1).max(100).optional(),
  action: z.string().max(32).optional(),
  timeoutDuration: z.coerce.number().int().min(0).max(86400).optional(),
  bannedWordsList: z.array(z.string().max(100)).max(500).optional(),
  forbiddenPingRoles: z.array(z.string()).max(250).optional(),
  forbiddenMarkdownList: z.array(z.string().max(100)).max(100).optional(),
  whitelistRoles: z.array(z.string()).max(250).optional(),
  whitelistChannels: z.array(z.string()).max(250).optional(),
});

export const formsUpdateSchema = z.object({
  enabled: z.boolean().optional(),
  channelId: nullableId,
  logChannel: nullableId,
});

const formFieldSchema = z.object({
  id: z.string().max(64).optional(),
  label: z.string().max(256),
  type: z.string().max(32),
  required: z.boolean().optional(),
  placeholder: z.string().max(256).optional(),
  options: z.array(z.string().max(100)).max(25).optional(),
});

export const formTemplateCreateSchema = z.object({
  name: z.string().trim().min(1).max(128),
  description: z.string().max(1024).nullable().optional(),
  fields: z.array(formFieldSchema).max(50).optional(),
  enabled: z.boolean().optional(),
});

export const formTemplateUpdateSchema = formTemplateCreateSchema.partial();

export const formSubmissionUpdateSchema = z
  .object({
    status: z.enum(["pending", "approved", "rejected"]).optional(),
    reviewedBy: z.string().max(64).nullable().optional(),
  })
  // The review timestamp is derived, never taken from the client.
  .transform(({ status, reviewedBy }) => ({ status, reviewedBy }));

export const starboardUpdateSchema = z.object({
  enabled: z.boolean().optional(),
  channelId: nullableId,
  starEmoji: z.string().min(1).max(16).optional(),
  minStars: z.coerce.number().int().min(1).max(100).optional(),
  selfStar: z.boolean().optional(),
});

export const minigamesUpdateSchema = z.object({
  gamesChannelId: nullableId,
  enabled: z.boolean().optional(),
  betMin: z.coerce.number().int().min(0).optional(),
  betMax: z.coerce.number().int().min(0).optional(),
  blackjackReward: z.coerce.number().int().min(0).optional(),
  rpsReward: z.coerce.number().int().min(0).optional(),
  morpionReward: z.coerce.number().int().min(0).optional(),
  guessReward: z.coerce.number().int().min(0).optional(),
  guessRange: z.coerce.number().int().min(1).optional(),
});
