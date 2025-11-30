import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary Component
 * 
 * Catches React errors in child components and displays a fallback UI
 * instead of crashing the entire extension popup.
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error Boundary caught an error:', error, errorInfo);

        // TODO: Send to error reporting service in production
        // errorReporter.captureException(error, { extra: errorInfo });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex items-center justify-center min-h-[400px] p-8 bg-gradient-to-br from-[#667eea] to-[#764ba2]">
                    <div className="text-center bg-white rounded-xl p-8 max-w-[400px] shadow-2xl">
                        <div className="text-5xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                className="px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all border-none bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white hover:-translate-y-px hover:shadow-lg hover:shadow-[#667eea]/40"
                                onClick={this.handleReset}
                            >
                                Try Again
                            </button>
                            <button
                                className="px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all border-none bg-gray-200 text-gray-600 hover:bg-gray-300"
                                onClick={() => window.location.reload()}
                            >
                                Reload Extension
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
