const LOG_LEVELS = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
  } as const;
  
  type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];
  
  interface LogMessage {
    timestamp: string;
    level: LogLevel;
    context: string;
    message: string;
    data?: any;
  }
  
  class Logger {
    private formatMessage({
      timestamp,
      level,
      context,
      message,
      data,
    }: LogMessage): string {
      const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : '';
      return `[${timestamp}] ${level.padEnd(
        5
      )} [${context}] ${message}${dataStr}`;
    }
  
    private log(level: LogLevel, context: string, message: string, data?: any) {
      const logMessage = this.formatMessage({
        timestamp: new Date().toISOString(),
        level,
        context,
        message,
        data,
      });
  
      switch (level) {
        case LOG_LEVELS.ERROR:
          console.error(logMessage);
          break;
        case LOG_LEVELS.WARN:
          console.warn(logMessage);
          break;
        case LOG_LEVELS.INFO:
          console.info(logMessage);
          break;
        default:
          console.debug(logMessage);
      }
    }
  
    debug(context: string, message: string, data?: any) {
      this.log(LOG_LEVELS.DEBUG, context, message, data);
    }
  
    info(context: string, message: string, data?: any) {
      this.log(LOG_LEVELS.INFO, context, message, data);
    }
  
    warn(context: string, message: string, data?: any) {
      this.log(LOG_LEVELS.WARN, context, message, data);
    }
  
    error(context: string, message: string, error?: Error | any) {
      this.log(LOG_LEVELS.ERROR, context, message, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : error,
      });
    }
  }
  
  export const logger = new Logger();
  