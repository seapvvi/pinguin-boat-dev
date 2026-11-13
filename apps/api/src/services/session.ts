import { createHash, randomUUID } from "crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@pinguin/db";
import { getConfig } from "@pinguin/config";
import { invalidateSessionCache } from "../middleware/auth";
import {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "../utils/session-cookie";

/**
 * Replace the current session token while keeping the same session row.
 *
 * Called when a privilege changes (owner password verified, 2FA enabled or
 * disabled) so a token captured before the change cannot be replayed with the
 * new privileges. The old cookie is overwritten with the new token.
 */
export async function rotateSession(
  request: FastifyRequest,
  reply: FastifyReply,
  data: {
    ownerVerifiedAt?: Date | null;
    owner2faVerifiedAt?: Date | null;
  } = {},
): Promise<void> {
  if (!request.user) return;

  const sessionToken = randomUUID();
  const hashedToken = createHash("sha256").update(sessionToken).digest("hex");

  await prisma.session.update({
    where: { id: request.user.sessionId },
    data: { token: hashedToken, ...data },
  });

  // The cache is keyed by token hash; the old token no longer exists, so any
  // cached entry derived from it must go.
  invalidateSessionCache();

  reply.setCookie(
    SESSION_COOKIE_NAME,
    sessionToken,
    sessionCookieOptions(getConfig().SESSION_MAX_AGE),
  );
}

/** Revoke every session for a user except the current one. */
export async function revokeOtherSessions(
  userId: string,
  keepSessionId: string,
): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: { userId, NOT: { id: keepSessionId } },
  });
  invalidateSessionCache();
  return result.count;
}
