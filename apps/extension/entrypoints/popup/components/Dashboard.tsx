import type { User, Subscription, UsageStats } from '@/types';
import { browser } from 'wxt/browser';

interface DashboardProps {
    user: User;
    subscription: Subscription | null;
    usage: UsageStats | null;
    onLogout: () => void;
    onOpenSettings: () => void;
}

const WEB_APP_URL = import.meta.env.VITE_WEB_APP_URL || 'https://emotifyai.com';

function Dashboard({ user, subscription, usage, onLogout, onOpenSettings }: DashboardProps) {
    const isTrialUser = subscription?.tier === 'trial';
    const hasUsage = usage && usage.used > 0;

    const openWebApp = (path: string = '') => {
        browser.tabs.create({ url: `${WEB_APP_URL}${path}` });
    };

    return (
        <div className="p-5">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white text-xl font-bold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold m-0 text-gray-800">{user.name}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                    </div>
                </div>
                <button
                    className="p-2 border-none bg-transparent text-xl cursor-pointer rounded-lg transition-colors hover:bg-gray-100"
                    onClick={onOpenSettings}
                    title="Settings"
                >
                    ⚙️
                </button>
            </div>

            {/* Subscription Status */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Subscription</h3>
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2]">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-base font-semibold text-white">
                            {subscription?.tier === 'trial' && '🎯 Trial'}
                            {subscription?.tier === 'monthly' && '⭐ Monthly'}
                            {subscription?.tier === 'lifetime' && '💎 Lifetime'}
                        </span>
                        <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-white/30 text-white">
                            {subscription?.status === 'active' ? '✓ Active' : '⚠ Inactive'}
                        </span>
                    </div>

                    {/* Upgrade CTA for Trial Users */}
                    {isTrialUser && (
                        <div className="pt-3 border-t border-white/20">
                            <p className="text-white text-sm mb-3">
                                Unlock unlimited enhancements!
                            </p>
                            <div className="flex gap-2">
                                <button
                                    className="flex-1 p-2.5 border-none rounded-lg text-sm font-semibold cursor-pointer transition-all bg-white text-[#667eea] hover:-translate-y-px hover:shadow-lg hover:shadow-white/30"
                                    onClick={() => openWebApp('/pricing')}
                                >
                                    Upgrade Now
                                </button>
                                <button
                                    className="flex-1 p-2.5 border-none rounded-lg text-sm font-semibold cursor-pointer transition-all bg-white/20 text-white hover:bg-white/30"
                                    onClick={() => openWebApp('/pricing')}
                                >
                                    View Plans
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Manage Subscription Button for Paid Users */}
                    {!isTrialUser && (
                        <button
                            className="w-full p-2.5 mt-3 border border-white/30 bg-white/10 text-white rounded-lg text-sm font-semibold cursor-pointer transition-all hover:bg-white/20"
                            onClick={() => openWebApp('/account/subscription')}
                        >
                            Manage Subscription
                        </button>
                    )}
                </div>
            </div>

            {/* Usage Stats */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Usage</h3>

                {/* Empty State for New Users */}
                {!hasUsage ? (
                    <div className="text-center py-8 px-4 bg-gray-50 rounded-xl">
                        <div className="text-5xl mb-4">✨</div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Ready to enhance your text!</h4>
                        <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                            Select any text on a webpage, right-click, and choose "Enhance with EmotifyAI" to get started.
                        </p>
                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-600 m-0">💡 <strong>Tip:</strong> Use <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[11px] font-mono">Ctrl+Shift+E</kbd> for quick access</p>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 rounded-xl bg-gray-50">
                        <div className="flex gap-4 mb-3">
                            <div className="flex-1 flex flex-col gap-1">
                                <span className="text-xs text-gray-500 font-medium">Used</span>
                                <span className="text-2xl font-bold text-[#667eea]">{usage.used}</span>
                            </div>
                            <div className="flex-1 flex flex-col gap-1">
                                <span className="text-xs text-gray-500 font-medium">Limit</span>
                                <span className="text-2xl font-bold text-[#667eea]">
                                    {usage.limit === -1 ? '∞' : usage.limit}
                                </span>
                            </div>
                        </div>

                        {usage.limit !== -1 && (
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                                <div
                                    className="h-full bg-gradient-to-r from-[#667eea] to-[#764ba2] transition-all duration-300 ease-out"
                                    style={{ width: `${Math.min((usage.used / usage.limit) * 100, 100)}%` }}
                                />
                            </div>
                        )}

                        {usage.lastUsed && (
                            <p className="m-0 text-xs text-gray-400">
                                Last used: {new Date(usage.lastUsed).toLocaleDateString()}
                            </p>
                        )}

                        {/* Warning when approaching limit */}
                        {isTrialUser && usage.limit !== -1 && usage.used >= usage.limit * 0.8 && (
                            <div className="mt-3 p-3 bg-amber-50 rounded-lg text-xs text-amber-800">
                                ⚠️ You're running low on enhancements.
                                <button
                                    className="bg-none border-none text-amber-600 font-semibold cursor-pointer underline p-0 ml-1"
                                    onClick={() => openWebApp('/pricing')}
                                >
                                    Upgrade now
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Quick Actions</h3>
                <div className="flex flex-col gap-2">
                    <button
                        className="flex items-center gap-3 p-3 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-600 cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300"
                        onClick={() => openWebApp('/dashboard')}
                    >
                        <span className="text-xl">📊</span>
                        <span className="flex-1 text-left">View Full Dashboard</span>
                    </button>
                    <button
                        className="flex items-center gap-3 p-3 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-600 cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300"
                        onClick={() => openWebApp('/help')}
                    >
                        <span className="text-xl">❓</span>
                        <span className="flex-1 text-left">Get Help</span>
                    </button>
                </div>
            </div>

            {/* Logout */}
            <div className="pt-4 border-t border-gray-200">
                <button className="w-full p-2.5 border border-gray-200 bg-white text-gray-500 rounded-lg text-sm font-semibold cursor-pointer transition-all hover:bg-gray-50 hover:text-red-500 hover:border-red-200" onClick={onLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Dashboard;
