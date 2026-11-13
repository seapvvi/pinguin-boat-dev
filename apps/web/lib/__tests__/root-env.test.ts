import { mkdtempSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { rootEnvPath, applyRootEnv, patchNextConfig } =
  require("../root-env.js") as {
    rootEnvPath: (webRoot?: string) => string;
    applyRootEnv: (target: Record<string, string>, envPath?: string) => boolean;
    patchNextConfig: (
      config: Record<string, unknown>,
      envPath?: string,
    ) => { env: Record<string, string> } & Record<string, unknown>;
  };

function tempEnv(lines: string[]): string {
  const dir = mkdtempSync(path.join(tmpdir(), "pinguin-root-env-"));
  const file = path.join(dir, ".env");
  writeFileSync(file, `${lines.join("\n")}\n`);
  return file;
}

describe("root-env", () => {
  afterEach(() => {
    delete process.env.DISCORD_TOKEN;
  });

  it("resolves the root .env from apps/web", () => {
    expect(rootEnvPath("/srv/app/apps/web")).toBe(
      path.resolve("/srv/app/apps/web/../../.env"),
    );
  });

  it("fills missing keys and keeps local values", () => {
    const file = tempEnv([
      "A=from-root",
      'B="quoted value"',
      "C=",
      "# comment",
    ]);
    const target: Record<string, string> = { C: "local-wins" };

    applyRootEnv(target, file);

    expect(target).toEqual({
      A: "from-root",
      B: "quoted value",
      C: "local-wins",
    });
  });

  it("returns false when there is no root .env", () => {
    expect(
      applyRootEnv({}, path.join(tmpdir(), "missing-pinguin", ".env")),
    ).toBe(false);
  });

  it("exposes only public root values through the next config env block", () => {
    const file = tempEnv(["DISCORD_TOKEN=bot-token-from-root"]);

    const config = patchNextConfig({ env: { NODE_ENV: "production" } }, file);

    expect(config.env.NODE_ENV).toBe("production");
    expect(config.env.DISCORD_TOKEN).toBeUndefined();
    expect(Object.keys(config.env)).not.toContain("NEXT_RUNTIME");
  });
});
