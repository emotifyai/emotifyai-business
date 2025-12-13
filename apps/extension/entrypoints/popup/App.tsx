import { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from './hooks/useAuth';
import { useSubscription } from './hooks/useSubscription';
import AuthView from './components/AuthView';
import { loginWithGoogle, logout, validateSession } from '@/services/api/auth';
import { setUserProfile } from '@/utils/storage';
import { startMockAPI } from '@/mocks/browser';

// Lazy load heavy components
const Dashboard = lazy(() => import('./components/Dashboard'));
const Settings = lazy(() => import('./components/Settings'));

type View = 'dashboard' | 'settings';

function App() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const subscription = useSubscription();
  const [currentView, setCurrentView] = useState<View>('dashboard');

  useEffect(() => {
    // Start mock API in development
    if (import.meta.env.DEV) {
      startMockAPI().catch(console.error);
    }
  }, []);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      // State will update automatically via useAuth hook watching storage
    } catch (error) {
      console.error('Login failed:', error);
      // Error is handled in AuthView
      throw error;
    }
  };

  // Check for authentication when popup opens (in case user authenticated in web app)
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      const checkAuth = async () => {
        try {
          const session = await validateSession();
          if (session.valid && session.user) {
            // User is authenticated in web app, update extension state
            await setUserProfile(session.user);
            // Force re-render by triggering storage change
            window.location.reload();
          }
        } catch (error) {
          // Ignore errors - user is not authenticated
        }
      };
      
      // Check immediately and then every 2 seconds for 10 seconds
      checkAuth();
      const interval = setInterval(checkAuth, 2000);
      setTimeout(() => clearInterval(interval), 10000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isLoading]);

  const handleLogout = async () => {
    await logout();
    setCurrentView('dashboard');
  };

  if (isLoading) {
    return (
      <div className="w-[380px] min-h-[500px] bg-white text-gray-800 flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-gray-200 border-t-[#667eea] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-[380px] min-h-[500px] bg-white text-gray-800">
        <AuthView onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="w-[380px] min-h-[500px] bg-white text-gray-800">
      <Suspense fallback={
        <div className="w-[380px] min-h-[500px] bg-white text-gray-800 flex items-center justify-center">
          <div className="w-10 h-10 border-[3px] border-gray-200 border-t-[#667eea] rounded-full animate-spin" />
        </div>
      }>
        {currentView === 'dashboard' && user && (
          <Dashboard
            user={user}
            subscription={subscription.subscription}
            usage={subscription.usage}
            onLogout={handleLogout}
            onOpenSettings={() => setCurrentView('settings')}
          />
        )}
        {currentView === 'settings' && (
          <Settings onBack={() => setCurrentView('dashboard')} />
        )}
      </Suspense>
    </div>
  );
}

export default App;
