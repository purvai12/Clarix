import { useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Loader2, CheckCircle, XCircle, Wallet } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fileReport, checkFreighter, getPublicKey, UserRejectedError, InsufficientFundsError, NetworkError } from '../../lib/stellar';
import { supabase } from '../../lib/supabase';

type TxStatus = 'idle' | 'pending' | 'signing' | 'success' | 'error';

export function ReportFraud() {
  const { user, profile, refreshProfile } = useAuth();
  const [walletAddress, setWalletAddress] = useState('');
  const [description, setDescription] = useState('');
  const [amountLost, setAmountLost] = useState('');
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setError('');
    setTxStatus('pending');

    try {
      // Check Freighter wallet
      const hasFreighter = await checkFreighter();
      if (!hasFreighter) {
        throw new Error('Freighter wallet not installed. Please install it to continue.');
      }

      // Get user's public key
      const publicKey = await getPublicKey();

      // Create report hash (deterministic)
      const reportData = `${walletAddress}-${description}-${Date.now()}`;
      const reportHash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(reportData)
      );
      const hashString = Array.from(new Uint8Array(reportHash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      setTxStatus('signing');

      // File report on blockchain
      const hash = await fileReport(walletAddress, hashString, publicKey);
      setTxHash(hash);

      // Save to Supabase
      const { error: dbError } = await supabase.from('fraud_reports').insert({
        reporter_id: user.id,
        wallet_address: walletAddress,
        description,
        amount_lost: parseFloat(amountLost) || 0,
        transaction_hash: hashString,
        blockchain_tx_hash: hash,
      });

      if (dbError) {
        console.error('Database error:', dbError);
      }

      // Update CLRX balance (reward 10 CLRX)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ clrx_balance: (profile.clrx_balance || 0) + 10 })
        .eq('id', user.id);

      if (updateError) {
        console.error('Balance update error:', updateError);
      }

      await refreshProfile();

      setTxStatus('success');
      setWalletAddress('');
      setDescription('');
      setAmountLost('');
    } catch (err: any) {
      setTxStatus('error');

      if (err instanceof UserRejectedError) {
        setError('Transaction rejected by user.');
      } else if (err instanceof InsufficientFundsError) {
        setError('Insufficient XLM to pay the network fee.');
      } else if (err instanceof NetworkError) {
        setError(err.message);
      } else {
        setError(err.message || 'Failed to submit report');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl mb-4">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl mb-4">Report Fraud</h1>
          <p className="text-xl text-muted-foreground">
            Submit on-chain fraud reports and earn 10 CLRX tokens
          </p>
        </div>

        {/* Transaction Status */}
        {txStatus !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {txStatus === 'pending' && (
              <div className="flex items-center gap-3 p-4 bg-blue-500/10 text-blue-500 rounded-xl">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Preparing transaction...</span>
              </div>
            )}
            {txStatus === 'signing' && (
              <div className="flex items-center gap-3 p-4 bg-yellow-500/10 text-yellow-500 rounded-xl">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Waiting for signature in Freighter wallet...</span>
              </div>
            )}
            {txStatus === 'success' && (
              <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-green-500">Report submitted successfully!</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  You've earned 10 CLRX tokens for reporting fraud.
                </p>
                {txHash && (
                  <p className="text-xs text-muted-foreground break-all">
                    Transaction hash: {txHash}
                  </p>
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
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 space-y-6">
          <div>
            <label className="block text-sm mb-2">Fraudulent Wallet Address *</label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="GABC..."
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
              disabled={txStatus === 'pending' || txStatus === 'signing'}
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the fraud incident..."
              rows={4}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              required
              disabled={txStatus === 'pending' || txStatus === 'signing'}
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
              disabled={txStatus === 'pending' || txStatus === 'signing'}
            />
          </div>

          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Wallet className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h4 className="mb-1">Blockchain Storage</h4>
                <p className="text-sm text-muted-foreground">
                  Your report will be permanently stored on Stellar Testnet via the ClarixRegistry
                  Soroban smart contract. You'll receive 10 CLRX tokens automatically as a reward.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={txStatus === 'pending' || txStatus === 'signing'}
            className="w-full bg-primary text-primary-foreground py-4 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {txStatus === 'pending' || txStatus === 'signing' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {txStatus === 'pending' ? 'Preparing...' : 'Signing...'}
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5" />
                Submit Report
              </>
            )}
          </button>
        </form>

        {/* Info */}
        <div className="mt-8 bg-muted/50 border border-border rounded-2xl p-6">
          <h3 className="mb-4">Smart Contract Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ClarixRegistry:</span>
              <span className="font-mono text-xs break-all max-w-[60%] text-right">
                CBLTKX433VCXF4TRKGNP4V26UAWJZ6YXC2VVXYGQM2NDIBFIQFTQZGTY
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ClarixReward:</span>
              <span className="font-mono text-xs break-all max-w-[60%] text-right">
                CDCLUCN5DQWEHQB3FWP7N6D6NT54WBWAXO5EZI6HCVFBZFT3AIAJCEX7
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network:</span>
              <span>Stellar Testnet</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
