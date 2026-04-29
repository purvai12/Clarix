import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Mail, Lock, AlertCircle, Wallet, CheckCircle2, ArrowRight, Unlink } from 'lucide-react';
import { motion } from 'motion/react';

export function SignIn() {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const { signIn, connectWallet, disconnectWallet, walletAddress } = useAuth();
  const navigate = useNavigate();

  const handleConnectWallet = async () => {
    setError('');
    setWalletLoading(true);
    try {
      await connectWallet();
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setWalletLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!walletAddress) {
      setError('You must connect your Stellar wallet before signing in.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Clarix Logo" className="w-16 h-16 mx-auto mb-4 object-contain" />
          <h1 className="text-3xl mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your Clarix account</p>
        </div>

        <div className="space-y-6 bg-card p-8 rounded-2xl border border-border">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* ── Step 1: Connect Wallet ─────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${walletAddress ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground'}`}>
                {walletAddress ? '✓' : '1'}
              </span>
              <span className="text-sm font-medium">Connect your Stellar wallet</span>
              <span className="text-xs text-destructive font-medium ml-auto">Required</span>
            </div>

            {walletAddress ? (
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-green-500 font-medium">Wallet connected</p>
                  <p className="text-xs text-muted-foreground truncate font-mono">{walletAddress}</p>
                </div>
                <button
                  type="button"
                  onClick={() => disconnectWallet()}
                  className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors flex flex-col items-center gap-1"
                  title="Disconnect Wallet"
                >
                  <Unlink className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleConnectWallet}
                disabled={walletLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <Wallet className="w-5 h-5" />
                {walletLoading ? 'Connecting…' : 'Connect Wallet'}
              </button>
            )}
          </div>

          {/* ── Divider ───────────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* ── Step 2: Sign In ────────────────────────────────────────── */}
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${walletAddress ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              2
            </span>
            <span className={`text-sm font-medium ${!walletAddress ? 'text-muted-foreground' : ''}`}>
              Enter your credentials
            </span>
          </div>

          <form
            onSubmit={handleSubmit}
            className={`space-y-4 transition-opacity ${!walletAddress ? 'opacity-40 pointer-events-none' : ''}`}
          >
            <div>
              <label className="block text-sm mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !walletAddress}
              className="w-full bg-primary text-primary-foreground py-3 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {!walletAddress && (
            <p className="text-xs text-center text-muted-foreground">
              Connect your wallet above to unlock sign-in
            </p>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
