import {
  copyFileSync,
  mkdtempSync,
  mkdirSync,
  symlinkSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const source = fileURLToPath(new URL("./index.ts", import.meta.url));
const projectRoot = fileURLToPath(new URL("../../../", import.meta.url));
const NEWLINE = String.fromCharCode(10);

// The loader reads module-scope paths once, so each case loads its own copy of
// the module from a temp tree that mimics a real install layout.
function copyModuleTo(dir: string): string {
  mkdirSync(dir, { recursive: true });
  const target = path.join(dir, "index.ts");
  copyFileSync(source, target);
  // The copy lives outside the repo; give it the deps pnpm keeps unhoisted.
  const modules = path.join(dir, "node_modules");
  mkdirSync(modules, { recursive: true });
  for (const dep of ["zod", "dotenv"]) {
    symlinkSync(
      path.join(projectRoot, "packages", "config", "node_modules", dep),
      path.join(modules, dep),
      "junction",
    );
  }
  return target;
}

const MANAGED_KEYS = [
  "PASTEBIN_API_KEY",
  "YOUTUBE_API_KEY",
  "DISCORD_CLIENT_ID",
  "DISCORD_CLIENT_SECRET",
  "DISCORD_TOKEN",
  "DISCORD_OWNER_ID",
  "DISCORD_PUBLIC_KEY",
  "NEXT_PUBLIC_DISCORD_CLIENT_ID",
  "OWNER_PASSWORD",
];

function loadAt(moduleFile: string, cwd: string, afterLoad?: () => void) {
  const savedCwd = process.cwd();
  for (const key of MANAGED_KEYS) delete process.env[key];
  process.chdir(cwd);
  try {
    const loaded = createRequire(moduleFile)(moduleFile) as {
      getConfig: () => { DISCORD_TOKEN: string };
    };
    afterLoad?.();
    return loaded;
  } finally {
    process.chdir(savedCwd);
  }
}

describe("config env file lookup", () => {
  afterEach(() => {
    delete process.env.PASTEBIN_API_KEY;
    delete process.env.YOUTUBE_API_KEY;
  });

  it("loads the root .env when run from the compiled dist layout", () => {
    const root = mkdtempSync(path.join(tmpdir(), "pinguin-cfg-"));
    writeFileSync(path.join(root, ".env"), "PASTEBIN_API_KEY=from-root-env\n");
    // Mirrors apps/api/dist/packages/config/src/index.js: four levels below the root.
    const distDir = path.join(
      root,
      "apps",
      "api",
      "dist",
      "packages",
      "config",
      "src",
    );
    const moduleFile = copyModuleTo(distDir);

    loadAt(moduleFile, distDir);

    expect(process.env.PASTEBIN_API_KEY).toBe("from-root-env");
  });

  it("finds the .env in a parent of a nested app cwd", () => {
    const root = mkdtempSync(path.join(tmpdir(), "pinguin-cfg-"));
    writeFileSync(path.join(root, ".env"), "YOUTUBE_API_KEY=from-root-env\n");
    const appCwd = path.join(root, "apps", "bot");
    mkdirSync(appCwd, { recursive: true });
    const moduleFile = copyModuleTo(
      path.join(root, "packages", "config", "src"),
    );

    loadAt(moduleFile, appCwd);

    expect(process.env.YOUTUBE_API_KEY).toBe("from-root-env");
  });

  it("re-reads the .env when it changed after the process started", () => {
    const root = mkdtempSync(path.join(tmpdir(), "pinguin-cfg-"));
    const envPath = path.join(root, ".env");
    // The bot's required keys, plus an empty token the later write fills in.
    const stubEnv = [
      "DISCORD_CLIENT_ID=123456789012345678",
      "DISCORD_CLIENT_SECRET=client-secret",
      "DISCORD_TOKEN=",
      "DISCORD_OWNER_ID=123456789012345678",
      "DISCORD_PUBLIC_KEY=" + "0".repeat(64),
      "NEXT_PUBLIC_DISCORD_CLIENT_ID=123456789012345678",
      "OWNER_PASSWORD=" + "o".repeat(12),
      "DATABASE_URL=postgresql://user:pass@localhost:5432/pinguin",
      "SESSION_SECRET=" + "s".repeat(32),
      "API_URL=http://localhost:4000",
      "BOT_INTERNAL_SECRET=" + "b".repeat(32),
      "NEXT_PUBLIC_API_URL=http://localhost:4000",
      "NEXT_PUBLIC_APP_URL=http://localhost:3000",
      "NEXT_PUBLIC_SITE_URL=http://localhost:3000",
      "",
    ].join(NEWLINE);
    writeFileSync(envPath, stubEnv);
    const moduleFile = copyModuleTo(
      path.join(root, "packages", "config", "src"),
    );

    const configModule = loadAt(moduleFile, root, () => {
      // /setup writes the file after the process started, with a newer mtime.
      const later = new Date(Date.now() + 5000);
      writeFileSync(
        envPath,
        stubEnv.replace(
          "DISCORD_TOKEN=" + NEWLINE,
          "DISCORD_TOKEN=token-written-later" + NEWLINE,
        ),
      );
      utimesSync(envPath, later, later);
    });

    // The blank token read at startup would fail validation; the reload fixes it.
    expect(configModule.getConfig().DISCORD_TOKEN).toBe("token-written-later");
    expect(process.env.DISCORD_TOKEN).toBe("token-written-later");
  });
});
