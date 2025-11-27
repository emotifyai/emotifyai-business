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
                </button >
            </div >

        <div className="dashboard__tip">
            <p><strong>Tip:</strong> Select text and press <kbd>Ctrl+Shift+E</kbd> for quick enhancement</p>
        </div>
        </div >
    );
}
