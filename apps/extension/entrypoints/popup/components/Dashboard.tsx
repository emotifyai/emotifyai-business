import type { User, Subscription, UsageStats } from '@/types';
import './Dashboard.css';

interface DashboardProps {
    user: User;
    subscription: Subscription | null;
    usage: UsageStats | null;
    onLogout: () => void;
    onOpenSettings: () => void;
}

const WEB_APP_URL = import.meta.env.VITE_WEB_APP_URL || 'https://verba.app';

function Dashboard({ user, subscription, usage, onLogout, onOpenSettings }: DashboardProps) {
    const isTrialUser = subscription?.tier === 'trial';
    const hasUsage = usage && usage.used > 0;

    const openWebApp = (path: string = '') => {
        browser.tabs.create({ url: `${WEB_APP_URL}${path}` });
    };

    return (
        <div className="dashboard">
            {/* Header */}
            <div className="dashboard__header">
                <div className="dashboard__user">
                    <div className="dashboard__avatar">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} />
                        ) : (
                            <div className="dashboard__avatar-placeholder">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="dashboard__user-info">
                        <h2 className="dashboard__user-name">{user.name}</h2>
                        <p className="dashboard__user-email">{user.email}</p>
                    </div>
                </div>
                <button className="dashboard__settings-btn" onClick={onOpenSettings} title="Settings">
                    ⚙️
                </button>
            </div>

            {/* Subscription Status */}
            <div className="dashboard__section">
                <h3 className="dashboard__section-title">Subscription</h3>
                <div className={`dashboard__subscription dashboard__subscription--${subscription?.tier || 'trial'}`}>
                    <div className="dashboard__subscription-info">
                        <span className="dashboard__subscription-tier">
                            {subscription?.tier === 'trial' && '🎯 Trial'}
                            {subscription?.tier === 'monthly' && '⭐ Monthly'}
                            {subscription?.tier === 'lifetime' && '💎 Lifetime'}
                        </span>
                        <span className="dashboard__subscription-status">
                            {subscription?.status === 'active' ? '✓ Active' : '⚠ Inactive'}
                        </span>
                    </div>

                    {/* Upgrade CTA for Trial Users */}
                    {isTrialUser && (
                        <div className="dashboard__upgrade-cta">
                            <p className="dashboard__upgrade-message">
                                Unlock unlimited enhancements!
                            </p>
                            <div className="dashboard__upgrade-buttons">
                                <button
                                    className="dashboard__upgrade-btn dashboard__upgrade-btn--primary"
                                    onClick={() => openWebApp('/pricing')}
                                >
                                    Upgrade Now
                                </button>
                                <button
                                    className="dashboard__upgrade-btn dashboard__upgrade-btn--secondary"
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
                            className="dashboard__manage-btn"
                            onClick={() => openWebApp('/account/subscription')}
                        >
                            Manage Subscription
                        </button>
                    )}
                </div>
            </div>

            {/* Usage Stats */}
            <div className="dashboard__section">
                <h3 className="dashboard__section-title">Usage</h3>

                {/* Empty State for New Users */}
                {!hasUsage ? (
                    <div className="dashboard__empty-state">
                        <div className="dashboard__empty-icon">✨</div>
                        <h4 className="dashboard__empty-title">Ready to enhance your text!</h4>
                        <p className="dashboard__empty-message">
                            Select any text on a webpage, right-click, and choose "Enhance with Verba" to get started.
                        </p>
                        <div className="dashboard__empty-tips">
                            <p className="dashboard__tip">💡 <strong>Tip:</strong> Use <kbd>Ctrl+Shift+E</kbd> for quick access</p>
                        </div>
                    </div>
                ) : (
                    <div className="dashboard__usage">
                        <div className="dashboard__usage-stats">
                            <div className="dashboard__usage-stat">
                                <span className="dashboard__usage-label">Used</span>
                                <span className="dashboard__usage-value">{usage.used}</span>
                            </div>
                            <div className="dashboard__usage-stat">
                                <span className="dashboard__usage-label">Limit</span>
                                <span className="dashboard__usage-value">
                                    {usage.limit === -1 ? '∞' : usage.limit}
                                </span>
                            </div>
                        </div>

                        {usage.limit !== -1 && (
                            <div className="dashboard__usage-bar">
                                <div
                                    className="dashboard__usage-progress"
                                    style={{ width: `${Math.min((usage.used / usage.limit) * 100, 100)}%` }}
                                />
                            </div>
                        )}

                        {usage.lastUsed && (
                            <p className="dashboard__usage-last">
                                Last used: {new Date(usage.lastUsed).toLocaleDateString()}
                            </p>
                        )}

                        {/* Warning when approaching limit */}
                        {isTrialUser && usage.limit !== -1 && usage.used >= usage.limit * 0.8 && (
                            <div className="dashboard__usage-warning">
                                ⚠️ You're running low on enhancements.
                                <button
                                    className="dashboard__usage-warning-link"
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
            <div className="dashboard__section">
                <h3 className="dashboard__section-title">Quick Actions</h3>
                <div className="dashboard__actions">
                    <button
                        className="dashboard__action-btn"
                        onClick={() => openWebApp('/dashboard')}
                    >
                        <span className="dashboard__action-icon">📊</span>
                        <span className="dashboard__action-text">View Full Dashboard</span>
                    </button>
                    <button
                        className="dashboard__action-btn"
                        onClick={() => openWebApp('/help')}
                    >
                        <span className="dashboard__action-icon">❓</span>
                        <span className="dashboard__action-text">Get Help</span>
                    </button>
                </div>
            </div>

            {/* Logout */}
            <div className="dashboard__footer">
                <button className="dashboard__logout-btn" onClick={onLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Dashboard;
