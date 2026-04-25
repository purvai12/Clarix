import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GitCompare, Loader2, Wallet as WalletIcon, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { analyzeWallet, WalletRiskAssessment } from '../../lib/gemini';
import { useAuth } from '../../contexts/AuthContext';
import { useFeatureGate, FeatureGateBanner, FeeBadge } from '../components/FeatureGate';
import { getWalletData, stellarExpertAccountUrl, stellarExpertTxUrl } from '../../lib/stellar';

export function CompareWallets() {
  const { walletAddress } = useAuth();
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [loading, setLoading] = useState(false);
  const [assessment1, setAssessment1] = useState<WalletRiskAssessment | null>(null);
  const [assessment2, setAssessment2] = useState<WalletRiskAssessment | null>(null);
  const [data1, setData1] = useState<{ balance: string; transactions: any[] } | null>(null);
  const [data2, setData2] = useState<{ balance: string; transactions: any[] } | null>(null);
  const [error, setError] = useState('');

  const { gateState, feeHash, error: gateError, charge, reset: resetGate } = useFeatureGate();

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address1.trim() || !address2.trim()) return;

    setError('');
    setAssessment1(null);
    setAssessment2(null);
    setData1(null);
    setData2(null);

    // ── Step 1: charge 0.5 XLM fee ──────────────────────────────────────
    const paid = await charge();
    if (!paid) return;

    // ── Step 2: run comparison ──────────────────────────────────────────
    setLoading(true);
    try {
      const [blockData1, blockData2] = await Promise.all([
        getWalletData(address1),
        getWalletData(address2),
      ]);

      setData1(blockData1);
      setData2(blockData2);

      const [result1, result2] = await Promise.all([
        analyzeWallet(address1, blockData1),
        analyzeWallet(address2, blockData2),
      ]);

      setAssessment1(result1);
      setAssessment2(result2);
    } catch (err: any) {
      setError(err.message || 'Failed to compare wallets');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-orange-500';
      case 'critical': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500/10 border-green-500/20';
      case 'medium': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'high': return 'bg-orange-500/10 border-orange-500/20';
      case 'critical': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-muted border-border';
    }
  };

  const renderAssessmentCard = (
    assessment: WalletRiskAssessment | null,
    address: string,
    label: string,
    blockchainData: { balance: string; transactions: any[] } | null
  ) => {
    if (!assessment) return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg text-muted-foreground mb-2 font-robotic tracking-widest uppercase">{label}</h3>
          <p className="text-xs font-mono text-muted-foreground break-all bg-muted/50 p-2 rounded border border-border">{address}</p>
          <a
            href={stellarExpertAccountUrl(address)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-2"
          >
            Open in Stellar Expert <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>

        {/* Blockchain Data Summary */}
        {blockchainData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-background border border-border rounded-xl p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Balance</p>
              <p className="text-sm font-robotic font-bold">
                {parseFloat(blockchainData.balance).toLocaleString()} <span className="text-[10px] text-primary">XLM</span>
              </p>
            </div>
            <div className="bg-background border border-border rounded-xl p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">History</p>
              <p className="text-sm font-robotic font-bold">
                {blockchainData.transactions.length} <span className="text-[10px] text-muted-foreground uppercase">Txs</span>
              </p>
            </div>
          </div>
        )}

        {/* Risk Score Circle */}
        <div className="flex justify-center">
          <div className="relative">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted" />
              <motion.circle
                cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="6" fill="none"
                initial={{ strokeDasharray: '0 301.59' }}
                animate={{ strokeDasharray: `${(assessment.riskScore / 100) * 301.59} 301.59` }}
                className={getRiskColor(assessment.riskLevel)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-robotic font-bold">{assessment.riskScore}</div>
                <div className="text-[10px] text-muted-foreground uppercase font-robotic">Score</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <span className={`inline-block px-4 py-1.5 rounded-full uppercase tracking-widest text-[10px] font-robotic font-bold ${getRiskBgColor(assessment.riskLevel)} border`}>
            {assessment.riskLevel} Risk
          </span>
        </div>

        {/* Summary */}
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground leading-relaxed italic">"{assessment.summary}"</p>
        </div>

        {/* Recent Txs */}
        {blockchainData && blockchainData.transactions.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
              Recent Tx Explorer
            </p>
            {blockchainData.transactions.slice(0, 2).map((tx: any) => (
              <a
                key={tx.hash}
                href={tx.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 bg-muted/30 rounded-lg hover:bg-muted/60 transition-colors group"
              >
                <span className="font-mono text-[10px] text-muted-foreground">{tx.hash.substring(0, 10)}...</span>
                <ExternalLink className="w-2.5 h-2.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-4">
            <GitCompare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl mb-2 font-robotic tracking-tight uppercase">Compare Wallets</h1>
          <p className="text-xl text-muted-foreground mb-4 font-light">
            Side-by-side risk comparison of two Stellar addresses
          </p>
          <div className="flex justify-center">
            <FeeBadge />
          </div>
        </div>

        {/* Fee Gate Banner */}
        <FeatureGateBanner
          gateState={gateState}
          feeHash={feeHash}
          error={gateError}
          featureName="Wallet Comparison"
          onReset={resetGate}
        />

        {/* Compare Form */}
        <form onSubmit={handleCompare} className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest text-muted-foreground font-robotic">First Wallet Address</label>
              <input
                type="text"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                placeholder="GABC..."
                className="w-full px-6 py-4 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm shadow-sm"
                disabled={loading || gateState === 'charging'}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest text-muted-foreground font-robotic">Second Wallet Address</label>
              <input
                type="text"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                placeholder="GXYZ..."
                className="w-full px-6 py-4 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm shadow-sm"
                disabled={loading || gateState === 'charging'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !address1.trim() || !address2.trim() || gateState === 'charging' || !walletAddress}
            className="w-full px-8 py-5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-robotic font-bold uppercase tracking-widest text-sm shadow-lg shadow-primary/20"
          >
            {gateState === 'charging' ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Charging Access Fee...</>
            ) : loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Blockchain Data...</>
            ) : (
              <>
                <GitCompare className="w-5 h-5" />
                Run AI Comparison
              </>
            )}
          </button>
          {!walletAddress && (
            <p className="text-xs text-destructive text-center mt-4 font-medium uppercase tracking-tighter">Connect your wallet to analyze and compare wallets</p>
          )}
        </form>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl mb-8"
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </motion.div>
        )}

        {/* Comparison Results */}
        <AnimatePresence>
          {assessment1 && assessment2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <div className="bg-card border border-border rounded-2xl p-8 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                  <Shield className="w-20 h-20" />
                </div>
                {renderAssessmentCard(assessment1, address1, 'Primary Wallet', data1)}
              </div>

              <div className="bg-card border border-border rounded-2xl p-8 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                  <Shield className="w-20 h-20" />
                </div>
                {renderAssessmentCard(assessment2, address2, 'Comparison Wallet', data2)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Winner Banner */}
        {assessment1 && assessment2 && assessment1.riskScore !== assessment2.riskScore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent border border-green-500/20 rounded-3xl p-10 text-center shadow-inner"
          >
            <div className="inline-block p-3 bg-green-500/10 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-3xl font-robotic uppercase tracking-tight mb-3">
              Verdict: {assessment1.riskScore < assessment2.riskScore ? 'Wallet 1' : 'Wallet 2'} is more trustworthy
            </h3>
            <p className="text-lg text-muted-foreground font-light">
              This address has a <span className="text-green-500 font-bold">{Math.abs(assessment2.riskScore - assessment1.riskScore)} points</span> lower risk profile based on AI pattern analysis.
            </p>
          </motion.div>
        )}

        {/* Info Box */}
        {!assessment1 && !assessment2 && !loading && gateState === 'idle' && (
          <div className="bg-muted/50 border border-border rounded-3xl p-12 text-center max-w-4xl mx-auto shadow-inner">
            <GitCompare className="w-16 h-16 mx-auto mb-6 text-muted-foreground opacity-30" />
            <h3 className="text-2xl mb-4 font-robotic uppercase tracking-widest text-muted-foreground">Compare Security Profiles</h3>
            <p className="text-muted-foreground text-lg font-light leading-relaxed">
              Our AI engine deep-scans account metadata, payment paths, and transaction frequency to help you compare two Stellar addresses side-by-side. 
              <br/><br/>
              A <strong className="text-primary font-bold">0.5 XLM fee</strong> applies per comparison request.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Dummy Shield icon since it was used in code but not imported
function Shield({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
    </svg>
  );
}
