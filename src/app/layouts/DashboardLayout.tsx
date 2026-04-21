import { Outlet, Navigate, Link, useLocation } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import {
  Shield, Scan, AlertTriangle, Eye, GitCompare,
  User, LogOut, Menu, X, Sun, Moon, BookOpen,
  Wallet, RefreshCw, BarChart3,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { GlobalChatbot } from '../components/GlobalChatbot';
import { Footer } from '../components/Footer';
import { useTheme } from 'next-themes';
import { stellarExpertAccountUrl } from '../../lib/stellar';

export function DashboardLayout() {
  const { user, profile, loading, walletAddress, xlmBalance, signOut, connectWallet, refreshBalance } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted]             = useState(false);
  const location                          = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [balanceRefreshing, setBalanceRefreshing] = useState(false);

  useEffect(() => setMounted(true), []);

  // Show wallet-connect modal if user is authed but has no wallet
  useEffect(() => {
    if (!loading && user && !walletAddress) {
      setWalletModalOpen(true);
    } else {
      setWalletModalOpen(false);
    }
  }, [loading, user, walletAddress]);

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
    { path: '/app',          label: 'Dashboard', icon: Shield    },
    { path: '/app/scanner',  label: 'Scanner',   icon: Scan      },
    { path: '/app/report',   label: 'Report',    icon: AlertTriangle },
    { path: '/app/watch',    label: 'Watch',     icon: Eye       },
    { path: '/app/compare',  label: 'Compare',   icon: GitCompare },
    { path: '/app/metrics',  label: 'Metrics',   icon: BarChart3 },
    { path: '/app/docs',     label: 'Docs',      icon: BookOpen  },
  ];

  const handleConnectWallet = async () => {
    setWalletLoading(true);
    try {
      await connectWallet();
      setWalletModalOpen(false);
    } catch { /* ignore */ }
    finally { setWalletLoading(false); }
  };

  const handleRefreshBalance = async () => {
    setBalanceRefreshing(true);
    await refreshBalance();
    setBalanceRefreshing(false);
  };

  return (
    <div className="size-full flex flex-col bg-background">
      {/* ── Top Navigation ─────────────────────────────────────────────── */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/app" className="flex items-center gap-2 group">
              <Shield className="w-8 h-8 text-primary transition-transform group-hover:scale-110" />
              <span className="text-xl font-robotic tracking-wider uppercase">Clarix</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navItems.map((item) => {
                const Icon     = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium uppercase tracking-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* XLM Balance chip */}
              {walletAddress && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-sm">
                  <Wallet className="w-4 h-4 text-primary" />
                  {xlmBalance !== null ? (
                    <span className="font-mono font-medium">
                      {parseFloat(xlmBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      <span className="text-xs text-muted-foreground ml-1">XLM</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                  <button
                    onClick={handleRefreshBalance}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    title="Refresh balance"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${balanceRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                  <a
                    href={stellarExpertAccountUrl(walletAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors text-xs"
                    title="View on Stellar Expert"
                  >
                    ↗
                  </a>
                </div>
              )}

              {/* Theme Toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-full hover:bg-muted transition-all border border-transparent hover:border-border"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark'
                    ? <Sun  className="w-5 h-5 text-yellow-500" />
                    : <Moon className="w-5 h-5 text-primary" />}
                </button>
              )}

              {/* Profile + Sign-out */}
              <div className="flex items-center gap-2">
                <Link
                  to="/app/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">{profile?.username || 'Profile'}</span>
                  {profile?.is_verified && (
                    <span className="w-2 h-2 rounded-full bg-green-500" />
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
              {/* Mobile balance */}
              {walletAddress && xlmBalance !== null && (
                <div className="flex items-center gap-2 px-4 py-2 mb-2 text-sm">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="font-mono font-medium">
                    {parseFloat(xlmBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })} XLM
                  </span>
                </div>
              )}
              <div className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon     = item.icon;
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
                  onClick={() => { signOut(); setMobileMenuOpen(false); }}
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

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
      </main>

      {/* ── Global Chatbot ──────────────────────────────────────────────── */}
      <GlobalChatbot />

      {/* ── Wallet Connect Modal ─────────────────────────────────────────── */}
      {walletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl mb-2">Connect your wallet</h2>
            <p className="text-muted-foreground text-sm mb-6">
              A Stellar wallet is required to use all Clarix features. Please connect to continue.
            </p>
            <button
              onClick={handleConnectWallet}
              disabled={walletLoading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Wallet className="w-5 h-5" />
              {walletLoading ? 'Connecting…' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
