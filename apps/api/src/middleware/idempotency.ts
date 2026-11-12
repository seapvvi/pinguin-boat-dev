import { createHash } from "crypto";
import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@pinguin/db";

const HEADER = "idempotency-key";
const KEY_PATTERN = /^[A-Za-z0-9._:-]{8,200}$/;
const REPLAY_WINDOW_MS = 24 * 60 * 60 * 1000;

function keyOf(request: FastifyRequest): string | null {
  const raw = request.headers[HEADER];
  const key = Array.isArray(raw) ? raw[0] : raw;
  return key && request.user && KEY_PATTERN.test(key) ? key : null;
}

function recordId(request: FastifyRequest, key: string): string {
  return createHash("sha256")
    .update(`${request.user!.id}:${key}`)
    .digest("hex");
}

/**
 * Claim-then-store dedupe for requests sent with an `Idempotency-Key` header.
 *
 * A row with a null status claims the key first: a concurrent duplicate gets
 * 409, a replay gets the stored response, and `idempotent()` deletes the row on
 * failure so the client can retry. Postgres rather than a process-local map
 * because the API may run several instances and the action must still run once.
 *
 * Fail-open when the table is missing (migration not applied): dedupe is a
 * convenience for retries, never a gate that blocks an owner action.
 */
export function idempotency() {
  return async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const key = keyOf(request);
    if (!key) {
      const raw = request.headers[HEADER];
      if (raw) {
        reply
          .status(400)
          .send({ success: false, error: "Idempotency-Key invalide" });
      }
      return;
    }

    const id = recordId(request, key);
    const fingerprint = `${request.method} ${request.url}`;

    try {
      await prisma.idempotencyRecord.create({
        data: {
          id,
          userId: request.user!.id,
          fingerprint,
          status: null,
          expiresAt: new Date(Date.now() + REPLAY_WINDOW_MS),
        },
      });
    } catch {
      const claimed = await prisma.idempotencyRecord
        .findUnique({ where: { id } })
        .catch(() => null);
      if (!claimed) return;
      if (claimed.fingerprint !== fingerprint) {
        reply
          .status(422)
          .send({
            success: false,
            error: "Idempotency-Key réutilisée avec une autre requête",
          });
        return;
      }
      if (claimed.status === null) {
        reply
          .status(409)
          .send({
            success: false,
            error: "Requête identique en cours de traitement",
          });
        return;
      }
      reply
        .header("idempotent-replayed", "true")
        .status(claimed.status)
        .send(claimed.response ?? undefined);
    }
  };
}

/**
 * Wraps a route handler so its return value is stored against the claimed key.
 * Routes may still send through `reply` directly; only returned payloads are
 * replayed, which is what the dangerous owner/deploy routes do.
 */
export function idempotent<Req extends FastifyRequest = FastifyRequest>(
  handler: (request: Req, reply: FastifyReply) => Promise<unknown> | unknown,
) {
  return async (request: Req, reply: FastifyReply): Promise<unknown> => {
    const key = keyOf(request);
    const result = await handler(request, reply);
    if (!key || result === undefined) return result;

    const id = recordId(request, key);
    if (reply.statusCode >= 200 && reply.statusCode < 300) {
      await prisma.idempotencyRecord
        .update({
          where: { id },
          data: { status: reply.statusCode, response: result as object },
        })
        .catch(() => undefined);
    } else {
      await prisma.idempotencyRecord
        .delete({ where: { id } })
        .catch(() => undefined);
    }
    return result;
  };
}
