import type { User, Subscription, UsageStats } from '@/types';
import { SubscriptionTier } from '@/types';
import './Dashboard.css';

interface DashboardProps {
    user: User;
    subscription: Subscription | null;
    usage: UsageStats | null;
    onLogout: () => void;
    onOpenSettings: () => void;
}

export default function Dashboard({
    user,
    subscription,
    usage,
    onLogout,
    onOpenSettings,
}: DashboardProps) {
    const usagePercentage = usage
        ? Math.min((usage.used / usage.limit) * 100, 100)
        : 0;

    const getTierLabel = (tier: string) => {
        switch (tier) {
            case SubscriptionTier.TRIAL:
                return 'Trial';
            case SubscriptionTier.MONTHLY:
                return 'Monthly';
            case SubscriptionTier.LIFETIME:
                return 'Lifetime';
            default:
                return tier;
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard__header">
                <div className="dashboard__user">
                    {user.avatarUrl && (
                        <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="dashboard__avatar"
                        />
                    )}
                    <div>
                        <h2 className="dashboard__name">{user.name}</h2>
                        <p className="dashboard__email">{user.email}</p>
                    </div>
                </div>
                <button className="dashboard__settings-btn" onClick={onOpenSettings}>
                    ⚙️
                </button>
            </div>

            {subscription && (
                <div className="dashboard__subscription">
                    <div className="dashboard__tier">
                        <span className="dashboard__tier-label">
                            {getTierLabel(subscription.tier)}
                        </span>
                        <span className={`dashboard__status dashboard__status--${subscription.status}`}>
                            {subscription.status}
                        </span>
                    </div>
                </div>
            )}

            {usage && (
                <div className="dashboard__usage">
                    <div className="dashboard__usage-header">
                        <span>Usage</span>
                        <span className="dashboard__usage-count">
                            {usage.used} / {usage.limit === Infinity ? '∞' : usage.limit}
                        </span>
                    </div>
                    <div className="dashboard__usage-bar">
                        <div
                            className="dashboard__usage-fill"
                            style={{ width: `${usagePercentage}%` }}
                        />
                    </div>
                    {usage.resetDate && (
                        <p className="dashboard__usage-reset">
                            Resets {new Date(usage.resetDate).toLocaleDateString()}
                        </p>
                    )}
                </div>
            )}

            <div className="dashboard__actions">
                <button className="dashboard__action-btn dashboard__action-btn--primary">
                    Upgrade Plan
                </button>
                <button
                    className="dashboard__action-btn dashboard__action-btn--secondary"
                    onClick={onLogout}
                >
                    Sign Out
                </button>
            </div>

            <div className="dashboard__tip">
                <p><strong>Tip:</strong> Select text and press <kbd>Ctrl+Shift+E</kbd> for quick enhancement</p>
            </div>
        </div>
    );
}
