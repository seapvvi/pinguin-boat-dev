"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEmbedFields = parseEmbedFields;
exports.serializeEmbedFields = serializeEmbedFields;
function parseEmbedFields(value) {
    if (!value)
        return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
}
function serializeEmbedFields(fields) {
    return JSON.stringify(fields);
}
//# sourceMappingURL=index.js.map