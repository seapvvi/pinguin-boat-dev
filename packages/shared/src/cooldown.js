"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canUseCooldown = canUseCooldown;
exports.updateCooldownState = updateCooldownState;
function canUseCooldown(nowMs, state, cooldownMs) {
    if (!Number.isFinite(cooldownMs) || cooldownMs <= 0) {
        return { allowed: true, remainingMs: 0 };
    }
    if (state.lastTimestampMs === null || !Number.isFinite(state.lastTimestampMs)) {
        return { allowed: true, remainingMs: 0 };
    }
    if (!Number.isFinite(nowMs)) {
        return { allowed: true, remainingMs: 0 };
    }
    const expiration = state.lastTimestampMs + cooldownMs;
    if (nowMs < expiration) {
        return { allowed: false, remainingMs: expiration - nowMs };
    }
    return { allowed: true, remainingMs: 0 };
}
function updateCooldownState(nowMs) {
    if (!Number.isFinite(nowMs)) {
        return { lastTimestampMs: null };
    }
    return { lastTimestampMs: nowMs };
}
//# sourceMappingURL=cooldown.js.map