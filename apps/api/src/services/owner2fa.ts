import { createHash, randomBytes } from "crypto";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

const RECOVERY_CODE_COUNT = 8;

export function generateSecret(): speakeasy.GeneratedSecret {
  return speakeasy.generateSecret({
    name: "Pinguin BOAT (Dashboard)",
    length: 20,
  });
}

export async function generateQRCode(secret: string): Promise<string> {
  const otpauthUrl = speakeasy.otpauthURL({
    secret,
    label: "Pinguin BOAT Dashboard",
    issuer: "Pinguin BOAT",
    encoding: "base32",
  });

  return QRCode.toDataURL(otpauthUrl);
}

export function verifyToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 2,
  });
}

// ─── Recovery codes ──────────────────────────────────────────────────────────
// Codes are shown once and stored only as SHA-256 hashes, mapped to the time
// they were consumed (null = unused). A lost TOTP device must not lock the
// owner out of every destructive route.

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // no 0/o/1/i/l ambiguity
const CODE_RE = /^[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/;

type RecoveryCodeMap = Record<string, number | null>;

function hashCode(code: string): string {
  return createHash("sha256").update(code.trim().toLowerCase()).digest("hex");
}

export function isRecoveryCodeFormat(value: string): boolean {
  return CODE_RE.test(value.trim().toLowerCase());
}

export function generateRecoveryCodes(): { plain: string[]; stored: string } {
  const plain: string[] = [];
  const map: RecoveryCodeMap = {};
  while (plain.length < RECOVERY_CODE_COUNT) {
    const raw = randomBytes(12);
    let chars = "";
    for (let i = 0; i < 12; i++) chars += ALPHABET[raw[i] % ALPHABET.length];
    const code = `${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`;
    if (map[hashCode(code)] !== undefined || plain.includes(code)) continue;
    plain.push(code);
    map[hashCode(code)] = null;
  }
  return { plain, stored: JSON.stringify(map) };
}

function parseMap(stored: string | null): RecoveryCodeMap {
  if (!stored) return {};
  try {
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as RecoveryCodeMap)
      : {};
  } catch {
    return {};
  }
}

/** Returns the updated map when the code is valid and unused, otherwise null. */
export function consumeRecoveryCode(
  stored: string | null,
  code: string,
): string | null {
  if (!isRecoveryCodeFormat(code)) return null;
  const map = parseMap(stored);
  const hash = hashCode(code);
  if (!(hash in map) || map[hash] !== null) return null;
  map[hash] = Date.now();
  return JSON.stringify(map);
}

export function remainingRecoveryCodes(stored: string | null): number {
  return Object.values(parseMap(stored)).filter((v) => v === null).length;
}
