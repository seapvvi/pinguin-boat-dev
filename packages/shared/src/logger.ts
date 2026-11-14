import pino, { type Logger as PinoLogger } from "pino";

export type LoggerLevel = "debug" | "info" | "warn" | "error";

export interface LoggerContext {
  guildId?: string;
  userId?: string;
  component?: string;
}

export interface CreateLoggerOptions {
  level?: LoggerLevel;
}

export interface BotLogger {
  debug(msg: string, obj?: Record<string, unknown>): void;
  info(msg: string, obj?: Record<string, unknown>): void;
  warn(msg: string, obj?: Record<string, unknown>): void;
  error(msg: string, obj?: Record<string, unknown>): void;
  child(bindings: Record<string, unknown>): BotLogger;
}

const isServer =
  typeof process !== "undefined" && process.release?.name === "node";

function resolveLogLevel(envLevel: string | undefined): LoggerLevel {
  switch (envLevel) {
    case "debug":
    case "info":
    case "warn":
    case "error":
      return envLevel;
    default:
      return "info";
  }
}

/**
 * Builds the logger, falling back to stdout-only when the rolling-file
 * transport cannot be created.
 *
 * `pino` resolves the `pino-roll` target relative to the file that creates
 * the logger, so a workspace where the package is not reachable from the
 * compiled output (pnpm, a bundled dist) makes the transport unavailable.
 * That must never take the service down, so the fallback keeps the process
 * running and logging.
 */
export function createLoggerWithFallback(
  withTransport: () => PinoLogger,
  fallback: () => PinoLogger,
): PinoLogger {
  try {
    return withTransport();
  } catch (err) {
    console.error(
      "[logger] transport pino-roll indisponible, repli sur stdout:",
      err instanceof Error ? err.message : err,
    );
    return fallback();
  }
}

function createBaseLogger(options?: CreateLoggerOptions): PinoLogger {
  const level = resolveLogLevel(options?.level ?? process.env.LOG_LEVEL);
  const destination = process.env.LOG_DESTINATION ?? "logs/pinguin.log";

  const base = {
    level,
    base: {
      pid: process.pid,
      hostname: process.env.HOSTNAME,
    },
    messageKey: "msg",
    timestamp: pino.stdTimeFunctions.isoTime,
  };

  return createLoggerWithFallback(
    () =>
      pino({
        ...base,
        transport: {
          targets: [
            { target: "pino/file", options: { destination: 1 } },
            {
              target: "pino-roll",
              options: { file: destination, frequency: "daily", mkdir: true },
            },
          ],
        },
      }),
    () => pino(base),
  );
}

function createNoopLogger(): PinoLogger {
  return pino({ enabled: false });
}

// built on first use: importing the package must not start pino (and its
// worker threads) in consumers like the web server that never log through it
let singletonPinoLogger: PinoLogger | null = null;

function baseLogger(): PinoLogger {
  if (!singletonPinoLogger) {
    singletonPinoLogger = isServer ? createBaseLogger() : createNoopLogger();
  }
  return singletonPinoLogger;
}

function wrapLogger(pinoLogger: PinoLogger): BotLogger {
  return {
    debug: (msg, obj) =>
      obj ? pinoLogger.debug(obj, msg) : pinoLogger.debug(msg),
    info: (msg, obj) =>
      obj ? pinoLogger.info(obj, msg) : pinoLogger.info(msg),
    warn: (msg, obj) =>
      obj ? pinoLogger.warn(obj, msg) : pinoLogger.warn(msg),
    error: (msg, obj) =>
      obj ? pinoLogger.error(obj, msg) : pinoLogger.error(msg),
    child: (b) => wrapLogger(pinoLogger.child(b)),
  };
}

export function getLogger(context?: LoggerContext): BotLogger {
  if (!context || Object.keys(context).length === 0) return logger;

  const bindings: Record<string, string> = {};
  if (context.guildId) bindings.guildId = context.guildId;
  if (context.userId) bindings.userId = context.userId;
  if (context.component) bindings.component = context.component;

  return wrapLogger(baseLogger().child(bindings));
}

export const logger: BotLogger = {
  debug: (msg, obj) =>
    obj ? baseLogger().debug(obj, msg) : baseLogger().debug(msg),
  info: (msg, obj) =>
    obj ? baseLogger().info(obj, msg) : baseLogger().info(msg),
  warn: (msg, obj) =>
    obj ? baseLogger().warn(obj, msg) : baseLogger().warn(msg),
  error: (msg, obj) =>
    obj ? baseLogger().error(obj, msg) : baseLogger().error(msg),
  child: (b) => wrapLogger(baseLogger().child(b)),
};
