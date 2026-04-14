import { motion } from 'motion/react';
import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Scan, AlertTriangle, Eye, GitCompare, TrendingUp, Shield, Award } from 'lucide-react';

export function Dashboard() {
  const { profile } = useAuth();

  const features = [
    {
      icon: Scan,
      title: 'AI Wallet Scanner',
      description: 'Instant risk assessment for any Stellar address',
      path: '/app/scanner',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: AlertTriangle,
      title: 'Report Fraud',
      description: 'Submit on-chain fraud reports and earn 10 CLRX',
      path: '/app/report',
      gradient: 'from-red-500 to-orange-500',
    },
    {
      icon: Eye,
      title: 'Watch Wallets',
      description: 'Monitor saved addresses in real-time',
      path: '/app/watch',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: GitCompare,
      title: 'Compare Wallets',
      description: 'Side-by-side risk comparison',
      path: '/app/compare',
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <h1 className="text-4xl md:text-5xl mb-4">
          Welcome back, {profile?.username}
        </h1>
        <p className="text-xl text-muted-foreground">
          Your AI-powered wallet safety dashboard
        </p>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">CLRX Balance</span>
          </div>
          <p className="text-3xl">{profile?.clrx_balance || 0}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Shield className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-sm text-muted-foreground">Verification Status</span>
          </div>
          <p className="text-3xl">
            {profile?.is_verified ? (
              <span className="flex items-center gap-2">
                <span className="text-green-500">Verified</span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
              </span>
            ) : (
              <span className="text-muted-foreground">Not Verified</span>
            )}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Award className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-sm text-muted-foreground">Get Verified</span>
          </div>
          <p className="text-lg">
            {profile?.is_verified ? (
              "You're verified!"
            ) : (
              <Link to="/app/profile" className="text-primary hover:underline">
                Spend 50 CLRX →
              </Link>
            )}
          </p>
        </div>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              <Link to={feature.path}>
                <div className="group relative bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-all overflow-hidden">
                  <div
                    className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity rounded-full blur-3xl`}
                  ></div>
                  <div className="relative z-10">
                    <div className="mb-4">
                      <div className={`inline-block p-3 bg-gradient-to-br ${feature.gradient} rounded-xl`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-12 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-8"
      >
        <h3 className="text-xl mb-2">Earn CLRX by reporting fraud</h3>
        <p className="text-muted-foreground mb-4">
          Every fraud report you submit to the blockchain earns you 10 CLRX tokens automatically.
          Reports are permanently stored via Soroban smart contracts on Stellar Testnet.
        </p>
        <Link
          to="/app/report"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          Report fraud now →
        </Link>
      </motion.div>
    </div>
  );
}
