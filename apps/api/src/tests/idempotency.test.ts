import { describe, it, expect, vi, beforeEach } from "vitest";

const records = new Map<
  string,
  {
    id: string;
    userId: string;
    fingerprint: string;
    status: number | null;
    response: unknown;
  }
>();

vi.mock("@pinguin/db", () => ({
  prisma: {
    idempotencyRecord: {
      create: vi.fn(async ({ data }: { data: { id: string } }) => {
        if (records.has(data.id)) throw new Error("Unique constraint failed");
        records.set(data.id, {
          status: null,
          response: null,
          ...data,
        } as never);
        return data;
      }),
      findUnique: vi.fn(
        async ({ where }: { where: { id: string } }) =>
          records.get(where.id) ?? null,
      ),
      update: vi.fn(
        async ({ where, data }: { where: { id: string }; data: object }) => {
          const row = records.get(where.id);
          if (row) records.set(where.id, { ...row, ...data });
          return row;
        },
      ),
      delete: vi.fn(async ({ where }: { where: { id: string } }) =>
        records.delete(where.id),
      ),
    },
  },
}));

import { idempotency, idempotent } from "../middleware/idempotency";

function makeReply() {
  return {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    header(name: string, value: string) {
      this.headers[name] = value;
      return this;
    },
    send(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
}

const request = (key?: string) =>
  ({
    headers: key ? { "idempotency-key": key } : {},
    method: "POST",
    url: "/api/owner/restart",
    user: { id: "u1" },
  }) as never;

beforeEach(() => records.clear());

describe("idempotency", () => {
  it("lets the first request through and replays the stored response for a retry", async () => {
    const handler = idempotent(async () => ({
      success: true,
      data: { ran: true },
    }));
    const first = makeReply();
    await idempotency()(request("key-12345678"), first as never);
    expect(first.body).toBeUndefined();
    await handler(request("key-12345678"), first as never);

    const replay = makeReply();
    await idempotency()(request("key-12345678"), replay as never);
    expect(replay.statusCode).toBe(200);
    expect(replay.headers["idempotent-replayed"]).toBe("true");
    expect(replay.body).toEqual({ success: true, data: { ran: true } });
  });

  it("rejects a reused key with a different request and a concurrent duplicate", async () => {
    await idempotency()(request("key-abcdefgh"), makeReply() as never);

    const other = makeReply();
    await idempotency()(
      {
        ...(request("key-abcdefgh") as object),
        url: "/api/owner/backup",
      } as never,
      other as never,
    );
    expect(other.statusCode).toBe(422);

    const concurrent = makeReply();
    await idempotency()(request("key-abcdefgh"), concurrent as never);
    expect(concurrent.statusCode).toBe(409);
  });

  it("releases the key when the handler fails, and rejects malformed keys", async () => {
    const failing = idempotent(async (_req, reply) => {
      (reply as unknown as { statusCode: number }).statusCode = 500;
      return { success: false };
    });
    await idempotency()(request("key-failing1"), makeReply() as never);
    await failing(request("key-failing1"), makeReply() as never);

    const retry = makeReply();
    await idempotency()(request("key-failing1"), retry as never);
    expect(retry.statusCode).toBe(200);

    const bad = makeReply();
    await idempotency()(request("short"), bad as never);
    expect(bad.statusCode).toBe(400);
  });
});
