import { describe, it, expect } from "vitest";
import { z } from "zod";
import { validate, validationError } from "../middleware/validate";
import {
  musicControlSchema,
  starboardUpdateSchema,
  minigamesUpdateSchema,
} from "../utils/route-schemas";

function run(
  schema: z.ZodTypeAny,
  body: unknown,
  target: "body" | "params" = "body",
) {
  const request = { body, params: body } as Record<string, unknown>;
  const reply = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    send(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return validate(schema, target)(request as never, reply as never).then(
    () => ({ request, reply }),
  );
}

describe("validate middleware", () => {
  it("strips unknown keys instead of persisting them", async () => {
    const { request, reply } = await run(
      z.object({ enabled: z.boolean().optional() }),
      { enabled: true, injectedColumn: "x" },
    );
    expect(reply.statusCode).toBe(200);
    expect(request.body).toEqual({ enabled: true });
  });

  it("answers 400 with the offending field for a bad body", async () => {
    const { reply } = await run(musicControlSchema, { action: "selfdestruct" });
    expect(reply.statusCode).toBe(400);
    expect((reply.body as { error: string }).error).toContain("action");
  });

  it("coerces the string payloads the dashboard form sends", async () => {
    const starboard = await run(starboardUpdateSchema, {
      minStars: "5",
      channelId: "",
    });
    expect(starboard.reply.statusCode).toBe(200);
    expect(starboard.request.body).toEqual({ minStars: 5, channelId: "" });

    const minigames = await run(minigamesUpdateSchema, {
      betMin: "10",
      enabled: false,
    });
    expect(minigames.request.body).toEqual({ betMin: 10, enabled: false });
  });

  it("names the failing param for a bad route param", async () => {
    const error = validationError(
      z.object({ guildId: z.string().min(1) }).safeParse({ guildId: "" })
        .error!,
    );
    expect(error.error).toBe(
      "guildId: String must contain at least 1 character(s)",
    );
  });
});
