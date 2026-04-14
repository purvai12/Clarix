import { useState } from 'react';
import { motion } from 'motion/react';
import { GitCompare, Loader2, ArrowRight } from 'lucide-react';
import { analyzeWallet, WalletRiskAssessment } from '../../lib/gemini';

export function CompareWallets() {
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [loading, setLoading] = useState(false);
  const [assessment1, setAssessment1] = useState<WalletRiskAssessment | null>(null);
  const [assessment2, setAssessment2] = useState<WalletRiskAssessment | null>(null);
  const [error, setError] = useState('');

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address1.trim() || !address2.trim()) return;

    setLoading(true);
    setError('');
    setAssessment1(null);
    setAssessment2(null);

    try {
      const [result1, result2] = await Promise.all([
        analyzeWallet(address1),
        analyzeWallet(address2),
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
      case 'low':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'high':
        return 'text-orange-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-500/10 border-green-500/20';
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'high':
        return 'bg-orange-500/10 border-orange-500/20';
      case 'critical':
        return 'bg-red-500/10 border-red-500/20';
      default:
        return 'bg-muted border-border';
    }
  };

  const renderAssessmentCard = (
    assessment: WalletRiskAssessment | null,
    address: string,
    label: string
  ) => {
    if (!assessment) return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg text-muted-foreground mb-2">{label}</h3>
          <p className="text-sm font-mono text-muted-foreground break-all">{address}</p>
        </div>

        {/* Risk Score Circle */}
        <div className="flex justify-center">
          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(assessment.riskScore / 100) * 351.86} 351.86`}
                className={getRiskColor(assessment.riskLevel)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl">{assessment.riskScore}</div>
                <div className="text-xs text-muted-foreground">/ 100</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <span className={`inline-block px-4 py-2 rounded-full uppercase tracking-wider text-sm ${getRiskBgColor(assessment.riskLevel)} border`}>
            <span className={getRiskColor(assessment.riskLevel)}>{assessment.riskLevel} Risk</span>
          </span>
        </div>

        {/* Summary */}
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{assessment.summary}</p>
        </div>

        {/* Red Flags Count */}
        {assessment.flags.length > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
            <p className="text-sm">
              <span className="text-orange-500">{assessment.flags.length}</span> red flag
              {assessment.flags.length !== 1 ? 's' : ''} detected
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-4">
            <GitCompare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl mb-4">Compare Wallets</h1>
          <p className="text-xl text-muted-foreground">
            Side-by-side risk comparison of two Stellar addresses
          </p>
        </div>

        {/* Compare Form */}
        <form onSubmit={handleCompare} className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm mb-2">First Wallet Address</label>
              <input
                type="text"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                placeholder="GABC..."
                className="w-full px-6 py-4 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Second Wallet Address</label>
              <input
                type="text"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                placeholder="GXYZ..."
                className="w-full px-6 py-4 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !address1.trim() || !address2.trim()}
            className="w-full px-8 py-4 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Comparing...
              </>
            ) : (
              <>
                <GitCompare className="w-5 h-5" />
                Compare Wallets
              </>
            )}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-xl mb-8"
          >
            <span>{error}</span>
          </motion.div>
        )}

        {/* Comparison Results */}
        {assessment1 && assessment2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="bg-card border border-border rounded-2xl p-8">
              {renderAssessmentCard(assessment1, address1, 'Wallet 1')}
            </div>

            <div className="bg-card border border-border rounded-2xl p-8">
              {renderAssessmentCard(assessment2, address2, 'Wallet 2')}
            </div>
          </motion.div>
        )}

        {/* Winner Banner */}
        {assessment1 && assessment2 && assessment1.riskScore !== assessment2.riskScore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-transparent border border-green-500/20 rounded-2xl p-8 text-center"
          >
            <h3 className="text-2xl mb-2">
              {assessment1.riskScore < assessment2.riskScore ? 'Wallet 1' : 'Wallet 2'} is safer
            </h3>
            <p className="text-muted-foreground">
              {assessment1.riskScore < assessment2.riskScore
                ? `${assessment2.riskScore - assessment1.riskScore} points lower risk score`
                : `${assessment1.riskScore - assessment2.riskScore} points lower risk score`}
            </p>
          </motion.div>
        )}

        {/* Info */}
        {!assessment1 && !assessment2 && !loading && (
          <div className="bg-muted/50 border border-border rounded-2xl p-8 text-center">
            <GitCompare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl mb-2">Compare two wallets</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enter two Stellar wallet addresses to compare their risk profiles side-by-side.
              Perfect for deciding between multiple transaction recipients.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
