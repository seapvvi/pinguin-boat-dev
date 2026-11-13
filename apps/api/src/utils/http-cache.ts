import { createHash } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";

/**
 * Server-side read cache helpers (A12).
 *
 * The web client already keeps an ETag cache (`apps/web/lib/api.ts`), but it can
 * only reuse a response the API marked as cacheable. `cachedJson` computes a
 * strong validator from the payload, answers `304 Not Modified` when the client
 * sends it back, and emits a `Cache-Control` directive scoped to the data:
 * `private` for anything behind a session, `public` only for anonymous reads.
 */

const WEAK_ETAG = /^W\//;

export interface CachePolicy {
  /** `private` keeps shared caches (CDN, proxies) from storing user data. */
  scope?: "private" | "public";
  /** `max-age` in seconds. Omit to send `no-store`. */
  maxAgeSeconds?: number;
  /** Extra directives appended verbatim, e.g. `stale-while-revalidate=30`. */
  extensions?: string[];
}

export function computeEtag(payload: unknown): string {
  const json = JSON.stringify(payload) ?? "null";
  return `"${createHash("sha256").update(json).digest("base64url").slice(0, 27)}"`;
}

export function cacheControlHeader(policy: CachePolicy = {}): string {
  const scope = policy.scope ?? "private";
  const parts = [`${scope}, max-age=${Math.max(0, policy.maxAgeSeconds ?? 0)}`];

  if (policy.maxAgeSeconds === undefined) {
    parts[0] = `${scope}, no-store`;
  }
  if (policy.extensions?.length) parts.push(...policy.extensions);

  return parts.join(", ");
}

/** True when the client already holds the current representation. */
export function isFresh(
  request: FastifyRequest,
  etag: string,
): boolean {
  const header = request.headers["if-none-match"];
  const sent: string | undefined = Array.isArray(header) ? header[0] : header;
  if (!sent) return false;

  return sent
    .split(",")
    .map((candidate: string) => candidate.trim().replace(WEAK_ETAG, ""))
    .some((candidate: string) => candidate === etag || candidate === "*");
}

/**
 * Send `payload` as JSON with a validator. Returns `true` when a `304` was sent
 * instead of the body, so callers can stop.
 */
export function cachedJson(
  request: FastifyRequest,
  reply: FastifyReply,
  payload: unknown,
  policy: CachePolicy = {},
): boolean {
  const etag = computeEtag(payload);

  reply.header("ETag", etag);
  reply.header("Cache-Control", cacheControlHeader(policy));

  if (isFresh(request, etag)) {
    reply.code(304).send();
    return true;
  }

  reply.send(payload);
  return false;
}