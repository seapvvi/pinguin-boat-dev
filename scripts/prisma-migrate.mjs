#!/usr/bin/env node
/**
 * `prisma migrate dev` refuses to run without a TTY, so a migration started from
 * a turbo task or CI dies with "not supported in non-interactive environments".
 * `--skip-generate`/`--skip-seed` keep it from prompting for other reasons.
 *
 * Drift is not repaired here on purpose: `migrate dev --create-only` may want
 * to reset the database, and destroying data is never the default.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const prismaDir = path.join(repoRoot, "packages/db");

// Prisma only auto-loads packages/db/.env, but the project keeps a single .env
// at the repo root; packages/db/.env wins when both exist.
const envFile = [
  path.join(prismaDir, ".env"),
  path.join(repoRoot, ".env"),
].find(existsSync);
const schema = path.join(prismaDir, "prisma", "schema.prisma");
const [command = "dev", ...extra] = process.argv.slice(2);

// `resolve` and `deploy` take no prompt; `dev` gets the non-interactive flags.
const args =
  command === "dev"
    ? ["migrate", "dev", "--skip-generate", "--skip-seed", ...extra]
    : ["migrate", command, ...extra];

if (command === "status") args.push("--schema", schema);

if (!envFile) {
  console.error(
    "Aucun fichier .env trouve (racine ou packages/db). Copie .env.example en .env et renseigne DATABASE_URL.",
  );
  process.exit(1);
}

// Prisma has no --env-file flag here, so the file is loaded and handed to the
// child process: one source of truth for `.env` at the repo root.
// spawnSync rejects entries whose value is undefined, which some shells export.
const env = Object.fromEntries(
  Object.entries({ ...process.env, ...readEnvFile(envFile) }).filter(
    ([, v]) => typeof v === "string",
  ),
);
const result = spawnSync("npx", ["prisma", ...args], {
  cwd: prismaDir,
  env,
  shell: process.platform === "win32",
  stdio: "inherit",
});

// prisma migrate status exits 1 (pending) / 2 (drift): CLI-friendly in CI.
process.exit(result.status ?? 1);

/** Reads UTF-8 or UTF-16 (Notepad on Windows writes the latter) and strips the BOM. */
function readEnvText(file) {
  const buf = readFileSync(file);
  if (buf[0] === 0xff && buf[1] === 0xfe)
    return buf.subarray(2).toString("utf16le");
  const text = buf.toString("utf8");
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/** Minimal KEY=VALUE parser: quotes, comments and blank lines, nothing fancy. */
function readEnvFile(file) {
  const out = {};
  for (const raw of readEnvText(file).split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    const quoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));
    if (quoted) value = value.slice(1, -1);
    out[key] = value;
  }
  return out;
}
