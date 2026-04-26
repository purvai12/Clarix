import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import {
  Scan, AlertTriangle, Eye, GitCompare,
  TrendingUp, Shield, Award, Wallet,
  ExternalLink, RefreshCw, Clock, CheckCircle,
} from 'lucide-react';
import { getWalletData, stellarExpertAccountUrl, stellarExpertTxUrl } from '../../lib/stellar';
import { FeeBadge } from '../components/FeatureGate';

export function Dashboard() {
  const { profile, walletAddress, xlmBalance, refreshBalance } = useAuth();
  const [recentTxs, setRecentTxs]       = useState<any[]>([]);
  const [txLoading, setTxLoading]       = useState(false);
  const [balRefreshing, setBalRefreshing] = useState(false);

  // Load recent transactions for connected wallet
  useEffect(() => {
    if (!walletAddress) return;
    setTxLoading(true);
    getWalletData(walletAddress)
      .then(({ transactions }) => setRecentTxs(transactions.slice(0, 5)))
      .catch(() => setRecentTxs([]))
      .finally(() => setTxLoading(false));
  }, [walletAddress]);

  const handleRefresh = async () => {
    setBalRefreshing(true);
    await refreshBalance();
    if (walletAddress) {
      const { transactions } = await getWalletData(walletAddress);
      setRecentTxs(transactions.slice(0, 5));
    }
    setBalRefreshing(false);
  };

  const features = [
    {
      icon: Scan,
      title: 'AI Wallet Scanner',
      description: 'Instant risk assessment for any Stellar address',
      path: '/app/scanner',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: AlertTriangle,
      title: 'Report Fraud',
      description: 'Submit on-chain fraud reports and earn 10 XLM',
      path: '/app/report',
      gradient: 'from-red-500 to-orange-500',
    },
    {
      icon: Eye,
      title: 'Watch Wallets',
      description: 'Monitor saved addresses in real-time',
      path: '/app/watch',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: GitCompare,
      title: 'Compare Wallets',
      description: 'Side-by-side risk comparison',
      path: '/app/compare',
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }} className="mb-8"
      >
        <h1 className="text-4xl md:text-5xl mb-4">Welcome back, {profile?.username}</h1>
        <p className="text-xl text-muted-foreground">Your AI-powered wallet safety dashboard</p>
      </motion.div>

      {/* Onboarding Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 mb-10"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="p-4 bg-primary rounded-xl flex-shrink-0">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-robotic uppercase tracking-tight mb-2">Getting Started</h2>
            <p className="text-muted-foreground text-sm mb-4">New here? Follow these three steps to get the most out of Clarix:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                <span className="text-sm font-medium">Connect your Stellar wallet</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                <span className="text-sm font-medium">Scan any wallet address</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                <span className="text-sm font-medium">Report fraud &amp; earn rewards</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        {/* XLM Balance */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Wallet className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm text-muted-foreground">XLM Balance</span>
            </div>
            <button
              onClick={handleRefresh}
              title="Refresh"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${balRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-3xl font-mono font-bold">
            {xlmBalance !== null
              ? parseFloat(xlmBalance).toLocaleString(undefined, { maximumFractionDigits: 4 })
              : '—'}
            <span className="text-sm text-muted-foreground ml-2">XLM</span>
          </p>
          {walletAddress && (
            <a
              href={stellarExpertAccountUrl(walletAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
            >
              View on Stellar Expert <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* CLRX Balance */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">CLRX Balance</span>
          </div>
          <p className="text-3xl">{profile?.clrx_balance || 0}</p>
        </div>

        {/* Verification */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Shield className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-sm text-muted-foreground">Verification Status</span>
          </div>
          <p className="text-3xl">
            {profile?.is_verified ? (
              <span className="flex items-center gap-2">
                <span className="text-green-500">Verified</span>
                <span className="w-3 h-3 rounded-full bg-green-500" />
              </span>
            ) : (
              <span className="text-muted-foreground">Not Verified</span>
            )}
          </p>
          {!profile?.is_verified && (
            <Link to="/app/profile" className="text-xs text-primary hover:underline mt-2 inline-block">
              Spend 50 CLRX to verify →
            </Link>
          )}
        </div>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              <Link to={feature.path}>
                <div className="group relative bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-all overflow-hidden">
                  <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity rounded-full blur-3xl`} />
                  <div className="relative z-10">
                    <div className="mb-4 flex items-start justify-between">
                      <div className={`inline-block p-3 bg-gradient-to-br ${feature.gradient} rounded-xl`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {/* Fee badge only on scanner / watch / compare */}
                      {feature.path !== '/app/report' && <FeeBadge />}
                    </div>
                    <h3 className="text-xl mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Transactions */}
      {walletAddress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-card border border-border rounded-2xl p-6 mb-12"
        >
          <h3 className="text-lg mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Recent Transactions
            <span className="text-xs text-muted-foreground ml-auto font-normal">Your connected wallet</span>
          </h3>

          {txLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : recentTxs.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No transactions found.</p>
          ) : (
            <div className="space-y-2">
              {recentTxs.map((tx: any) => (
                <a
                  key={tx.hash}
                  href={stellarExpertTxUrl(tx.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted/60 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {tx.successful
                      ? <CheckCircle className="w-4 h-4 text-green-500" />
                      : <AlertTriangle className="w-4 h-4 text-red-500" />}
                    <span className="font-mono text-sm text-muted-foreground">
                      {tx.hash.substring(0, 12)}…
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </a>
              ))}
            </div>
          )}

          <a
            href={stellarExpertAccountUrl(walletAddress)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-4"
          >
            View full history on Stellar Expert <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </motion.div>
      )}

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-8"
      >
        <h3 className="text-xl mb-2">Earn 10 XLM by reporting fraud</h3>
        <p className="text-muted-foreground mb-4">
          Every verified fraud report earns you 10 XLM tokens automatically via the ClarixGateway
          Soroban smart contract on Stellar Testnet.
        </p>
        <Link to="/app/report" className="inline-flex items-center gap-2 text-primary hover:underline">
          Report fraud now →
        </Link>
      </motion.div>
    </div>
  );
}
