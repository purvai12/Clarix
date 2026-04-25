import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Loader2, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data } = await supabase.from('profiles').select('*').order('clrx_balance', { ascending: false }).limit(10);
      if (data) setLeaders(data);
      setLoading(false);
    };
    fetchLeaders();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-block p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl mb-4">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl mb-4 uppercase font-robotic tracking-tight">Community Leaderboard</h1>
        <p className="text-xl text-muted-foreground">Top reporters keeping the Stellar network safe</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8">
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-4">
            {leaders.map((user, i) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-500' : i === 1 ? 'bg-gray-400/20 text-gray-400' : i === 2 ? 'bg-orange-700/20 text-orange-700' : 'bg-primary/10 text-primary'}`}>
                    #{i + 1}
                  </div>
                  <div>
                    <h3 className="font-robotic uppercase tracking-tight">{user.username}</h3>
                    <p className="text-xs text-muted-foreground">{user.is_verified ? 'Verified Contributor' : 'Member'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="font-bold font-mono">{user.clrx_balance} CLRX</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
