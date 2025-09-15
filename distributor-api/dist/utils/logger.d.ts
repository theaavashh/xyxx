export declare enum LogLevel {
    ERROR = "ERROR",
    WARN = "WARN",
    INFO = "INFO",
    DEBUG = "DEBUG"
}
declare class Logger {
    private logToFile;
    private createLogEntry;
    error(message: string, error?: Error | any, data?: any): void;
    warn(message: string, data?: any): void;
    info(message: string, data?: any): void;
    debug(message: string, data?: any): void;
    request(method: string, url: string, statusCode: number, responseTime: number, userAgent?: string): void;
    database(operation: string, table: string, duration: number, success: boolean, error?: Error): void;
    auth(event: string, userId?: string, email?: string, success?: boolean, reason?: string): void;
    application(event: string, applicationId: string, userId?: string, status?: string, data?: any): void;
}
declare const logger: Logger;
export default logger;
//# sourceMappingURL=logger.d.ts.map