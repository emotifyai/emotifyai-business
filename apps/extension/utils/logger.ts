type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
    private readonly logLevel: LogLevel;

    constructor() {
        this.logLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info';
    }

    private shouldLog(level: LogLevel): boolean {
        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
        const currentLevelIndex = levels.indexOf(this.logLevel);
        const requestedLevelIndex = levels.indexOf(level);
        return requestedLevelIndex >= currentLevelIndex;
    }

    private formatMessage(level: LogLevel, message: string, ...args: unknown[]): void {
        const timestamp = new Date().toISOString();
        const prefix = `[Verba ${level.toUpperCase()}] ${timestamp}:`;

        switch (level) {
            case 'debug':
                console.debug(prefix, message, ...args);
                break;
            case 'info':
                console.info(prefix, message, ...args);
                break;
            case 'warn':
                console.warn(prefix, message, ...args);
                break;
            case 'error':
                console.error(prefix, message, ...args);
                break;
        }
    }

    debug(message: string, ...args: unknown[]): void {
        if (this.shouldLog('debug')) {
            this.formatMessage('debug', message, ...args);
        }
    }

    info(message: string, ...args: unknown[]): void {
        if (this.shouldLog('info')) {
            this.formatMessage('info', message, ...args);
        }
    }

    warn(message: string, ...args: unknown[]): void {
        if (this.shouldLog('warn')) {
            this.formatMessage('warn', message, ...args);
        }
    }

    error(message: string, error?: unknown, ...args: unknown[]): void {
        if (this.shouldLog('error')) {
            this.formatMessage('error', message, error, ...args);
        }
    }
}

export const logger = new Logger();
