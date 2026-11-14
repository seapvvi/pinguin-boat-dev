import { describe, it, expect, vi } from "vitest";
import { createLoggerWithFallback } from "./logger";

/**
 * The rolling-file transport is optional: `pino` resolves the `pino-roll`
 * target relative to the file that creates the logger, so a workspace layout
 * where the package is not reachable from the compiled output (pnpm, a
 * bundled dist) makes the transport unavailable. That must never take the
 * service down, so the logger falls back to stdout-only.
 */
describe("createLoggerWithFallback", () => {
  it("returns the transport logger when it can be created", () => {
    const transport = { id: "transport" } as never;
    const stdout = { id: "stdout" } as never;
    const fallback = vi.fn(() => stdout);

    const result = createLoggerWithFallback(() => transport, fallback);

    expect(result).toBe(transport);
    expect(fallback).not.toHaveBeenCalled();
  });

  it("falls back to stdout when the transport cannot be created", () => {
    const stdout = { id: "stdout" } as never;
    const fallback = vi.fn(() => stdout);

    const result = createLoggerWithFallback(() => {
      throw new Error('unable to determine transport target for "pino-roll"');
    }, fallback);

    expect(result).toBe(stdout);
    expect(fallback).toHaveBeenCalledTimes(1);
  });

  it("never propagates the transport error", () => {
    const fallback = vi.fn(() => ({ id: "stdout" }) as never);

    expect(() =>
      createLoggerWithFallback(() => {
        throw new Error("boom");
      }, fallback),
    ).not.toThrow();
  });
});
