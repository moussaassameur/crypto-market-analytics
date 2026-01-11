import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { CryptoList } from './components/crypto/CryptoList';
import { AlertsPage } from './components/alerts/AlertsPage';
import { PortfolioPage } from './components/portfolio/PortfolioPage';
import { ForecastPage } from './components/forecast/ForecastPage';
import { Navigation } from './components/shared/Navigation';
import { authService } from './services/authService';

type Page = 'login' | 'register' | 'dashboard' | 'cryptos' | 'alerts' | 'portfolio' | 'forecast';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  // Check if user is already authenticated on mount
  useEffect(() => {
    if (authService.isAuthenticated()) {
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLogin = (email: string, name: string) => {
    setUser({ name, email });
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  const handleRegister = (email: string, name: string) => {
    setUser({ name, email });
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950">
        {currentPage === 'login' ? (
          <LoginPage 
            onLogin={handleLogin}
            onSwitchToRegister={() => setCurrentPage('register')}
          />
        ) : (
          <RegisterPage
            onRegister={handleRegister}
            onSwitchToLogin={() => setCurrentPage('login')}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        user={user}
        onLogout={handleLogout}
      />
      <main className="pt-16">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'cryptos' && <CryptoList />}
        {currentPage === 'alerts' && <AlertsPage />}
        {currentPage === 'portfolio' && <PortfolioPage />}
        {currentPage === 'forecast' && <ForecastPage />}
      </main>
    </div>
  );
}
