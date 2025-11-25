import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useSubscription } from './hooks/useSubscription';
import AuthView from './components/AuthView';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import { startMockAPI } from '@/mocks/browser';
import './App.css';

type View = 'dashboard' | 'settings';

function App() {
  const { isAuthenticated, user, isLoading, login, logout } = useAuth();
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
      // In production, this would open OAuth flow
      // For now with mock API, simulate login
      await login('mock-oauth-token');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentView('dashboard');
  };

  if (isLoading) {
    return (
      <div className="app app--loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="app">
        <AuthView onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="app">
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
    </div>
  );
}

export default App;
