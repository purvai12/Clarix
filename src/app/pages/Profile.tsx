import { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { Award, CheckCircle, Loader2, AlertCircle, Wallet, Unlink, Link2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function Profile() {
  const { profile, refreshProfile, walletAddress, connectWallet, disconnectWallet } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [walletLoading, setWalletLoading] = useState(false);

  const handlePurchaseBadge = async () => {
    if (!profile) return;

    if (profile.clrx_balance < 50) {
      setError('Insufficient CLRX balance. You need 50 CLRX to purchase a verification badge.');
      return;
    }

    if (profile.is_verified) {
      setError('You are already verified!');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          clrx_balance: profile.clrx_balance - 50,
          is_verified: true,
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      await refreshProfile();
      setSuccess('Congratulations! You are now a verified contributor.');
    } catch (err: any) {
      setError(err.message || 'Failed to purchase badge');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    setError('');
    setSuccess('');
    setWalletLoading(true);
    try {
      await connectWallet();
      setSuccess('Wallet connected successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setWalletLoading(false);
    }
  };

  const handleDisconnectWallet = () => {
    disconnectWallet();
    setSuccess('Wallet disconnected.');
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Profile Header */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center text-3xl text-primary-foreground">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl">{profile.username}</h1>
                {profile.is_verified && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-500">Verified</span>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground">{profile.email}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Global feedback */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-500 rounded-lg mb-6">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {/* CLRX Balance */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary rounded-xl">
              <Award className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl">CLRX Balance</h2>
              <p className="text-muted-foreground">Your reward tokens</p>
            </div>
          </div>
          <div className="text-5xl mb-4">{profile.clrx_balance}</div>
          <p className="text-sm text-muted-foreground">
            Earn 10 CLRX for every fraud report you submit
          </p>
        </div>

        {/* Stellar Wallet Section */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-robotic uppercase tracking-tight">Stellar Wallet</h2>
              <p className="text-muted-foreground text-sm font-mono">Your connected Stellar wallet</p>
            </div>
          </div>

          {walletAddress ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <Link2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-robotic uppercase text-green-500 mb-1">Wallet Connected</p>
                  <p className="text-sm font-mono text-muted-foreground break-all">{walletAddress}</p>
                </div>
              </div>
              <button
                onClick={handleDisconnectWallet}
                className="flex items-center gap-2 px-5 py-2.5 border border-destructive/40 text-destructive rounded-full hover:bg-destructive/10 transition-all text-sm font-robotic"
              >
                <Unlink className="w-4 h-4" />
                Disconnect Wallet
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-mono">
                Connect your Stellar wallet to interact with on-chain security features.
              </p>
              <button
                onClick={handleConnectWallet}
                disabled={walletLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-robotic"
              >
                <Wallet className="w-4 h-4" />
                {walletLoading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          )}
        </div>

        {/* Verification Badge Section */}
        {!profile.is_verified && (
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl mb-2">Get Verified</h2>
                <p className="text-muted-foreground mb-4">
                  Become a verified contributor and build trust in the community. Verification badges
                  show that you're a serious fraud reporter.
                </p>

                <div className="bg-muted/50 border border-border rounded-xl p-4 mb-6">
                  <h3 className="mb-3">Benefits of verification:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        Green verification checkmark on your profile
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        Build credibility in the community
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        Show commitment to platform safety
                      </span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handlePurchaseBadge}
                  disabled={loading || profile.clrx_balance < 50}
                  className="w-full sm:w-auto px-8 py-4 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Award className="w-5 h-5" />
                      Purchase Badge (50 CLRX)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {profile.is_verified && (
          <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-transparent border border-green-500/20 rounded-2xl p-8">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="text-xl mb-1">You're Verified!</h3>
                <p className="text-muted-foreground">
                  Thank you for being a trusted member of the Clarix community.
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
