import { spawn, type ChildProcess } from "node:child_process";
import { randomBytes, randomInt } from "node:crypto";
import { mkdtempSync, existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const apiRoot = path.resolve(__dirname, "../..");
const entry = path.join(apiRoot, "dist", "apps", "api", "src", "index.js");
const built = existsSync(entry);
const port = 4700 + Math.floor(Math.random() * 200);
const NL = String.fromCharCode(10);
// Only the failing keys, so a timeout says what is still missing.
const describeOut = (o: string) =>
  o
    .split(NL)
    .filter((line) => line.includes("- ") || line.includes("ncompl"))
    .slice(-4)
    .join(" | ");

// Written only in the second half of the test, as /setup would write it.
const envLines = [
  "DISCORD_CLIENT_ID=" + randomInt(10 ** 11, 10 ** 12),
  "DISCORD_CLIENT_SECRET=" + randomBytes(8).toString("hex"),
  "DISCORD_TOKEN=" + randomBytes(8).toString("hex"),
  "DISCORD_OWNER_ID=" + randomInt(10 ** 11, 10 ** 12),
  "DISCORD_PUBLIC_KEY=" + randomBytes(8).toString("hex"),
  "NEXT_PUBLIC_DISCORD_CLIENT_ID=" + randomInt(10 ** 11, 10 ** 12),
  "DATABASE_URL=postgresql://u:p@127.0.0.1:1/db",
  "SESSION_SECRET=" + randomBytes(16).toString("hex"),
  "API_URL=http://localhost:4000",
  "BOT_INTERNAL_SECRET=" + randomBytes(16).toString("hex"),
  "NEXT_PUBLIC_API_URL=http://localhost:4000",
  "NEXT_PUBLIC_APP_URL=http://localhost:3000",
  "NEXT_PUBLIC_SITE_URL=http://localhost:3000",
  "OWNER_PASSWORD=" + randomBytes(16).toString("hex"),
];

let child: ChildProcess | undefined;

afterEach(() => {
  child?.kill();
  child = undefined;
});

function status(): Promise<number> {
  return fetch(`http://127.0.0.1:${port}/api/health`)
    .then((res) => res.status)
    .catch(() => 0);
}

async function waitFor(
  check: () => Promise<boolean>,
  timeoutMs = 20_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await check()) return;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error("timed out");
}

// Needs `pnpm --filter @pinguin/api build`; skipped on an unbuilt tree.
describe.skipIf(!built)("api first boot without a configured .env", () => {
  it("answers 503, then starts once /setup writes the .env", async () => {
    // The API finds its .env by walking up from the cwd, so run it from an empty dir.
    const root = mkdtempSync(path.join(tmpdir(), "pinguin-boot-"));
    child = spawn(process.execPath, [entry], {
      cwd: root,
      // An empty environment: the child must rely only on the .env it finds.
      env: {
        NODE_ENV: "development",
        API_PORT: String(port),
        PATH: process.env.PATH ?? "",
        SystemRoot: process.env.SystemRoot ?? "",
      },
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });

    let out = "";
    child.stdout?.on("data", (d: Buffer) => (out += d.toString()));
    child.stderr?.on("data", (d: Buffer) => (out += d.toString()));

    await waitFor(async () => (await status()) === 503).catch(() => {
      throw new Error(
        `never answered 503 (exit=${child?.exitCode}): ${out.slice(-1200)}`,
      );
    });
    expect(child.exitCode).toBeNull();

    const envText = `${envLines.join(NL)}${NL}`;
    writeFileSync(path.join(root, ".env"), envText);
    // Past validation the real server takes over and the stub closes.
    await waitFor(async () => (await status()) !== 503).catch(() => {
      throw new Error(
        `still 503/0 after .env (exit=${child?.exitCode}): ${describeOut(out)}`,
      );
    });
    expect(child.exitCode).toBeNull();
  }, 45_000);
});
