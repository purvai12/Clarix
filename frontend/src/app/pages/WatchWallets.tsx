import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { Eye, Plus, Trash2, AlertCircle, Wallet as WalletIcon, Loader2, CheckCircle2, ExternalLink, RefreshCw, Shield, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

import { supabase } from '../../lib/supabase';
import { useFeatureGate, FeatureGateBanner, FeeBadge } from '../components/FeatureGate';
import { analyzeWallet, WalletRiskAssessment } from '../../lib/gemini';
import { getWalletData } from '../../lib/stellar';

interface WatchedWallet {
  id: string;
  wallet_address: string;
  nickname: string;
  created_at: string;
}

export function WatchWallets() {
  const { user, walletAddress } = useAuth();
  
  const [wallets, setWallets] = useState<WatchedWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [address, setAddress] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const { gateState, feeHash, error: gateError, charge, reset: resetGate } = useFeatureGate();

  useEffect(() => {
    loadWallets();
  }, [user]);

  const loadWallets = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('watched_wallets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setWallets(data);
    }
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !walletAddress) return;

    setError('');
    
    // ── Step 1: charge 0.5 XLM fee ──────────────────────────────────────
    const paid = await charge();
    if (!paid) return;

    // ── Step 2: add wallet ──────────────────────────────────────────────
    setAddLoading(true);
    try {
      const { error: insertError } = await supabase.from('watched_wallets').insert({
        user_id: user.id,
        wallet_address: address,
        nickname: nickname || address.substring(0, 8) + '...',
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      ('watched_wallet_added', {
        watched_address: address,
        nickname: nickname || address.substring(0, 8) + '...',
      });
      setAddress('');
      setNickname('');
      setShowAddForm(false);
      resetGate();
      loadWallets();
    } catch (err: any) {
      Exception(err);
      setError(err.message || 'Failed to add wallet');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('watched_wallets').delete().eq('id', id);

    if (!error) {
      ('watched_wallet_removed');
      loadWallets();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
          <div>
            <div className="inline-block p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl mb-2">Watch Wallets</h1>
            <p className="text-xl text-muted-foreground">Monitor saved addresses in real-time</p>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
              <WalletIcon className="w-4 h-4 text-primary" />
              <span>Adding a wallet costs <strong className="text-primary">0.5 XLM</strong></span>
            </p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (showAddForm) resetGate();
            }}
            className="mt-4 sm:mt-0 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            {showAddForm ? <Trash2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showAddForm ? 'Cancel' : 'Add Wallet'}
          </button>
        </div>

        {/* Fee Gate Banner */}
        <FeatureGateBanner
          gateState={gateState}
          feeHash={feeHash}
          error={gateError}
          featureName="Watch Wallet"
          onReset={resetGate}
        />

        {/* Add Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <form onSubmit={handleAdd} className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl">Add New Wallet</h3>
                  <FeeBadge />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm mb-2">Wallet Address *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="GABC..."
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    disabled={addLoading || gateState === 'charging'}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Nickname (optional)</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="e.g., Personal Wallet, Exchange..."
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={addLoading || gateState === 'charging'}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={addLoading || !address.trim() || gateState === 'charging' || !walletAddress}
                    className="flex-1 bg-primary text-primary-foreground py-3 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {gateState === 'charging' ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Charging fee...</>
                    ) : addLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Adding...</>
                    ) : (
                      <>Add and Watch Wallet</>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={addLoading || gateState === 'charging'}
                    onClick={() => {
                      setShowAddForm(false);
                      setAddress('');
                      setNickname('');
                      setError('');
                      resetGate();
                    }}
                    className="px-6 py-3 border border-border rounded-full hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                {!walletAddress && (
                  <p className="text-xs text-destructive text-center">Connect your wallet to add watched wallets.</p>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wallets List */}
        {wallets.length === 0 ? (
          <div className="bg-muted/50 border border-border rounded-2xl p-12 text-center">
            <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl mb-2">No wallets being watched</h3>
            <p className="text-muted-foreground mb-6">
              Add wallet addresses to monitor for suspicious activity
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Your First Wallet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wallets.map((wallet, index) => (
              <WatchlistCard key={wallet.id} wallet={wallet} index={index} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function WatchlistCard({ wallet, index, onDelete }: { wallet: WatchedWallet, index: number, onDelete: (id: string) => void }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<WalletRiskAssessment | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [opsCount, setOpsCount] = useState<number>(0);

  const performAnalysis = async () => {
    setLoading(true);
    try {
      const data = await getWalletData(wallet.wallet_address);
      const risk = await analyzeWallet(wallet.wallet_address, data);
      setAssessment(risk);
      setBalance(data.balance);
      setOpsCount(data.transactions.length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performAnalysis();
  }, [wallet.wallet_address]);

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'low':      return 'text-green-500';
      case 'medium':   return 'text-yellow-500';
      case 'high':     return 'text-orange-500';
      case 'critical': return 'text-red-500';
      default:         return 'text-muted-foreground';
    }
  };

  const getRiskBgColor = (level?: string) => {
    switch (level) {
      case 'low':      return 'bg-green-500/10';
      case 'medium':   return 'bg-yellow-500/10';
      case 'high':     return 'bg-orange-500/10';
      case 'critical': return 'bg-red-500/10';
      default:         return 'bg-muted/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors group relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-robotic truncate">{wallet.nickname}</h3>
            {assessment && !loading && (
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-current ${getRiskColor(assessment.riskLevel)}`}>
                {assessment.riskLevel}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-mono break-all line-clamp-1">
            {wallet.wallet_address}
          </p>
        </div>
        <button
          onClick={() => onDelete(wallet.id)}
          className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors ml-2"
          aria-label="Delete wallet"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase font-robotic mb-1">Trust Score</p>
          {loading ? (
            <div className="h-6 w-12 bg-muted animate-pulse rounded mx-auto" />
          ) : (
            <p className={`text-xl font-bold font-robotic ${getRiskColor(assessment?.riskLevel)}`}>
              {assessment?.riskScore ?? '--'}
            </p>
          )}
        </div>
        <div className="text-center border-x border-border">
          <p className="text-[10px] text-muted-foreground uppercase font-robotic mb-1">Balance</p>
          {loading ? (
            <div className="h-6 w-16 bg-muted animate-pulse rounded mx-auto" />
          ) : (
            <p className="text-xl font-bold font-robotic">
              {parseFloat(balance).toLocaleString(undefined, { maximumFractionDigits: 1 })}
              <span className="text-[10px] ml-0.5 opacity-50">XLM</span>
            </p>
          )}
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase font-robotic mb-1">Operations</p>
          {loading ? (
            <div className="h-6 w-8 bg-muted animate-pulse rounded mx-auto" />
          ) : (
            <p className="text-xl font-bold font-robotic">{opsCount}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          {loading ? (
            <RefreshCw className="w-3 h-3 text-muted-foreground animate-spin" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          )}
          <span className="text-xs text-muted-foreground font-medium">
            {loading ? 'Analyzing...' : 'Live Monitoring'}
          </span>
        </div>
        
        <button 
          onClick={() => navigate(`/app/scanner?address=${wallet.wallet_address}`)}
          className="text-[10px] text-primary uppercase font-robotic font-bold flex items-center gap-1 hover:underline"
        >
          <Zap className="w-3 h-3" /> Re-scan
        </button>
      </div>
    </motion.div>
  );
}
