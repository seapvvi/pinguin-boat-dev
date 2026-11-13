import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { isSetupRequired } from "@/lib/setup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESTART_APPS = ["pinguin-api", "pinguin-bot"];
const RESTART_TIMEOUT_MS = 20_000;
const MAX_OUTPUT = 2000;

/**
 * Re-run the API and bot after the setup assistant wrote the root .env. Both
 * load it at startup, so without this they keep the old (empty) configuration.
 * Only allowed while setup is still required: once every key is present the
 * endpoint is closed, so it cannot be used as an unauthenticated kill switch.
 */
export async function POST() {
  if (!isSetupRequired()) {
    return NextResponse.json(
      { ok: false, error: "Configuration déjà terminée." },
      { status: 403 },
    );
  }

  return new Promise<NextResponse>((resolve) => {
    execFile(
      "pm2",
      ["restart", ...RESTART_APPS, "--update-env"],
      { timeout: RESTART_TIMEOUT_MS, windowsHide: true },
      (err, stdout, stderr) => {
        const output = `${stdout}${stderr}`.trim();
        if (err) {
          const reason =
            (err as NodeJS.ErrnoException).code === "ENOENT"
              ? "pm2 introuvable sur cet hôte."
              : output || err.message;
          resolve(
            NextResponse.json(
              { ok: false, error: reason.slice(0, MAX_OUTPUT) },
              { status: 500 },
            ),
          );
          return;
        }
        resolve(
          NextResponse.json({ ok: true, output: output.slice(-MAX_OUTPUT) }),
        );
      },
    );
  });
}
