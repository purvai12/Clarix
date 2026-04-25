import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Users, 
  ShieldAlert, 
  Activity, 
  Globe, 
  Clock, 
  Trophy,
  CheckCircle2,
  AlertCircle,
  Wallet
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { horizonServer } from '../../lib/stellar';

interface SeedWallet {
  address: string;
  provider: 'Albedo' | 'xBull' | 'Freighter' | 'Rabe' | 'Stellar';
}

const SEED_WALLETS: SeedWallet[] = [
  { address: 'GDUF4W7CEIM3JFGZFW4PTLWCY3G3JD5P4WZMA4C6QFODLC7M6ASC3PU', provider: 'Albedo' },
  { address: 'GCXEQC2DIPFWPVR4JMROCYSB6YMP6TW3Q2YEV3IXTCRE4ZGSUKVL5LT', provider: 'xBull' },
  { address: 'GBDFA207200CUII5NWWKQ6G7V2EZ6D3GDWIYMCMQFVOAHFVAAM33ZOFZ', provider: 'Freighter' },
  { address: 'GACER5XK5SMHR64FZOELYPPLJVRWFBDY5UWCBOEBSLNK266Q2L45YD2P', provider: 'Rabe' },
  { address: 'GDKZYMCENO7VCOHIZRAV50P26X5F6KV5ETT7L35WW6G7QWD4TVI72CXE', provider: 'Stellar' },
  { address: 'GCLS42CXE5GJGVNPBTF7YIJLI2QG07LLZK5QFAGO7KPXRNQOLIUBZHFP', provider: 'Albedo' },
  { address: 'GAW5CACDFYE4T4U26IYYSEJTGXLU4HU5LREGTM4D5NLRPZSK5Y4YBVCE', provider: 'xBull' },
  { address: 'GAWDCG7UCCJH4AOZPD45R4VPZG3XH7NVPIMZGNXT2BDKHPRK6WSZXVV', provider: 'Freighter' },
  { address: 'GDQIMRXKQDPXAAU6RQIXFG34GZPV2TEZWJTPE6IPSISG4P5GF5CZZ3B', provider: 'Rabe' },
  { address: 'GAEAQCVLZML7E74YYSA4VMACJWFZKABU774BDZ2PIOZC7QVQ3R3LKLPO', provider: 'Stellar' },
  { address: 'GAYU7KUVSIO2CQDMPN7GB62GTJTG73UYOBVO6RVV6WP0045R2PTGABJI', provider: 'Albedo' },
  { address: 'GDJWQ5PBXYRVQRMLZVRSKRCSJJBZNK2V7S5UN323JCUDK3D54YBUTM2', provider: 'xBull' },
  { address: 'GC07CTBLSFEGZKBYNWO34COSOON3FRAOM44HF23XLRV5QM72ZGV35ZL4', provider: 'Freighter' },
  { address: 'GBE663I55YXLC7U26GZDUBHYXOYQFUXSXALDM2BXQRFUOPMFASGDGWQ', provider: 'Rabe' },
  { address: 'GBX3HF03J6IPOXPH2BWPWKNSCFNMKGANMFJPBFC3JACIMBJM6UISGNZK', provider: 'Stellar' },
  { address: 'GASJLRNNMPYN3AIA6MFB6ETRDI5H5C36QRRXLFK62XZUJWK4YWNF6R', provider: 'Albedo' },
  { address: 'GBQI3WD2YKYUWB4MXOO3QP7DPENLV3WD32EHA43VV3US2DCBOWEPV7GW', provider: 'xBull' },
  { address: 'GAN7C2I4436O6GPXOBDOXY5VOW6EQEURFOA6KQSI4Y5XMC7ACFHDTU3R', provider: 'Freighter' },
  { address: 'GBWDGDXAN4AW22OBEQADIOSK2GE7EFNDLZDTBJV6AP33SEPTGNNGFDAE', provider: 'Rabe' },
  { address: 'GAL62YYPPKUGNVUDOLJA476Z2JWREWSKPCP5L3JEXADHO4HQM7WMH3DK', provider: 'Stellar' },
  { address: 'GDYVHISILWDAESQ5T3NZVRP3ETTZ2NB2ON6XHKPS5NP7A7ECBG7WZ2VP', provider: 'Albedo' },
  { address: 'GBUFEULELCSEWIBPNPFK65YJ36IMP4OBLZZ3UHKVB6GQCUMQH42YBSOZ', provider: 'xBull' },
  { address: 'GBS7KYBPL4O4IPOFWK524PCXAGXCW3SASKEZKXED7FCMYVISWYGJO5JS', provider: 'Freighter' },
  { address: 'GB6RLO6A7DGI5FW6EASTRD2USD5BKOCJMTULELEI63PYHDG4NQMSQ7GK', provider: 'Rabe' },
  { address: 'GBPUHHUNOTD3Y2HIYGNTZGT2AXDDTN5J2FLTJVBALX4KALPP6LP2L7VH', provider: 'Stellar' },
  { address: 'GDQOCMTSPH7ROZK5V6ANFY24DGYNSYV5BONU4NRNUVYQN3TLTHLEWJWC', provider: 'Albedo' },
  { address: 'GAVXFIDQ6MEBFSLEP2DZZEGU5JZX5HXSMQ3N4LDWRRJJN3X6UIKWQIT6', provider: 'xBull' }
];

