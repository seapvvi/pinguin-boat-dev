"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.getLogger = getLogger;
const pino_1 = __importDefault(require("pino"));
const isServer = typeof process !== 'undefined' && process.release?.name === 'node';
function resolveLogLevel(envLevel) {
    switch (envLevel) {
        case 'debug':
        case 'info':
        case 'warn':
        case 'error':
            return envLevel;
        default:
            return 'info';
    }
}
function createBaseLogger(options) {
    const level = resolveLogLevel(options?.level ?? process.env.LOG_LEVEL);
    const destination = process.env.LOG_DESTINATION ?? 'logs/pinguin.log';
    return (0, pino_1.default)({
        level,
        base: {
            pid: process.pid,
            hostname: process.env.HOSTNAME,
        },
        messageKey: 'msg',
        timestamp: pino_1.default.stdTimeFunctions.isoTime,
        transport: {
            targets: [
                { target: 'pino/file', options: { destination: 1 } },
                { target: 'pino-roll', options: { file: destination, frequency: 'daily', mkdir: true } },
            ],
        },
    });
}
function createNoopLogger() {
    return (0, pino_1.default)({ enabled: false });
}
// built on first use: importing the package must not start pino (and its
// worker threads) in consumers like the web server that never log through it
let singletonPinoLogger = null;
function baseLogger() {
    if (!singletonPinoLogger) {
        singletonPinoLogger = isServer ? createBaseLogger() : createNoopLogger();
    }
    return singletonPinoLogger;
}
function wrapLogger(pinoLogger) {
    return {
        debug: (msg, obj) => (obj ? pinoLogger.debug(obj, msg) : pinoLogger.debug(msg)),
        info: (msg, obj) => (obj ? pinoLogger.info(obj, msg) : pinoLogger.info(msg)),
        warn: (msg, obj) => (obj ? pinoLogger.warn(obj, msg) : pinoLogger.warn(msg)),
        error: (msg, obj) => (obj ? pinoLogger.error(obj, msg) : pinoLogger.error(msg)),
        child: (b) => wrapLogger(pinoLogger.child(b)),
    };
}
function getLogger(context) {
    if (!context || Object.keys(context).length === 0)
        return exports.logger;
    const bindings = {};
    if (context.guildId)
        bindings.guildId = context.guildId;
    if (context.userId)
        bindings.userId = context.userId;
    if (context.component)
        bindings.component = context.component;
    return wrapLogger(baseLogger().child(bindings));
}
exports.logger = {
    debug: (msg, obj) => (obj ? baseLogger().debug(obj, msg) : baseLogger().debug(msg)),
    info: (msg, obj) => (obj ? baseLogger().info(obj, msg) : baseLogger().info(msg)),
    warn: (msg, obj) => (obj ? baseLogger().warn(obj, msg) : baseLogger().warn(msg)),
    error: (msg, obj) => (obj ? baseLogger().error(obj, msg) : baseLogger().error(msg)),
    child: (b) => wrapLogger(baseLogger().child(b)),
};
//# sourceMappingURL=logger.js.map