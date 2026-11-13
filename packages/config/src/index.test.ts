import {
  copyFileSync,
  mkdtempSync,
  mkdirSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const source = fileURLToPath(new URL("./index.ts", import.meta.url));
const projectRoot = fileURLToPath(new URL("../../../", import.meta.url));

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

function loadAt(moduleFile: string, cwd: string) {
  const savedCwd = process.cwd();
  const keys = ["PASTEBIN_API_KEY", "YOUTUBE_API_KEY"];
  for (const key of keys) delete process.env[key];
  process.chdir(cwd);
  try {
    return createRequire(moduleFile)(moduleFile);
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
});
