import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Loader2, AlertTriangle, CheckCircle, ExternalLink, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { chargeFeature, stellarExpertTxUrl, FEATURE_FEE_XLM, UserRejectedError, InsufficientFundsError } from '../../lib/stellar';

// ─── Types ───────────────────────────────────────────────────────────────────
type GateState = 'idle' | 'confirming' | 'charging' | 'success' | 'error';

interface UseFeatureGateReturn {
  gateState: GateState;
  feeHash: string | null;
  error: string | null;
  /** Call this when the user clicks the action button (e.g. "Scan") */
  charge: () => Promise<boolean>;
  reset: () => void;
}

/**
 * Hook — gate any feature behind a 0.5 XLM payment.
 *
 * Usage:
 *   const { charge, gateState, feeHash, error } = useFeatureGate();
 *   const handleAction = async () => {
 *     const paid = await charge();
 *     if (!paid) return;
 *     // proceed with feature
 *   }
 */
export function useFeatureGate(): UseFeatureGateReturn {
  const { walletAddress, refreshBalance } = useAuth();
  const [gateState, setGateState]         = useState<GateState>('idle');
  const [feeHash, setFeeHash]             = useState<string | null>(null);
  const [error, setError]                 = useState<string | null>(null);

  const charge = async (): Promise<boolean> => {
    if (!walletAddress) {
      setError('Connect your wallet first.');
      return false;
    }

    setError(null);
    setGateState('charging');

    try {
      const hash = await chargeFeature(walletAddress);
      setFeeHash(hash);
      setGateState('success');
      // Refresh balance after fee payment
      refreshBalance();
      return true;
    } catch (err: any) {
      if (err instanceof UserRejectedError) {
        setError('Transaction cancelled.');
      } else if (err instanceof InsufficientFundsError) {
        setError(`Insufficient XLM. You need at least ${FEATURE_FEE_XLM} XLM.`);
      } else {
        setError(err.message || 'Fee payment failed.');
      }
      setGateState('error');
      return false;
    }
  };

  const reset = () => {
    setGateState('idle');
    setFeeHash(null);
    setError(null);
  };

  return { gateState, feeHash, error, charge, reset };
}

// ─── FeatureGateBanner ────────────────────────────────────────────────────────
/**
 * Visual inline banner shown above/below a feature to indicate fee status.
 */
interface FeatureGateBannerProps {
  gateState: GateState;
  feeHash: string | null;
  error: string | null;
  featureName: string;
  onReset?: () => void;
}

export function FeatureGateBanner({
  gateState,
  feeHash,
  error,
  featureName,
  onReset,
}: FeatureGateBannerProps) {
  if (gateState === 'idle') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="mb-6"
      >
        {gateState === 'charging' && (
          <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl">
            <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Charging {FEATURE_FEE_XLM} XLM fee</p>
              <p className="text-xs opacity-70">Please approve the transaction in your wallet…</p>
            </div>
          </div>
        )}

        {gateState === 'success' && feeHash && (
          <div className="flex items-center justify-between gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm text-green-500">{FEATURE_FEE_XLM} XLM fee paid — {featureName} unlocked</p>
                <a
                  href={stellarExpertTxUrl(feeHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-500/70 hover:text-green-500 flex items-center gap-1 mt-0.5"
                >
                  View fee tx on Stellar Expert <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            {onReset && (
              <button onClick={onReset} className="p-1 text-green-500/50 hover:text-green-500">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {gateState === 'error' && error && (
          <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── FeeeNotice ───────────────────────────────────────────────────────────────
/**
 * Small inline badge showing that a feature costs 0.5 XLM.
 */
export function FeeBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
      <Wallet className="w-3 h-3" />
      {FEATURE_FEE_XLM} XLM / use
    </span>
  );
}
