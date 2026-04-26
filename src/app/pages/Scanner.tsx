import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useSearchParams, useNavigate } from 'react-router';
import { Scan, Loader2, Shield, AlertTriangle, CheckCircle, Info, ExternalLink, Trash2, Search, Filter, Eye } from 'lucide-react';
import { analyzeWallet, WalletRiskAssessment } from '../../lib/gemini';
import { getWalletData, stellarExpertTxUrl, stellarExpertAccountUrl } from '../../lib/stellar';
import { History, Wallet as WalletIcon, Clock, Printer } from 'lucide-react';
import { historyService, ScanHistoryItem } from '../../lib/historyService';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useFeatureGate, FeatureGateBanner } from '../components/FeatureGate';
import { useAuth } from '../../contexts/AuthContext';
import { usePostHog } from '@posthog/react';

export function Scanner() {
  const { walletAddress } = useAuth();
  const posthog = usePostHog();
  const [address, setAddress]           = useState('');
  const [loading, setLoading]           = useState(false);
  const [assessment, setAssessment]     = useState<WalletRiskAssessment | null>(null);
  const [blockchainData, setBlockchainData] = useState<{ balance: string; transactions: any[] } | null>(null);
  const [error, setError]               = useState('');
  const [searchParams]                  = useSearchParams();
  const navigate                        = useNavigate();
  const [history, setHistory]           = useState<ScanHistoryItem[]>([]);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'safe' | 'caution' | 'danger'>('all');
  const [historySearch, setHistorySearch] = useState('');

  useEffect(() => {
    setHistory(historyService.getHistory());
    const addrQuery = searchParams.get('address');
    if (addrQuery) {
      setAddress(addrQuery);
    }
  }, [searchParams]);

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
      
      try {
        const audio = new Audio('data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
        audio.play().catch(() => {});
      } catch (e) {}

      
      const historyItem: ScanHistoryItem = {
        address,
        score: result.riskScore,
        riskLevel: result.riskLevel,
        timestamp: new Date().toISOString()
      };
      historyService.saveScan(historyItem);
      setHistory(historyService.getHistory());
      posthog?.capture('wallet_scanned', {
        scanned_address: address,
        risk_level: result.riskLevel,
        risk_score: result.riskScore,
        flags_count: result.flags?.length ?? 0,
      });
    } catch (err: any) {
      posthog?.captureException(err);
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
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="px-2 py-0.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded text-[10px] font-bold uppercase tracking-widest">Pro Feature</div>
            <p className="text-xs text-muted-foreground">Bulk scan mode coming soon (get 25% off 5+ wallets!)</p>
          </div>

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
            className="space-y-8 print:space-y-4"
          >
            <div className="flex justify-end gap-3 mb-4 print:hidden">
              <button 
                onClick={async () => {
                  try {
                    const { data: { user } } = await (await import('../../lib/supabase')).supabase.auth.getUser();
                    if (user) {
                      const { supabase } = await import('../../lib/supabase');
                      const { error } = await supabase.from('watched_wallets').insert({
                        user_id: user.id,
                        wallet_address: address,
                        nickname: `Scanned ${new Date().toLocaleDateString()}`,
                      });
                      if (error && error.code !== '23505') throw error;
                    }
                    // Also persist locally as fallback
                    const existingStr = localStorage.getItem('clarix_watchlist_local') || '[]';
                    const existing = JSON.parse(existingStr);
                    if (!existing.find((w: any) => w.address === address)) {
                      existing.push({ address, addedAt: new Date().toISOString() });
                      localStorage.setItem('clarix_watchlist_local', JSON.stringify(existing));
                    }
                    alert('✅ Added to Watchlist!');
                  } catch (err: any) {
                    alert('Added to local watchlist.');
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg transition-colors text-sm font-robotic"
              >
                <Eye className="w-4 h-4" />
                Add to Watchlist
              </button>
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted text-foreground border border-border rounded-lg transition-colors text-sm font-robotic"
              >
                <Printer className="w-4 h-4" />
                Export as PDF
              </button>
            </div>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-1">
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
                <div className="text-center md:col-span-1 border-y md:border-y-0 md:border-x border-border py-4 md:py-0">
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
                
                <div className="md:col-span-1 h-48 w-full flex items-center justify-center">
                  {assessment.subScores && (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius="65%" data={[
                        { subject: 'Activity', A: assessment.subScores.activity, fullMark: 100 },
                        { subject: 'Age', A: assessment.subScores.age, fullMark: 100 },
                        { subject: 'Pattern', A: assessment.subScores.pattern, fullMark: 100 },
                        { subject: 'Network', A: assessment.subScores.network, fullMark: 100 },
                      ]}>
                        <PolarGrid stroke="var(--color-border)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11, fontFamily: 'monospace' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Score" dataKey="A" stroke="oklch(var(--primary))" fill="oklch(var(--primary))" fillOpacity={0.2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}
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

        {/* Scan History Module */}
        <div className="mt-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-xl font-robotic uppercase tracking-tight flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Scan History
            </h3>
            {history.length > 0 && (
              <button 
                onClick={() => { historyService.clearHistory(); setHistory([]); }}
                className="text-xs text-destructive flex items-center gap-1 hover:bg-destructive/10 px-3 py-1.5 rounded-full transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search address..." 
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                <Filter className="w-4 h-4 text-muted-foreground mr-1 flex-shrink-0" />
                {['all', 'safe', 'caution', 'danger'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setHistoryFilter(f as any)}
                    className={`px-3 py-1.5 rounded-full text-xs box-border border transition-colors capitalize whitespace-nowrap ${
                      historyFilter === f 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {history
                .filter(h => historyFilter === 'all' || 
                  (historyFilter === 'safe' && h.riskLevel === 'low') || 
                  (historyFilter === 'caution' && h.riskLevel === 'medium') || 
                  (historyFilter === 'danger' && (h.riskLevel === 'high' || h.riskLevel === 'critical'))
                )
                .filter(h => h.address.toLowerCase().includes(historySearch.toLowerCase()))
                .map((item, i) => (
                <button
                  key={i}
                  onClick={() => { setAddress(item.address); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="w-full text-left flex items-center justify-between p-3 lg:p-4 bg-background border border-border rounded-xl hover:border-primary/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`p-2 rounded-lg ${getRiskBgColor(item.riskLevel)}`}>
                      <Shield className={`w-4 h-4 ${getRiskColor(item.riskLevel)}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-mono truncate">{item.address}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0 pl-2">
                    <div className="text-right hidden sm:block">
                      <p className={`text-sm font-bold ${getRiskColor(item.riskLevel)}`}>{item.score}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{item.riskLevel}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-md">
                      <Scan className="w-3 h-3" /> Rescan
                    </div>
                  </div>
                </button>
              ))}
              {history.length === 0 && (
                <p className="text-center text-sm text-muted-foreground italic py-8">
                  No scan history yet.
                </p>
              )}
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
