#!/usr/bin/env node
/**
 * `prisma migrate dev` refuses to run without a TTY, so a migration started from
 * a turbo task or CI dies with "not supported in non-interactive environments".
 * `--skip-generate`/`--skip-seed` keep it from prompting for other reasons.
 *
 * Drift is not repaired here on purpose: `migrate dev --create-only` may want
 * to reset the database, and destroying data is never the default.
 *
 * `resolve --all` records every migration folder as already applied: that is the
 * baseline path for a database whose schema was created by
 * `prisma/baseline/migration.sql` (the incremental migrations assume tables the
 * first one only alters).
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
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
const migrationsDir = path.join(prismaDir, "prisma", "migrations");
const [command = "dev", ...extra] = process.argv.slice(2);

if (!envFile) {
  console.error(
    "Aucun fichier .env trouve (racine ou packages/db). Copie .env.example en .env et renseigne DATABASE_URL.",
  );
  process.exit(1);
}

// spawnSync rejects entries whose value is undefined, which some shells export.
const env = Object.fromEntries(
  Object.entries({ ...process.env, ...readEnvFile(envFile) }).filter(
    ([, v]) => typeof v === "string",
  ),
);

function prisma(args) {
  return spawnSync("npx", ["prisma", ...args], {
    cwd: prismaDir,
    env,
    shell: process.platform === "win32",
    stdio: "inherit",
  });
}

if (command === "resolve" && extra.includes("--all")) {
  const names = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
  let failed = 0;
  for (const name of names) {
    console.log(`› marked as applied: ${name}`);
    // Already-recorded migrations exit non-zero; that is the expected state on a
    // re-run, so the loop keeps going and only reports a real failure at the end.
    const res = prisma([
      "migrate",
      "resolve",
      "--applied",
      name,
      "--schema",
      schema,
    ]);
    if (res.status !== 0) failed += 1;
  }
  console.log(
    failed === 0
      ? "Toutes les migrations sont enregistrees."
      : `${failed} migration(s) n'ont pas pu etre enregistrees.`,
  );
  process.exit(failed === 0 ? 0 : 1);
}

// `resolve` and `deploy` take no prompt; `dev` gets the non-interactive flags.
const args =
  command === "dev"
    ? ["migrate", "dev", "--skip-generate", "--skip-seed", ...extra]
    : ["migrate", command, ...extra];

if (command === "status") args.push("--schema", schema);

// prisma migrate status exits 1 (pending) / 2 (drift): CLI-friendly in CI.
process.exit(prisma(args).status ?? 1);

/**
 * Reads UTF-8 or UTF-16 and strips the BOM. A .env touched by several editors can
 * mix both encodings, and a NUL byte makes spawnSync throw, so UTF-16LE runs are
 * decoded individually instead of being lost.
 */
function readEnvText(file) {
  const buf = readFileSync(file);
  if (buf[0] === 0xff && buf[1] === 0xfe)
    return buf.subarray(2).toString("utf16le");
  const text = buf.includes(0)
    ? repairMixedEncoding(buf)
    : buf.toString("utf8");
  return text.replace(/\u0000/g, "").replace(/^\uFEFF/, "");
}

function repairMixedEncoding(buf) {
  let out = "";
  let plainStart = 0;
  for (let i = 0; i < buf.length - 1; i += 1) {
    if (buf[i + 1] !== 0 || buf[i] < 0x20) continue;
    out += buf.subarray(plainStart, i).toString("utf8");
    let end = i;
    while (end + 1 < buf.length && buf[end + 1] === 0) end += 2;
    out += buf.subarray(i, end).toString("utf16le");
    plainStart = end;
    i = end - 1;
  }
  return out + buf.subarray(plainStart).toString("utf8");
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
