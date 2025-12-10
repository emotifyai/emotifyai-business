import { useState } from 'react';

interface AuthViewProps {
    onLogin: () => void;
}

export default function AuthView({ onLogin }: AuthViewProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // In a real implementation, this triggers the OAuth flow
            // The auth service will handle the browser.identity.launchWebAuthFlow
            await onLogin();
        } catch (err) {
            setError('Failed to sign in. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center h-full bg-white">
            <div className="mb-6 animate-float">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="30" fill="url(#gradient)" />
                    <path
                        d="M32 16L40 28H24L32 16Z M24 36L32 48L40 36H24Z"
                        fill="white"
                        opacity="0.9"
                    />
                    <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="64" y2="64">
                            <stop offset="0%" stopColor="#667eea" />
                            <stop offset="100%" stopColor="#764ba2" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to EmotifyAI</h1>
            <p className="text-sm text-gray-500 mb-8 max-w-[240px] leading-relaxed">
                AI-powered text enhancement at your fingertips
            </p>

            <div className="w-full max-w-[280px] mb-6">
                <button
                    className="flex items-center justify-center w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 cursor-pointer transition-all shadow-sm hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-px hover:shadow-md active:translate-y-0 active:shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mr-2"></span>
                    ) : (
                        <svg className="mr-3" width="18" height="18" viewBox="0 0 18 18">
                            <path d="M17.64 9.2c0-.637-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.715H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.272C4.672 5.142 6.656 3.58 9 3.58z" fill="#EA4335" />
                        </svg>
                    )}
                    <span>{isLoading ? 'Signing in...' : 'Sign in with Google'}</span>
                </button>
            </div>

            {error && <p className="text-red-600 text-xs -mt-4 mb-4">{error}</p>}

            <p className="text-xs text-gray-400 max-w-[200px] leading-snug">
                Select text on any webpage, right-click, and enhance with AI
            </p>
        </div>
    );
}
