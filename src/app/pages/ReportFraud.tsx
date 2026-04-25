import { useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePostHog } from '@posthog/react';
import {
  fileReport,
  InsufficientFundsError,
  NetworkError,
  UserRejectedError,
  stellarExpertTxUrl,
  REPORTER_REWARD_XLM,
} from '../../lib/stellar';
import { supabase } from '../../lib/supabase';

type TxStatus = 'idle' | 'pending' | 'signing' | 'success' | 'error';

export function ReportFraud() {
  const { user, profile, walletAddress, refreshProfile } = useAuth();
  const posthog = usePostHog();
  const [fraudWallet, setFraudWallet] = useState('');
  const [description, setDescription] = useState('');
  const [amountLost, setAmountLost]   = useState('');
  const [txStatus, setTxStatus]       = useState<TxStatus>('idle');
  const [error, setError]             = useState('');
  const [txHash, setTxHash]           = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !walletAddress) return;

    setError('');
    setTxStatus('pending');

    try {
      // Build deterministic report hash
      const reportData = `${fraudWallet}-${description}-${Date.now()}`;
      const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(reportData));
      const hashString = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      setTxStatus('signing');

      // File report on blockchain via StellarWalletsKit
      const hash = await fileReport(fraudWallet, hashString, walletAddress);
      setTxHash(hash);

      // Persist report to Supabase
      const { error: dbError } = await supabase.from('fraud_reports').insert({
        reporter_id:       user.id,
        wallet_address:    fraudWallet,
        description,
        amount_lost:       parseFloat(amountLost) || 0,
        transaction_hash:  hashString,
        blockchain_tx_hash: hash,
      });
      if (dbError) console.error('DB error:', dbError);

      // Award 10 CLRX off-chain (on-chain XLM reward requires admin signer)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ clrx_balance: (profile.clrx_balance || 0) + 10 })
        .eq('id', user.id);
      if (updateError) console.error('Balance update error:', updateError);

      await refreshProfile();
      posthog?.capture('fraud_report_submitted', {
        fraud_wallet: fraudWallet,
        amount_lost_xlm: parseFloat(amountLost) || 0,
        blockchain_tx_hash: hash,
      });
      setTxStatus('success');
      setFraudWallet('');
      setDescription('');
      setAmountLost('');
    } catch (err: any) {
      posthog?.captureException(err);
      setTxStatus('error');
      if (err instanceof UserRejectedError)      setError('Transaction cancelled by user.');
      else if (err instanceof InsufficientFundsError) setError('Insufficient XLM to pay the network fee.');
      else if (err instanceof NetworkError)      setError(err.message);
      else                                        setError(err.message || 'Failed to submit report');
    }
  };

  const busy = txStatus === 'pending' || txStatus === 'signing';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl mb-4">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl mb-4">Report Fraud</h1>
          <p className="text-xl text-muted-foreground">
            Submit on-chain fraud reports — earn <strong>{REPORTER_REWARD_XLM} XLM</strong> per verified report
          </p>
        </div>

        {/* Wallet guard */}
        {!walletAddress && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm text-center">
            Connect your wallet from the navbar before submitting a report.
          </div>
        )}

        {/* Transaction Status */}
        {txStatus !== 'idle' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            {txStatus === 'pending' && (
              <div className="flex items-center gap-3 p-4 bg-blue-500/10 text-blue-500 rounded-xl">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Preparing transaction…</span>
              </div>
            )}
            {txStatus === 'signing' && (
              <div className="flex items-center gap-3 p-4 bg-yellow-500/10 text-yellow-500 rounded-xl">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Waiting for signature in your wallet…</span>
              </div>
            )}
            {txStatus === 'success' && (
              <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-green-500 font-medium">Report submitted on-chain!</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You've earned <strong>10 CLRX</strong> instantly. On-chain{' '}
                  <strong>{REPORTER_REWARD_XLM} XLM</strong> reward is processed by the Clarix treasury.
                </p>
                {txHash && (
                  <a
                    href={stellarExpertTxUrl(txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-green-500 hover:underline"
                  >
                    View report transaction on Stellar Expert <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
            {txStatus === 'error' && error && (
              <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-xl">
                <XCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Report Form */}
        <form onSubmit={handleSubmit} className={`bg-card border border-border rounded-2xl p-8 space-y-6 ${!walletAddress ? 'opacity-40 pointer-events-none' : ''}`}>
          <div>
            <label className="block text-sm mb-2">Fraudulent Wallet Address *</label>
            <input
              type="text"
              value={fraudWallet}
              onChange={(e) => setFraudWallet(e.target.value)}
              placeholder="GABC…"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
              disabled={busy}
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the fraud incident…"
              rows={4}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              required
              disabled={busy}
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Amount Lost (XLM)</label>
            <input
              type="number"
              step="0.01"
              value={amountLost}
              onChange={(e) => setAmountLost(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={busy}
            />
          </div>

          {/* Reward info box */}
          <div className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-green-500 mb-1">Reward for reporters</h4>
                <p className="text-xs text-muted-foreground">
                  Submit a verified fraud report and earn <strong>10 CLRX</strong> instantly + a{' '}
                  <strong>{REPORTER_REWARD_XLM} XLM</strong> on-chain reward processed by the Clarix treasury.
                  Your report is permanently stored on Stellar Testnet via the ClarixRegistry Soroban contract.
                </p>
              </div>
            </div>
          </div>

          
            <div className="space-y-2">
              <label className="block text-sm uppercase tracking-widest text-muted-foreground font-robotic">Screenshot Evidence <span className="text-[10px] text-muted-foreground lowercase">(Optional)</span></label>
              <input 
                type="file" 
                accept="image/*" 
                className="w-full px-6 py-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
              />
            </div>
            
            <button

            type="submit"
            disabled={busy || !walletAddress}
            className="w-full bg-primary text-primary-foreground py-4 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {busy ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {txStatus === 'pending' ? 'Preparing…' : 'Signing…'}
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5" />
                Submit Report
              </>
            )}
          </button>
        </form>

        {/* Contract Details */}
        <div className="mt-8 bg-muted/50 border border-border rounded-2xl p-6">
          <h3 className="mb-4">Smart Contract Details</h3>
          <div className="space-y-2 text-sm">
            {[
              { label: 'ClarixRegistry', value: 'CBLTKX433VCXF4TRKGNP4V26UAWJZ6YXC2VVXYGQM2NDIBFIQFTQZGTY' },
              { label: 'ClarixReward',   value: 'CDCLUCN5DQWEHQB3FWP7N6D6NT54WBWAXO5EZI6HCVFBZFT3AIAJCEX7' },
              { label: 'Network',        value: 'Stellar Testnet' },
              { label: 'Reporter Reward', value: `${REPORTER_REWARD_XLM} XLM (on-chain) + 10 CLRX` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-4">
                <span className="text-muted-foreground flex-shrink-0">{label}:</span>
                <span className="font-mono text-xs break-all text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
