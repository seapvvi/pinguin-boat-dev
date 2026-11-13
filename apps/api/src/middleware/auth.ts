import { FastifyReply, FastifyRequest } from "fastify";
import { createHash } from "crypto";
import { prisma } from "@pinguin/db";
import { getConfig } from "@pinguin/config";
import {
  get,
  set,
  del as invalidateKey,
  invalidateCache as invalidatePrefix,
} from "../utils/cache";
import { SESSION_COOKIE_NAME } from "../utils/session-cookie";

// Short TTLs: authentication is checked on every request, but a 20 s stale
// window keeps the cost at one query per window while still reacting quickly
// to logout, ban or password change (all of which invalidate the cache).
const SESSION_CACHE_SECONDS = 20;
const BLACKLIST_CACHE_SECONDS = 15;

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      id: string;
      discordId: string;
      username: string;
      avatar: string | null;
      email: string | null;
      locale: string;
      sessionId: string;
    };
  }
}

type CachedUser = NonNullable<FastifyRequest["user"]>;

function sessionCacheKey(hashedToken: string): string {
  return `auth:session:${hashedToken}`;
}

function blacklistCacheKey(discordId: string): string {
  return `auth:blacklist:${discordId}`;
}

/** Drop cached authentication derived from a token (logout, rotation, revoke). */
export function invalidateSessionCache(hashedToken?: string): void {
  if (hashedToken) {
    // `del` is re-exported through the cache module's named helpers below.
    invalidateKey(sessionCacheKey(hashedToken));
    return;
  }
  invalidatePrefix("auth:session:");
}

/** Drop the cached blacklist verdict for a user. */
export function invalidateBlacklistCache(discordId: string): void {
  invalidateKey(blacklistCacheKey(discordId));
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  let token: string | undefined;

  const cookieToken = request.cookies?.[SESSION_COOKIE_NAME];
  if (cookieToken) {
    token = cookieToken;
  }

  if (!token) {
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    reply.status(401).send({
      success: false,
      error: "Authentification requise",
    });
    return;
  }

  const hashedToken = createHash("sha256").update(token).digest("hex");

  let user = get<CachedUser>(sessionCacheKey(hashedToken));

  if (!user) {
    const session = await prisma.session.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    if (!session) {
      reply.status(401).send({
        success: false,
        error: "Session invalide",
      });
      return;
    }

    if (new Date() > session.expiresAt) {
      await prisma.session.delete({ where: { id: session.id } });
      reply.status(401).send({
        success: false,
        error: "Session expirée",
      });
      return;
    }

    user = {
      id: session.user.id,
      discordId: session.user.discordId,
      username: session.user.username,
      avatar: session.user.avatar,
      email: session.user.email,
      locale: session.user.locale,
      sessionId: session.id,
    };
    set(sessionCacheKey(hashedToken), user, SESSION_CACHE_SECONDS);
  }

  const blacklisted = await isBlacklisted(user.discordId);
  if (blacklisted) {
    reply.status(403).send({
      success: false,
      error: `Votre compte a été blacklisté. Vous pouvez contester en ouvrant un ticket: ${getConfig().DISCORD_SUPPORT_INVITE}`,
    });
    return;
  }

  request.user = user;
}

async function isBlacklisted(discordId: string): Promise<boolean> {
  const cached = get<boolean>(blacklistCacheKey(discordId));
  if (cached !== undefined) return cached;

  const entry = await prisma.blacklistUser.findUnique({
    where: { targetId: discordId },
    select: { id: true },
  });

  const blacklisted = entry !== null;
  set(blacklistCacheKey(discordId), blacklisted, BLACKLIST_CACHE_SECONDS);
  return blacklisted;
}
