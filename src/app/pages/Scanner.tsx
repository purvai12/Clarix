import { useState } from 'react';
import { motion } from 'motion/react';
import { Scan, Loader2, Shield, AlertTriangle, CheckCircle, Info, ExternalLink } from 'lucide-react';
import { analyzeWallet, WalletRiskAssessment } from '../../lib/gemini';
import { getWalletData, stellarExpertTxUrl, stellarExpertAccountUrl } from '../../lib/stellar';
import { History, Wallet as WalletIcon, Clock } from 'lucide-react';
import { useFeatureGate, FeatureGateBanner } from '../components/FeatureGate';
import { useAuth } from '../../contexts/AuthContext';

export function Scanner() {
  const { walletAddress } = useAuth();
  const [address, setAddress]           = useState('');
  const [loading, setLoading]           = useState(false);
  const [assessment, setAssessment]     = useState<WalletRiskAssessment | null>(null);
  const [blockchainData, setBlockchainData] = useState<{ balance: string; transactions: any[] } | null>(null);
  const [error, setError]               = useState('');

  const { gateState, feeHash, error: gateError, charge, reset: resetGate } = useFeatureGate();

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setError('');
    setAssessment(null);
    setBlockchainData(null);

    // ── Step 1: charge 0.5 XLM fee ──────────────────────────────────────
    const paid = await charge();
    if (!paid) return;

    // ── Step 2: run scan ─────────────────────────────────────────────────
    setLoading(true);
    try {
      const data   = await getWalletData(address);
      setBlockchainData(data);
      const result = await analyzeWallet(address, data);
      setAssessment(result);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze wallet');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':      return 'text-green-500';
      case 'medium':   return 'text-yellow-500';
      case 'high':     return 'text-orange-500';
      case 'critical': return 'text-red-500';
      default:         return 'text-muted-foreground';
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case 'low':      return 'bg-green-500/10';
      case 'medium':   return 'bg-yellow-500/10';
      case 'high':     return 'bg-orange-500/10';
      case 'critical': return 'bg-red-500/10';
      default:         return 'bg-muted';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4">
            <Scan className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl mb-4">AI Wallet Scanner</h1>
          <p className="text-xl text-muted-foreground">
            Get instant AI-powered risk assessment for any Stellar address
          </p>
          <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-1">
            <WalletIcon className="w-4 h-4 text-primary" />
            <span>Costs <strong className="text-primary">0.5 XLM</strong> per scan</span>
          </p>
        </div>

        {/* Fee Gate Banner */}
        <FeatureGateBanner
          gateState={gateState}
          feeHash={feeHash}
          error={gateError}
          featureName="Scanner"
          onReset={resetGate}
        />

        {/* Scanner Form */}
        <form onSubmit={handleScan} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter Stellar wallet address (e.g., GABC…)"
              className="flex-1 px-6 py-4 bg-card border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading || gateState === 'charging'}
            />
            <button
              type="submit"
              disabled={loading || !address.trim() || gateState === 'charging' || !walletAddress}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {gateState === 'charging' ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Charging fee…</>
              ) : loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Scanning…</>
              ) : (
                <><Scan className="w-5 h-5" /> Scan Wallet</>
              )}
            </button>
          </div>
          {!walletAddress && (
            <p className="text-xs text-destructive mt-2 text-center">Connect your wallet in the navbar to use this feature.</p>
          )}
        </form>

        {/* Scan Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-xl mb-8"
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Results */}
        {assessment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Blockchain Data */}
            {blockchainData && (
              <motion.div
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {/* Balance */}
                <div className="bg-card border border-border rounded-2xl p-6 md:col-span-1">
                  <div className="flex items-center gap-2 mb-4 text-muted-foreground uppercase text-xs font-robotic tracking-widest">
                    <WalletIcon className="w-4 h-4" />
                    Balance
                  </div>
                  <div className="text-3xl font-bold font-robotic">
                    {parseFloat(blockchainData.balance).toLocaleString()}
                    <span className="text-sm text-primary ml-1">XLM</span>
                  </div>
                  <a
                    href={stellarExpertAccountUrl(address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                  >
                    View account <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Transactions */}
                <div className="bg-card border border-border rounded-2xl p-6 md:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground uppercase text-xs font-robotic tracking-widest">
                      <History className="w-4 h-4" />
                      Recent Transactions
                    </div>
                    <a
                      href={stellarExpertAccountUrl(address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      Full history <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="space-y-2">
                    {blockchainData.transactions.length > 0 ? (
                      blockchainData.transactions.slice(0, 5).map((tx: any, i: number) => (
                        <a
                          key={i}
                          href={stellarExpertTxUrl(tx.hash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded-lg hover:bg-muted/60 transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="font-mono text-xs text-muted-foreground">
                              {tx.hash.substring(0, 12)}…
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">
                              {new Date(tx.created_at).toLocaleDateString()}
                            </span>
                            {tx.successful
                              ? <CheckCircle className="w-4 h-4 text-green-500" />
                              : <AlertTriangle className="w-4 h-4 text-red-500" />}
                            <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </a>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No recent transactions found.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Risk Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-8"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-robotic uppercase tracking-tight">Clarix AI Risk Grade</h2>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono break-all bg-muted/50 p-2 rounded border border-border">
                    {address}
                  </p>
                  <a
                    href={stellarExpertAccountUrl(address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                  >
                    Open in Stellar Expert <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="text-center">
                  <div className="relative inline-block">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
                      <motion.circle
                        cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none"
                        initial={{ strokeDasharray: '0 351.86' }}
                        animate={{ strokeDasharray: `${(assessment.riskScore / 100) * 351.86} 351.86` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        className={getRiskColor(assessment.riskLevel)}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold font-robotic">{assessment.riskScore}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-robotic">Score</div>
                      </div>
                    </div>
                  </div>
                  <p className={`mt-2 uppercase tracking-widest text-sm font-robotic ${getRiskColor(assessment.riskLevel)}`}>
                    {assessment.riskLevel} Risk
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Summary + Flags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-2xl p-8"
              >
                <div className="flex items-start gap-3 mb-4">
                  <Info className="w-5 h-5 text-primary mt-0.5" />
                  <h3 className="text-xl font-robotic">Security Summary</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm italic">
                  "{assessment.summary}"
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-card border border-border rounded-2xl p-8"
              >
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                  <h3 className="text-xl font-robotic text-orange-500">Risk Signals</h3>
                </div>
                {assessment.flags.length > 0 ? (
                  <ul className="space-y-3">
                    {assessment.flags.map((flag: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground text-sm">{flag}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-green-500 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    No significant flags detected.
                  </p>
                )}
              </motion.div>
            </div>

            {/* Recommendation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
              className={`border rounded-2xl p-8 ${getRiskBgColor(assessment.riskLevel)} border-primary/20`}
            >
              <div className="flex items-start gap-3 mb-4">
                {assessment.riskLevel === 'low'
                  ? <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  : <Shield className="w-5 h-5 text-primary mt-0.5" />}
                <h3 className="text-xl font-robotic uppercase tracking-tight">Security Protocol</h3>
              </div>
              <p className="leading-relaxed text-sm font-medium">{assessment.recommendation}</p>
            </motion.div>
          </motion.div>
        )}

        {/* Info Box */}
        {!assessment && !loading && gateState === 'idle' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="bg-muted/50 border border-border rounded-2xl p-8 text-center"
          >
            <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl mb-2">How it works</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI analyzes wallet addresses using advanced pattern recognition and live Stellar blockchain data
              to provide instant risk assessments. A <strong>0.5 XLM</strong> fee is charged per scan.
              Enter any Stellar address above to get started.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