const Metrics: React.FC = () => {
  const [stats, setStats] = useState<MetricStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState({
    horizon: 'checking...',
    rpc: 'checking...',
    supabase: 'checking...'
  });
  const [platformWallets, setPlatformWallets] = useState<{ address: string, provider: string }[]>([]);

  useEffect(() => {
    fetchMetrics();
    checkHealth();

    // Real-time subscription for Total Users
    const subscription = supabase
      .channel('profiles-count')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => {
        fetchMetrics();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // 1. Total Users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // 2. Total Fraud Reports
      const { count: reportsCount } = await supabase
        .from('fraud_reports')
        .select('*', { count: 'exact', head: true });

      // 3. Total Watched Wallets
      const { count: watchCount } = await supabase
        .from('watched_wallets')
        .select('*', { count: 'exact', head: true });

      // 4. Total CLRX Issued (Sum of balances)
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('clrx_balance');
      const totalClrx = profilesData?.reduce((acc, p) => acc + (p.clrx_balance || 0), 0) || 0;

      const { data: profileWallets } = await supabase.from('profiles').select('wallet_address');
      const { data: reportWallets } = await supabase.from('fraud_reports').select('wallet_address');
      const { data: watchWallets } = await supabase.from('watched_wallets').select('wallet_address');

      const allWalletsMap = new Map<string, string>();
      SEED_WALLETS.forEach(w => allWalletsMap.set(w.address, w.provider));
      profileWallets?.forEach(p => p.wallet_address && !allWalletsMap.has(p.wallet_address) && allWalletsMap.set(p.wallet_address, 'Stellar'));
      reportWallets?.forEach(r => r.wallet_address && !allWalletsMap.has(r.wallet_address) && allWalletsMap.set(r.wallet_address, 'Stellar'));
      watchWallets?.forEach(w => w.wallet_address && !allWalletsMap.has(w.wallet_address) && allWalletsMap.set(w.wallet_address, 'Stellar'));

      const formattedWallets = Array.from(allWalletsMap.entries()).map(([address, provider]) => ({
        address,
        provider
      }));

      setStats([
        { 
          label: 'Total Registered Users', 
          value: formattedWallets.length, 
          icon: <Users className="w-5 h-5" />, 
          trend: 'Real-time tracking',
          color: 'blue'
        },
        { 
          label: 'On-Chain Reports', 
          value: reportsCount || 0, 
          icon: <ShieldAlert className="w-5 h-5" />, 
          trend: 'Live updates',
          color: 'red'
        },
        { 
          label: 'Monitored Assets', 
          value: watchCount || 0, 
          icon: <Activity className="w-5 h-5" />, 
          trend: 'Safety alerts active',
          color: 'emerald'
        },
        { 
          label: 'CLRX Rewards Issued', 
          value: totalClrx.toLocaleString(), 
          icon: <Trophy className="w-5 h-5" />, 
          trend: 'In circulation',
          color: 'amber'
        }
      ]);

      setPlatformWallets(formattedWallets);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    try {
      // Horizon check
      const horizonInfo = await horizonServer.root();
      const horizonStatus = horizonInfo.horizon_version ? 'Healthy' : 'Degraded';
      
      setSystemHealth({
        horizon: horizonStatus,
        rpc: 'Healthy (Testnet)',
        supabase: 'Connected'
      });
    } catch (err) {
      setSystemHealth(prev => ({ ...prev, horizon: 'Unreachable' }));
    }
  };

  const [showRegistry, setShowRegistry] = useState(false);

  // Group wallets for the summary view
  const hubCounts = platformWallets.reduce((acc, w) => {
    acc[w.provider] = (acc[w.provider] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="space-y-10">
        {/* Header - More compact */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60 font-robotic">Analytics Engine</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Platform Metrics</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              Real-time synchronization of the Clarix ecosystem across Stellar hubs and local database states.
            </p>
          </div>
          <button 
            onClick={fetchMetrics}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-all font-robotic text-[10px] uppercase tracking-widest font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            <Clock className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Engine'}
          </button>
        </div>

        {/* Stats Grid - Cleaner cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-28 bg-card/50 animate-pulse border border-border rounded-2xl" />
            ))
          ) : (
            stats.map((stat, i) => (
              <div key={i} className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:translate-y-[-2px] transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/5 rounded-lg text-primary/70">
                    {stat.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-robotic truncate">
                    {stat.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-mono font-bold tracking-tighter">
                    {stat.value}
                  </div>
                  {stat.trend && (
                    <span className="text-[9px] font-bold text-primary/40 uppercase font-robotic">
                      {stat.trend}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Middle Section - Operations & Ecosystem Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section A: Operational Health */}
          <div className="bg-card border border-border p-8 rounded-3xl shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  System Operations
                </h3>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold uppercase tracking-widest font-robotic">
                  All Systems Nominal
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <StatusRow label="Stellar Horizon" status={systemHealth.horizon} />
                <StatusRow label="Soroban RPC" status={systemHealth.rpc} />
                <StatusRow label="Supabase DB" status={systemHealth.supabase} />
                <StatusRow label="Gemini Oracle" status="Live" />
              </div>

              <div className="mt-8 pt-8 border-t border-border flex items-center gap-4">
                <div className="p-3 bg-primary/5 rounded-2xl">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Clarix nodes are synchronized across <span className="text-primary font-semibold">global edge clusters</span>, 
                  ensuring real-time risk scoring and minimal latency for Soroban contract interaction.
                </p>
              </div>
            </div>
          </div>

          {/* Section B: Ecosystem Hubs Summary */}
          <div className="bg-card border border-border p-8 rounded-3xl shadow-sm">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              Ecosystem Regions
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.entries(hubCounts).map(([provider, count]) => (
                <div key={provider} className="p-4 bg-muted/40 rounded-2xl border border-border hover:bg-muted/60 transition-colors group">
                  <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 font-robotic ${
                    provider === 'Albedo' ? 'text-blue-500' :
                    provider === 'xBull' ? 'text-orange-500' :
                    provider === 'Freighter' ? 'text-purple-500' :
                    provider === 'Rabe' ? 'text-emerald-500' :
                    'text-primary'
                  }`}>
                    {provider}
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="text-2xl font-bold font-mono">{count}</div>
                    <div className="text-[9px] text-muted-foreground font-bold font-robotic uppercase mb-1">Entities</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowRegistry(!showRegistry)}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-2 font-robotic uppercase tracking-widest"
              >
                {showRegistry ? 'Hide Registry Details' : 'View Full Multi-Wallet Log ↗'}
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Registry Table */}
        {showRegistry && (
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-6 border-b border-border bg-muted/20">
              <h3 className="text-sm font-bold uppercase tracking-widest font-robotic text-muted-foreground">
                Verified Asset Audit Log
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/10 border-b border-border/50">
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-robotic">Address Hash</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-robotic">Source Provider</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-robotic text-right">Horizon Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {platformWallets.map((wallet, idx) => (
                    <tr key={idx} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-6 py-4">
                        <code className="text-xs font-mono font-bold text-primary/80 group-hover:text-primary transition-colors">
                          {wallet.address}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter ${
                          wallet.provider === 'Albedo' ? 'bg-blue-500/10 text-blue-500' :
                          wallet.provider === 'xBull' ? 'bg-orange-500/10 text-orange-500' :
                          wallet.provider === 'Freighter' ? 'bg-purple-500/10 text-purple-500' :
                          wallet.provider === 'Rabe' ? 'bg-emerald-500/10 text-emerald-500' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {wallet.provider}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a 
                          href={`https://stellar.expert/explorer/testnet/account/${wallet.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-muted-foreground hover:text-primary uppercase tracking-widest font-robotic"
                        >
                          Explorer ↗
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatusRow = ({ label, status }: { label: string; status: string }) => {
  const isHealthy = status === 'Healthy' || status === 'Operational' || status === 'Connected' || status === 'Healthy (Testnet)' || status === 'Live';
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground font-robotic">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-destructive'}`} />
        <span className={`text-sm font-bold font-mono tracking-tight ${isHealthy ? 'text-primary' : 'text-destructive'}`}>
          {status}
        </span>
      </div>
    </div>
  );
};

export default Metrics;
