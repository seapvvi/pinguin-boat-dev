import { describe, it, expect } from "vitest";
import type { FastifyReply, FastifyRequest } from "fastify";
import {
  cacheControlHeader,
  cachedJson,
  computeEtag,
  isFresh,
} from "../utils/http-cache";

function fakeRequest(headers: Record<string, string> = {}) {
  return { headers } as unknown as FastifyRequest;
}

function fakeReply() {
  const headers = new Map<string, unknown>();
  const reply = {
    statusCode: 200,
    sentBody: undefined as unknown,
    header(name: string, value: unknown) {
      headers.set(name.toLowerCase(), value);
      return reply;
    },
    code(status: number) {
      reply.statusCode = status;
      return reply;
    },
    send(body?: unknown) {
      reply.sentBody = body;
      return reply;
    },
    get(name: string) {
      return headers.get(name.toLowerCase());
    },
  };
  return reply as unknown as FastifyReply & {
    statusCode: number;
    sentBody: unknown;
    get(name: string): unknown;
  };
}

describe("computeEtag", () => {
  it("is stable for equal payloads regardless of key order in arrays", () => {
    expect(computeEtag({ a: 1, b: [1, 2] })).toBe(computeEtag({ a: 1, b: [1, 2] }));
  });

  it("changes when a value changes", () => {
    expect(computeEtag({ count: 1 })).not.toBe(computeEtag({ count: 2 }));
  });

  it("produces a quoted strong validator", () => {
    const etag = computeEtag({ ok: true });
    expect(etag.startsWith('"')).toBe(true);
    expect(etag.endsWith('"')).toBe(true);
    expect(etag).not.toContain("W/");
  });
});

describe("cacheControlHeader", () => {
  it("marks user data private and never public", () => {
    expect(cacheControlHeader({ maxAgeSeconds: 30 })).toBe("private, max-age=30");
  });

  it("falls back to no-store without a max-age", () => {
    expect(cacheControlHeader()).toBe("private, no-store");
  });

  it("appends extensions", () => {
    expect(
      cacheControlHeader({ scope: "public", maxAgeSeconds: 60, extensions: ["stale-while-revalidate=300"] }),
    ).toBe("public, max-age=60, stale-while-revalidate=300");
  });
});

describe("isFresh", () => {
  it("matches a strong validator", () => {
    const request = fakeRequest({ "if-none-match": '"abc"' });
    expect(isFresh(request, '"abc"')).toBe(true);
  });

  it("tolerates a weak prefix from a proxy", () => {
    const request = fakeRequest({ "if-none-match": 'W/"abc"' });
    expect(isFresh(request, '"abc"')).toBe(true);
  });

  it("matches any validator for a cache-busting request", () => {
    const request = fakeRequest({ "if-none-match": "*" });
    expect(isFresh(request, '"abc"')).toBe(true);
  });

  it("rejects a different validator", () => {
    const request = fakeRequest({ "if-none-match": '"other"' });
    expect(isFresh(request, '"abc"')).toBe(false);
  });

  it("rejects a missing header", () => {
    expect(isFresh(fakeRequest(), '"abc"')).toBe(false);
  });
});

describe("cachedJson", () => {
  it("sends the payload with a validator and cache headers", () => {
    const reply = fakeReply();
    const replaced = cachedJson(fakeRequest(), reply, { ok: true }, { maxAgeSeconds: 30 });

    expect(replaced).toBe(false);
    expect(reply.statusCode).toBe(200);
    expect(reply.sentBody).toEqual({ ok: true });
    expect(reply.get("etag")).toBe(computeEtag({ ok: true }));
    expect(reply.get("cache-control")).toBe("private, max-age=30");
  });

  it("answers 304 without a body when the client is fresh", () => {
    const payload = { ok: true };
    const etag = computeEtag(payload);
    const reply = fakeReply();
    const replaced = cachedJson(
      fakeRequest({ "if-none-match": etag }),
      reply,
      payload,
      { maxAgeSeconds: 30 },
    );

    expect(replaced).toBe(true);
    expect(reply.statusCode).toBe(304);
    expect(reply.sentBody).toBeUndefined();
    expect(reply.get("cache-control")).toBe("private, max-age=30");
  });
});