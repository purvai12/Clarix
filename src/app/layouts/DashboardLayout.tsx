import { Outlet, Navigate, Link, useLocation } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Scan, AlertTriangle, Eye, GitCompare, User, LogOut, Menu, X, Sun, Moon, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { GlobalChatbot } from '../components/GlobalChatbot';
import { Footer } from '../components/Footer';
import { useTheme } from 'next-themes';

export function DashboardLayout() {
  const { user, profile, loading, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  const navItems = [
    { path: '/app', label: 'Dashboard', icon: Shield },
    { path: '/app/scanner', label: 'Scanner', icon: Scan },
    { path: '/app/report', label: 'Report', icon: AlertTriangle },
    { path: '/app/watch', label: 'Watch', icon: Eye },
    { path: '/app/compare', label: 'Compare', icon: GitCompare },
    { path: '/app/docs', label: 'Docs', icon: BookOpen },
  ];

  return (
    <div className="size-full flex flex-col bg-background">
      {/* Top Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/app" className="flex items-center gap-2 group">
              <Shield className="w-8 h-8 text-primary transition-transform group-hover:scale-110" />
              <span className="text-xl font-robotic tracking-wider uppercase">Clarix</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Theme Toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-full hover:bg-muted transition-all border border-transparent hover:border-border"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-primary" />}
                </button>
              )}

              {/* User Profile */}
              <div className="flex items-center gap-4">
                <Link
                  to="/app/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">{profile?.username || 'Profile'}</span>
                  {profile?.is_verified && (
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  )}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-full hover:bg-muted transition-colors hidden md:block"
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-full hover:bg-muted transition-colors md:hidden"
                  aria-label="Menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
      </main>

      {/* Global Chatbot */}
      <GlobalChatbot />
    </div>
  );
}
