import { useState } from 'react';

interface AuthViewProps {
    onLogin: () => void;
}

export default function AuthView({ onLogin }: AuthViewProps) {
    const [isLoading, setIsLoading] = useState<'login' | 'signup' | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        setIsLoading('login');
        setError(null);
        try {
            // Open login page in new tab with extension callback
            const loginUrl = `${import.meta.env.VITE_WEB_APP_URL}/login?source=extension&redirect_to=/auth/extension-success`;
            await browser.tabs.create({ url: loginUrl });
            window.close();
        } catch (err) {
            setError('Failed to open login page. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(null);
        }
    };

    const handleSignup = async () => {
        setIsLoading('signup');
        setError(null);
        try {
            // Open signup page in new tab with extension callback and trial plan selection
            const signupUrl = `${import.meta.env.VITE_WEB_APP_URL}/signup?source=extension&plan=trial&redirect_to=/auth/extension-success`;
            console.log('🦆 DUCK: Opening signup URL:', signupUrl);
            await browser.tabs.create({ url: signupUrl });
            window.close();
        } catch (err) {
            console.log('🦆 DUCK: ❌ Failed to open signup page:', err);
            setError('Failed to open signup page. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center h-full bg-background text-foreground">
            <div className="mb-6 animate-float">
                <svg width="64" height="64" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="emotifyai-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#7C3AED" />
                            <stop offset="100%" stopColor="#06B6D4" />
                        </linearGradient>
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="15" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    
                    {/* Background */}
                    <rect width="512" height="512" rx="120" fill="#030712" />
                    
                    {/* The "E" Logo - Geometric and Modern */}
                    <path 
                        d="M140 140 H380 V195 H205 V240 H350 V290 H205 V335 H380 V390 H140 Z" 
                        fill="url(#emotifyai-gradient)" 
                        filter="url(#glow)"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="2"
                    />
                    
                    {/* Digital Accent Dot */}
                    <circle cx="256" cy="80" r="15" fill="#06B6D4" filter="url(#glow)" />
                </svg>
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to EmotifyAI</h1>
            <p className="text-sm text-muted-foreground mb-8 max-w-[240px] leading-relaxed">
                AI-powered text enhancement at your fingertips
            </p>

            <div className="w-full max-w-[280px] space-y-3 mb-6">
                {/* Create Account Button */}
                <button
                    className="flex items-center justify-center w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium cursor-pointer transition-all shadow-sm hover:bg-primary/90 hover:-translate-y-px hover:shadow-md active:translate-y-0 active:shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    onClick={handleSignup}
                    disabled={isLoading !== null}
                >
                    {isLoading === 'signup' ? (
                        <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></span>
                    ) : (
                        <svg className="mr-2" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                        </svg>
                    )}
                    <span>{isLoading === 'signup' ? 'Opening...' : 'Create Account'}</span>
                </button>

                {/* Login Button */}
                <button
                    className="flex items-center justify-center w-full px-4 py-3 bg-secondary border border-border rounded-lg text-sm font-medium text-secondary-foreground cursor-pointer transition-all shadow-sm hover:bg-secondary/80 hover:border-border hover:-translate-y-px hover:shadow-md active:translate-y-0 active:shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    onClick={handleLogin}
                    disabled={isLoading !== null}
                >
                    {isLoading === 'login' ? (
                        <span className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin mr-2"></span>
                    ) : (
                        <svg className="mr-2" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path fillRule="evenodd" d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0v-2z"/>
                            <path fillRule="evenodd" d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                        </svg>
                    )}
                    <span>{isLoading === 'login' ? 'Opening...' : 'Login'}</span>
                </button>
            </div>

            {error && <p className="text-destructive text-xs -mt-4 mb-4">{error}</p>}

            <p className="text-xs text-muted-foreground max-w-[200px] leading-snug">
                Select text on any webpage, right-click, and enhance with AI
            </p>
        </div>
    );
}
