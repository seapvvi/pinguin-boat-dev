#!/usr/bin/env node
/**
 * Fails when the repository tracks files that should never have been committed:
 * Python bytecode, editor backups, `.bak` copies of source files, and the
 * throw-away scripts used while editing docs.
 *
 * Runs in CI (`pnpm check:stray`) and is cheap enough to run locally: it only
 * asks git for the tracked file list.
 */
import { execFileSync } from "node:child_process";

const BANNED_PATH_PATTERNS = [
  // Python bytecode and caches produced by tools/*.py and scripts/*.py.
  /(^|\/)__pycache__(\/|$)/,
  /\.pyc$/,
  // Editor and merge leftovers.
  /\.bak$/,
  /\.orig$/,
  /\.rej$/,
  /(^|\/)[^/]*~$/,
  // Copies of tracked source files (`middleware.ts.bak`, `foo copy.tsx`).
  /(^|\/)[^/]*\bcopy\b[^/]*\.(ts|tsx|js|jsx|mjs|cjs)$/i,
  // Scratch files from a previous editing session.
  /(^|\/)\.gg-tmp[^/]*$/,
  /(^|\/)___temp[^/]*$/,
];

/** Directories that are allowed to contain generated Python bytecode. */
const ALLOWED_PREFIXES = [];

let files;
try {
  files = execFileSync("git", ["ls-files", "-z"], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
} catch (err) {
  console.error("check:stray: unable to list tracked files with `git ls-files`.");
  console.error(err instanceof Error ? err.message : err);
  process.exit(2);
}

const offenders = files
  .split("\0")
  .filter(Boolean)
  .filter((file) => !ALLOWED_PREFIXES.some((prefix) => file.startsWith(prefix)))
  .filter((file) => BANNED_PATH_PATTERNS.some((pattern) => pattern.test(file)));

if (offenders.length === 0) {
  console.log("check:stray: no stray files tracked.");
  process.exit(0);
}

console.error("check:stray: these files should not be tracked:");
for (const file of offenders) console.error(`  - ${file}`);
console.error(
  "\nRemove them with `git rm --cached <file>`, add the pattern to .gitignore, then commit.",
);
process.exit(1);