import { motion } from 'motion/react';
import { Trophy, Award, ExternalLink } from 'lucide-react';

// Real registered users from the Clarix community
const LEADERBOARD_USERS = [
  { name: 'Yash',         wallet: 'GBWDGDXAN4AW22OBEQADIOSK2GE7EFNDLZDTBJV6AP33SEPTGNNGFDAE', clrx: 50 },
  { name: 'Akanksha',     wallet: 'GBPUHHUNOTD3Y2HIYGNTZGT2AXDDTN5J2FLTJVBALX4KALPP6LP2L7VH', clrx: 40 },
  { name: 'Bhoomi',       wallet: 'GAL62YYPPKUGNVUDOLJA476Z2JWREWSKPCP5L3JEXADHO4HQM7WMH3DK', clrx: 30 },
  { name: 'Tanishka',     wallet: 'GDYVHISILWDAESQ5T3NZVRP3ETTZ2NB2ON6XHKPS5NP7A7ECBG7WZ2VP', clrx: 30 },
  { name: 'Rajas',        wallet: 'GAETVTXBV4PQOTZ57HFU6WH5GVSCBVQOEZLPXWTCSZC63BS3LETLNZXY', clrx: 20 },
  { name: 'Rahul',        wallet: 'GASW26GSYEOW3FIALDZDAZWFDM6R2P2B26ENKDVKRSWJINOUFXAW7VYX',  clrx: 20 },
  { name: 'Minakshi',     wallet: 'GBUFEULELCSEWIBPNPFK65YJ36IMP4OBLZZ3UHKVB6GQCUMQH42YBSOZ', clrx: 20 },
  { name: 'Tirtha',       wallet: 'GB6Y7V3YVGCB4TRCM4HHOFUEVQE5Z5GWWOBNG3A2AWF6VRVUMPWJQW3M', clrx: 10 },
  { name: 'Khushi Yadav', wallet: 'GDWQ25FKEZ3IRTPNXNO3NGVRTJ4FY265IKJ6WZXOVQZ6PHF4ICCBL5BR', clrx: 10 },
  { name: 'Amol',         wallet: 'GDEDXX2FXQCAVQP22SU42UCGNNCB5TDIJKNU3MJ32GTCEQPRAQJSHZX5', clrx: 10 },
];

const rankStyle = (i: number) => {
  if (i === 0) return { bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-500', label: '🥇' };
  if (i === 1) return { bg: 'bg-gray-400/10 border-gray-400/30',   text: 'text-gray-400',   label: '🥈' };
  if (i === 2) return { bg: 'bg-orange-700/10 border-orange-700/30', text: 'text-orange-600', label: '🥉' };
  return { bg: 'bg-muted/30 border-border', text: 'text-primary', label: `#${i + 1}` };
};

export function Leaderboard() {
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
            <span className="text-xs text-muted-foreground">{LEADERBOARD_USERS.length} contributors</span>
          </div>

          <div className="divide-y divide-border/50">
            {LEADERBOARD_USERS.map((user, i) => {
              const style = rankStyle(i);
              return (
                <motion.div
                  key={user.wallet}
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
                      <p className="font-robotic font-bold uppercase tracking-tight">{user.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        {user.wallet.slice(0, 8)}...{user.wallet.slice(-6)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-primary" />
                        <span className="font-mono font-bold">{user.clrx}</span>
                        <span className="text-[10px] text-muted-foreground font-robotic uppercase">CLRX</span>
                      </div>
                    </div>
                    <a
                      href={`https://stellar.expert/explorer/testnet/account/${user.wallet}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title="View on Stellar Expert"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 font-robotic">
          CLRX rewards are earned by reporting fraud on-chain. Each verified report = 10 CLRX.
        </p>
      </motion.div>
    </div>
  );
}
