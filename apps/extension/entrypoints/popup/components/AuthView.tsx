import './AuthView.css';

interface AuthViewProps {
    onLogin: () => void;
}

export default function AuthView({ onLogin }: AuthViewProps) {
    const handleLogin = () => {
        // In a real implementation, this would open the web app for OAuth
        // For now with mock API, we'll simulate login
        const mockToken = 'mock-oauth-token-' + Date.now();
        onLogin();
    };

    return (
        <div className="auth-view">
            <div className="auth-view__logo">
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

            <h1 className="auth-view__title">Welcome to Verba</h1>
            <p className="auth-view__description">
                AI-powered text enhancement at your fingertips
            </p>

            <button className="auth-view__button" onClick={handleLogin}>
                Sign in to Continue
            </button>

            <p className="auth-view__footer">
                Select text on any webpage, right-click, and enhance with AI
            </p>
        </div>
    );
}
