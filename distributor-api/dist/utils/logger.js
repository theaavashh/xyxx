"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logsDir = path_1.default.join(process.cwd(), 'logs');
if (!fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir, { recursive: true });
}
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "ERROR";
    LogLevel["WARN"] = "WARN";
    LogLevel["INFO"] = "INFO";
    LogLevel["DEBUG"] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    logToFile(entry) {
        const logFile = path_1.default.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
        const logLine = `${entry.timestamp} [${entry.level}] ${entry.message}${entry.data ? ` | Data: ${JSON.stringify(entry.data)}` : ''}${entry.stack ? ` | Stack: ${entry.stack}` : ''}\n`;
        fs_1.default.appendFileSync(logFile, logLine);
    }
    createLogEntry(level, message, data, stack) {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            data,
            stack
        };
    }
    error(message, error, data) {
        const entry = this.createLogEntry(LogLevel.ERROR, message, data, error?.stack || (error ? JSON.stringify(error) : undefined));
        console.error(`❌ [${entry.timestamp}] ${message}`, error || '', data || '');
        this.logToFile(entry);
    }
    warn(message, data) {
        const entry = this.createLogEntry(LogLevel.WARN, message, data);
        console.warn(`⚠️ [${entry.timestamp}] ${message}`, data || '');
        this.logToFile(entry);
    }
    info(message, data) {
        const entry = this.createLogEntry(LogLevel.INFO, message, data);
        console.log(`ℹ️ [${entry.timestamp}] ${message}`, data || '');
        this.logToFile(entry);
    }
    debug(message, data) {
        if (process.env.NODE_ENV === 'development') {
            const entry = this.createLogEntry(LogLevel.DEBUG, message, data);
            console.debug(`🐛 [${entry.timestamp}] ${message}`, data || '');
            this.logToFile(entry);
        }
    }
    request(method, url, statusCode, responseTime, userAgent) {
        const message = `${method} ${url} - ${statusCode} - ${responseTime}ms`;
        const data = { method, url, statusCode, responseTime, userAgent };
        if (statusCode >= 400) {
            this.error(message, undefined, data);
        }
        else {
            this.info(message, data);
        }
    }
    database(operation, table, duration, success, error) {
        const message = `DB ${operation} on ${table} - ${duration}ms - ${success ? 'SUCCESS' : 'FAILED'}`;
        const data = { operation, table, duration, success };
        if (success) {
            this.debug(message, data);
        }
        else {
            this.error(message, error, data);
        }
    }
    auth(event, userId, email, success = true, reason) {
        const message = `AUTH ${event} - ${success ? 'SUCCESS' : 'FAILED'}${reason ? ` - ${reason}` : ''}`;
        const data = { event, userId, email, success, reason };
        if (success) {
            this.info(message, data);
        }
        else {
            this.warn(message, data);
        }
    }
    application(event, applicationId, userId, status, data) {
        const message = `APPLICATION ${event} - ID: ${applicationId}${status ? ` - Status: ${status}` : ''}`;
        const logData = { event, applicationId, userId, status, ...data };
        this.info(message, logData);
    }
}
const logger = new Logger();
exports.default = logger;
//# sourceMappingURL=logger.js.map