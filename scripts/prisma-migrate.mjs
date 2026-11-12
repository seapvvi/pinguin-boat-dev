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
import { fileURLToPath } from "node:url";
import path from "node:path";

const prismaDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "packages/db",
);
const schema = path.join(prismaDir, "prisma", "schema.prisma");
const [command = "dev", ...extra] = process.argv.slice(2);

// `resolve` and `deploy` take no prompt; `dev` gets the non-interactive flags.
const args =
  command === "dev"
    ? ["migrate", "dev", "--skip-generate", "--skip-seed", ...extra]
    : ["migrate", command, ...extra];

if (command === "status") args.push("--schema", schema);

const result = spawnSync("npx", ["prisma", ...args], {
  cwd: prismaDir,
  shell: process.platform === "win32",
  stdio: "inherit",
});

// prisma migrate status exits 1 (pending) / 2 (drift): CLI-friendly in CI.
process.exit(result.status ?? 1);
