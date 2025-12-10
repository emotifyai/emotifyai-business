/**
 * Performance Monitoring Utility
 * 
 * Tracks execution times to identify bottlenecks:
 * - Extension code execution time (text selection → replacement)
 * - Backend API response time (AI provider latency)
 * - Total enhancement latency
 * 
 * Metrics are logged to console in dev mode for analysis.
 */

interface PerformanceMetric {
    name: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    metadata?: Record<string, any>;
}

class PerformanceMonitor {
    private metrics: Map<string, PerformanceMetric> = new Map();
    private enabled: boolean;

    constructor() {
        this.enabled = import.meta.env.DEV || import.meta.env.VITE_LOG_LEVEL === 'debug';
    }

    /**
     * Start tracking a performance metric
     */
    start(name: string, metadata?: Record<string, any>): void {
        if (!this.enabled) return;

        this.metrics.set(name, {
            name,
            startTime: performance.now(),
            metadata,
        });
    }

    /**
     * End tracking and calculate duration
     */
    end(name: string, additionalMetadata?: Record<string, any>): number | null {
        if (!this.enabled) return null;

        const metric = this.metrics.get(name);
        if (!metric) {
            console.warn(`Performance metric "${name}" was never started`);
            return null;
        }

        metric.endTime = performance.now();
        metric.duration = metric.endTime - metric.startTime;

        if (additionalMetadata) {
            metric.metadata = { ...metric.metadata, ...additionalMetadata };
        }

        this.log(metric);
        this.metrics.delete(name);

        return metric.duration;
    }

    /**
     * Measure a function execution time
     */
    async measure<T>(
        name: string,
        fn: () => Promise<T>,
        metadata?: Record<string, any>
    ): Promise<T> {
        this.start(name, metadata);
        try {
            const result = await fn();
            this.end(name);
            return result;
        } catch (error) {
            this.end(name, { error: true });
            throw error;
        }
    }

    /**
     * Log metric to console with formatting
     */
    private log(metric: PerformanceMetric): void {
        if (!metric.duration) return;

        const duration = metric.duration.toFixed(2);

        console.log(
            `%c⏱️ ${metric.name}`,
            'font-weight: bold; font-size: 12px;',
            `\n  Duration: ${duration}ms`,
            metric.metadata ? `\n  Metadata: ${JSON.stringify(metric.metadata, null, 2)}` : ''
        );

        // Warn if slow
        if (metric.duration > 1000) {
            console.warn(`⚠️ Slow operation detected: ${metric.name} took ${duration}ms`);
        }
    }

    /**
     * Get console log style based on duration
     */
    private getLogStyle(duration: number): string {
        if (duration < 100) return 'color: #10b981'; // Fast - green
        if (duration < 500) return 'color: #f59e0b'; // Medium - yellow
        return 'color: #ef4444'; // Slow - red
    }

    /**
     * Get all metrics (for debugging)
     */
    getMetrics(): PerformanceMetric[] {
        return Array.from(this.metrics.values());
    }

    /**
     * Clear all metrics
     */
    clear(): void {
        this.metrics.clear();
    }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Decorator for measuring async function performance
 */
export function measurePerformance(name?: string) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;
        const metricName = name || `${target.constructor.name}.${propertyKey}`;

        descriptor.value = async function (...args: any[]) {
            return performanceMonitor.measure(metricName, () => originalMethod.apply(this, args));
        };

        return descriptor;
    };
}

/**
 * Helper to track specific phases of text enhancement
 */
export class EnhancementPerformanceTracker {
    private sessionId: string;

    constructor() {
        this.sessionId = `enhancement-${Date.now()}`;
    }

    startTotal() {
        performanceMonitor.start(`${this.sessionId}-total`);
    }

    startExtensionProcessing() {
        performanceMonitor.start(`${this.sessionId}-extension`);
    }

    endExtensionProcessing() {
        return performanceMonitor.end(`${this.sessionId}-extension`);
    }

    startBackendRequest() {
        performanceMonitor.start(`${this.sessionId}-backend`);
    }

    endBackendRequest(success: boolean) {
        return performanceMonitor.end(`${this.sessionId}-backend`, { success });
    }

    endTotal() {
        const totalDuration = performanceMonitor.end(`${this.sessionId}-total`);

        if (totalDuration) {
            console.log(
                `%c📊 Enhancement Performance Summary`,
                'font-weight: bold; font-size: 14px; color: #3b82f6;',
                `\n  Total: ${totalDuration.toFixed(2)}ms`
            );
        }
    }
}
