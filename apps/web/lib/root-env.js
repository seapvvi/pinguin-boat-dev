// Shared by the setup assistant (apps/web/lib/setup.ts writes the root .env) and
// next.config.js (next start does not read that file). Plain CJS so both can load it.
// Server-only: it is never meant to be bundled for the browser.
const fs = require("node:fs");
const path = require("node:path");

/** The repo-root .env: two levels above apps/web. */
function rootEnvPath(webRoot = process.cwd()) {
  return path.resolve(webRoot, "../../.env");
}

/**
 * Fill `target` with the keys of root .env it is missing or that are blank.
 * Existing values win, so a .env.local edited by hand is never overwritten.
 */
function applyRootEnv(target, envPath = rootEnvPath()) {
  if (!fs.existsSync(envPath)) return false;
  const source = readEnv(envPath);
  for (const [key, value] of Object.entries(source)) {
    if (!target[key]) target[key] = value;
  }
  return true;
}

function readEnv(envPath) {
  try {
    return require("dotenv").parse(fs.readFileSync(envPath));
  } catch (err) {
    // Minimal KEY=VALUE fallback keeps first boot working if dotenv is not resolvable.
    if (err && err.code !== "MODULE_NOT_FOUND") throw err;
    const out = {};
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/.exec(line);
      if (match)
        out[match[1]] = match[2].trim().replace(/^(["'])(.*)\1$/, "$2");
    }
    return out;
  }
}

/** Expose the root .env to the browser bundle: NEXT_PUBLIC_* are baked at build time. */
function patchNextConfig(config, envPath = rootEnvPath()) {
  const before = { ...process.env };
  applyRootEnv(process.env, envPath);
  // Next rejects server-only keys (NODE_ENV, NEXT_RUNTIME...) in `env` and inlines
  // them itself, so pass only public keys that process.env did not already have.
  const env = { ...config.env };
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith("NEXT_PUBLIC_") && !before[key]) env[key] = value;
  }
  return { ...config, env };
}

module.exports = { rootEnvPath, applyRootEnv, patchNextConfig };
