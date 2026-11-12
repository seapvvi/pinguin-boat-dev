import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Apply the pool limits to DATABASE_URL.
 *
 * Postgres caps connections per database, and the API, bot and Next SSR each
 * run their own Prisma pool. Without explicit limits a traffic spike exhausts
 * Postgres and every process starts failing at once. `?connection_limit=` and
 * `?pool_timeout=` are the documented Prisma knobs; PgBouncer in transaction
 * mode is the next step for serverless/Next.
 */
function withPoolSettings(url: string | undefined): string | undefined {
  if (!url) return url;

  const limit = process.env.DATABASE_CONNECTION_LIMIT;
  const timeout = process.env.DATABASE_POOL_TIMEOUT;
  if (!limit && !timeout) return url;

  try {
    const parsed = new URL(url);
    if (limit && !parsed.searchParams.has('connection_limit')) {
      parsed.searchParams.set('connection_limit', limit);
    }
    if (timeout && !parsed.searchParams.has('pool_timeout')) {
      parsed.searchParams.set('pool_timeout', timeout);
    }
    return parsed.toString();
  } catch {
    // Not a parseable URL (e.g. a pgbouncer socket string): leave it untouched.
    return url;
  }
}

const databaseUrl = withPoolSettings(process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : {}),
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export * from '@prisma/client';
export type { EmbedField, EmbedData, EmbedVariable } from './types';
export { parseEmbedFields, serializeEmbedFields } from './types';