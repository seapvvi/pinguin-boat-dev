"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toErrorMessage = toErrorMessage;
function toErrorMessage(err) {
    return err instanceof Error ? err.message : 'Erreur inconnue';
}
//# sourceMappingURL=types.js.map