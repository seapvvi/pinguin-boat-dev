import { describe, it, expect } from "vitest";
import {
  consumeRecoveryCode,
  generateRecoveryCodes,
  isRecoveryCodeFormat,
  remainingRecoveryCodes,
} from "../services/owner2fa";

describe("owner 2FA recovery codes", () => {
  it("generates 8 unique, well-formed codes and stores only hashes", () => {
    const { plain, stored } = generateRecoveryCodes();
    expect(plain).toHaveLength(8);
    expect(new Set(plain).size).toBe(8);
    expect(plain.every(isRecoveryCodeFormat)).toBe(true);
    for (const code of plain) expect(stored).not.toContain(code);
    expect(remainingRecoveryCodes(stored)).toBe(8);
  });

  it("consumes a code exactly once", () => {
    const { plain, stored } = generateRecoveryCodes();
    const afterFirst = consumeRecoveryCode(stored, plain[0]);
    expect(afterFirst).not.toBeNull();
    expect(remainingRecoveryCodes(afterFirst)).toBe(7);
    expect(consumeRecoveryCode(afterFirst, plain[0])).toBeNull();
    expect(
      consumeRecoveryCode(afterFirst, plain[1].toUpperCase()),
    ).not.toBeNull();
  });

  it("rejects unknown, malformed and legacy null storage", () => {
    const { stored } = generateRecoveryCodes();
    expect(consumeRecoveryCode(stored, "aaaa-bbbb-cccc")).toBeNull();
    expect(consumeRecoveryCode(stored, "123456")).toBeNull();
    expect(consumeRecoveryCode(null, "aaaa-bbbb-cccc")).toBeNull();
    expect(consumeRecoveryCode("not json", "aaaa-bbbb-cccc")).toBeNull();
    expect(remainingRecoveryCodes(null)).toBe(0);
  });
});
