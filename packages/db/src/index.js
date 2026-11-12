"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeEmbedFields = exports.parseEmbedFields = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const globalForPrisma = globalThis;
/**
 * Apply the pool limits to DATABASE_URL.
 *
 * Postgres caps connections per database, and the API, bot and Next SSR each
 * run their own Prisma pool. Without explicit limits a traffic spike exhausts
 * Postgres and every process starts failing at once. `?connection_limit=` and
 * `?pool_timeout=` are the documented Prisma knobs; PgBouncer in transaction
 * mode is the next step for serverless/Next.
 */
function withPoolSettings(url) {
    if (!url)
        return url;
    const limit = process.env.DATABASE_CONNECTION_LIMIT;
    const timeout = process.env.DATABASE_POOL_TIMEOUT;
    if (!limit && !timeout)
        return url;
    try {
        const parsed = new URL(url);
        if (limit && !parsed.searchParams.has('connection_limit')) {
            parsed.searchParams.set('connection_limit', limit);
        }
        if (timeout && !parsed.searchParams.has('pool_timeout')) {
            parsed.searchParams.set('pool_timeout', timeout);
        }
        return parsed.toString();
    }
    catch {
        // Not a parseable URL (e.g. a pgbouncer socket string): leave it untouched.
        return url;
    }
}
const databaseUrl = withPoolSettings(process.env.DATABASE_URL);
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        ...(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : {}),
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
    });
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
__exportStar(require("@prisma/client"), exports);
var types_1 = require("./types");
Object.defineProperty(exports, "parseEmbedFields", { enumerable: true, get: function () { return types_1.parseEmbedFields; } });
Object.defineProperty(exports, "serializeEmbedFields", { enumerable: true, get: function () { return types_1.serializeEmbedFields; } });
//# sourceMappingURL=index.js.map