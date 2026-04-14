import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Eye, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface WatchedWallet {
  id: string;
  wallet_address: string;
  nickname: string;
  created_at: string;
}

export function WatchWallets() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<WatchedWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [address, setAddress] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

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
    if (!user) return;

    setError('');

    const { error: insertError } = await supabase.from('watched_wallets').insert({
      user_id: user.id,
      wallet_address: address,
      nickname: nickname || address.substring(0, 8) + '...',
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setAddress('');
    setNickname('');
    setShowAddForm(false);
    loadWallets();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('watched_wallets').delete().eq('id', id);

    if (!error) {
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
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="mt-4 sm:mt-0 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Wallet
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <form onSubmit={handleAdd} className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h3 className="text-xl mb-4">Add New Wallet</h3>

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
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-full hover:bg-primary/90 transition-colors"
                >
                  Add Wallet
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setAddress('');
                    setNickname('');
                    setError('');
                  }}
                  className="px-6 py-3 border border-border rounded-full hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

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
              <motion.div
                key={wallet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg mb-1">{wallet.nickname}</h3>
                    <p className="text-sm text-muted-foreground font-mono break-all">
                      {wallet.wallet_address}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(wallet.id)}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                    aria-label="Delete wallet"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    Added {new Date(wallet.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-xs text-green-500">Monitoring</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
