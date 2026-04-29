import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Award, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LeaderboardUser {
  username: string;
  wallet_address: string;
  clrx_balance: number;
}

const rankStyle = (i: number) => {
  if (i === 0) return { bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-500', label: '🥇' };
  if (i === 1) return { bg: 'bg-gray-400/10 border-gray-400/30',   text: 'text-gray-400',   label: '🥈' };
  if (i === 2) return { bg: 'bg-orange-700/10 border-orange-700/30', text: 'text-orange-600', label: '🥉' };
  return { bg: 'bg-muted/30 border-border', text: 'text-primary', label: `#${i + 1}` };
};

export function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, wallet_address, clrx_balance')
        .order('clrx_balance', { ascending: false })
        .limit(10);
      
      if (!error && data) {
        setUsers(data as LeaderboardUser[]);
      }
    } catch (err) {
      console.error('Failed to load leaderboard', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl mb-4 uppercase font-robotic tracking-tight">Community Leaderboard</h1>
          <p className="text-xl text-muted-foreground">Top contributors keeping the Stellar network safe</p>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-robotic">Top 10 by CLRX Rewards</span>
            <span className="text-xs text-muted-foreground">{users.length} contributors</span>
          </div>

          <div className="divide-y divide-border/50">
            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">No rewards issued yet.</div>
            ) : (
              users.map((user, i) => {
                const style = rankStyle(i);
                const walletDisplay = user.wallet_address && user.wallet_address !== 'Not Connected' && !user.wallet_address.startsWith('Pending')
                  ? `${user.wallet_address.slice(0, 8)}...${user.wallet_address.slice(-6)}`
                  : 'No wallet connected';
                  
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className={`flex items-center justify-between px-6 py-4 hover:bg-muted/20 transition-colors`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm font-bold font-robotic ${style.bg} ${style.text}`}>
                        {i < 3 ? style.label : `#${i + 1}`}
                      </div>
                      <div>
                        <p className="font-robotic font-bold uppercase tracking-tight">{user.username}</p>
                        <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                          {walletDisplay}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-primary" />
                          <span className="font-mono font-bold">{user.clrx_balance || 0}</span>
                          <span className="text-[10px] text-muted-foreground font-robotic uppercase">CLRX</span>
                        </div>
                      </div>
                      {user.wallet_address && user.wallet_address !== 'Not Connected' && !user.wallet_address.startsWith('Pending') && (
                        <a
                          href={`https://stellar.expert/explorer/testnet/account/${user.wallet_address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                          title="View on Stellar Expert"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 font-robotic">
          CLRX rewards are earned by reporting fraud on-chain. Each verified report = 10 CLRX.
        </p>
      </motion.div>
    </div>
  );
}
