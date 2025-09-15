import fs from 'fs';
import path from 'path';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

// Logger interface
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  stack?: string;
}

// Logger class
class Logger {
  private logToFile(entry: LogEntry): void {
    const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
    const logLine = `${entry.timestamp} [${entry.level}] ${entry.message}${entry.data ? ` | Data: ${JSON.stringify(entry.data)}` : ''}${entry.stack ? ` | Stack: ${entry.stack}` : ''}\n`;
    
    fs.appendFileSync(logFile, logLine);
  }

  private createLogEntry(level: LogLevel, message: string, data?: any, stack?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      stack
    };
  }

  error(message: string, error?: Error | any, data?: any): void {
    const entry = this.createLogEntry(
      LogLevel.ERROR, 
      message, 
      data, 
      error?.stack || (error ? JSON.stringify(error) : undefined)
    );
    
    console.error(`❌ [${entry.timestamp}] ${message}`, error || '', data || '');
    this.logToFile(entry);
  }

  warn(message: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, data);
    
    console.warn(`⚠️ [${entry.timestamp}] ${message}`, data || '');
    this.logToFile(entry);
  }

  info(message: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, data);
    
    console.log(`ℹ️ [${entry.timestamp}] ${message}`, data || '');
    this.logToFile(entry);
  }

  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, data);
      
      console.debug(`🐛 [${entry.timestamp}] ${message}`, data || '');
      this.logToFile(entry);
    }
  }

  // Log HTTP requests
  request(method: string, url: string, statusCode: number, responseTime: number, userAgent?: string): void {
    const message = `${method} ${url} - ${statusCode} - ${responseTime}ms`;
    const data = { method, url, statusCode, responseTime, userAgent };
    
    if (statusCode >= 400) {
      this.error(message, undefined, data);
    } else {
      this.info(message, data);
    }
  }

  // Log database operations
  database(operation: string, table: string, duration: number, success: boolean, error?: Error): void {
    const message = `DB ${operation} on ${table} - ${duration}ms - ${success ? 'SUCCESS' : 'FAILED'}`;
    const data = { operation, table, duration, success };
    
    if (success) {
      this.debug(message, data);
    } else {
      this.error(message, error, data);
    }
  }

  // Log authentication events
  auth(event: string, userId?: string, email?: string, success: boolean = true, reason?: string): void {
    const message = `AUTH ${event} - ${success ? 'SUCCESS' : 'FAILED'}${reason ? ` - ${reason}` : ''}`;
    const data = { event, userId, email, success, reason };
    
    if (success) {
      this.info(message, data);
    } else {
      this.warn(message, data);
    }
  }

  // Log application events
  application(event: string, applicationId: string, userId?: string, status?: string, data?: any): void {
    const message = `APPLICATION ${event} - ID: ${applicationId}${status ? ` - Status: ${status}` : ''}`;
    const logData = { event, applicationId, userId, status, ...data };
    
    this.info(message, logData);
  }
}

// Create and export logger instance
const logger = new Logger();

export default logger;
