import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { Award, CheckCircle, Loader2, AlertCircle, Wallet, Unlink, Link2, MessageSquare, Send, Heart, ShieldAlert } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { chatWithAI } from '../../lib/gemini';
import { feedbackService } from '../../lib/feedbackService';

export function Profile() {
  const { profile, refreshProfile, walletAddress, connectWallet, disconnectWallet } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [walletLoading, setWalletLoading] = useState(false);
  
  // AI Help Center state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'Hi! I\'m ClarixAI. How can I help you with your profile or rewards today?' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  
  // Feedback form state
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Past reports state
  const [pastReports, setPastReports] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      const fetchReports = async () => {
        setReportsLoading(true);
        const { data } = await supabase
          .from('fraud_reports')
          .select('*')
          .eq('reporter_id', profile.id)
          .order('created_at', { ascending: false });
        
        if (data) {
          setPastReports(data);
        }
        setReportsLoading(false);
      };
      fetchReports();
    }
  }, [profile?.id]);

  const handlePurchaseBadge = async () => {
    if (!profile) return;

    if (profile.clrx_balance < 50) {
      setError('Insufficient CLRX balance. You need 50 CLRX to purchase a verification badge.');
      return;
    }

    if (profile.is_verified) {
      setError('You are already verified!');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          clrx_balance: profile.clrx_balance - 50,
          is_verified: true,
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      await refreshProfile();
      setSuccess('Congratulations! You are now a verified contributor.');
    } catch (err: any) {
      setError(err.message || 'Failed to purchase badge');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    setError('');
    setSuccess('');
    setWalletLoading(true);
    try {
      await connectWallet();
      setSuccess('Wallet connected successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setWalletLoading(false);
    }
  };

  const handleDisconnectWallet = () => {
    disconnectWallet();
    setSuccess('Wallet disconnected.');
  };

  const handleSendToAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);
    
    try {
      const context = `You are ClarixAI, assisting a user on their Profile page. The user's username is ${profile?.username}, they have ${profile?.clrx_balance} CLRX, and they are ${profile?.is_verified ? 'verified' : 'not verified'}. Help them understand their rewards, how to get verified (costs 50 CLRX), and general platform features.`;
      const response = await chatWithAI(userMsg, context);
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I hit a snag. Try again?' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMsg.trim() || feedbackLoading || !profile) return;
    
    setFeedbackLoading(true);
    try {
      await feedbackService.submitFeedback({
        user_id: profile.id,
        email: profile.email,
        subject: 'General Feedback',
        message: feedbackMsg.trim()
      });
      setSuccess('Thank you for your feedback! It helps us improve Clarix.');
      setFeedbackMsg('');
    } catch (err) {
      setError('Failed to send feedback. Please try again later.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-5"
      >
        {/* ── Profile Header (full width) ─────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center text-2xl text-primary-foreground flex-shrink-0">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl">{profile.username}</h1>
                {profile.is_verified && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-xs text-green-500">Verified</span>
                  </div>
                )}
                {pastReports.length >= 5 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.15)]">
                    <Award className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-xs text-yellow-500 font-bold uppercase tracking-wider">Top Reporter</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* ── Alerts ─────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-500 rounded-lg">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {/* ── Row 1: CLRX Balance + Stellar Wallet ──────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* CLRX Balance */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-primary rounded-xl">
                <Award className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">CLRX Balance</h2>
                <p className="text-xs text-muted-foreground">Your reward tokens</p>
              </div>
            </div>
            <div className="text-4xl font-mono font-bold mb-1">{profile.clrx_balance}</div>
            <p className="text-xs text-muted-foreground">Earn 10 CLRX for every fraud report you submit</p>
          </div>

          {/* Stellar Wallet */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-robotic uppercase tracking-tight">Stellar Wallet</h2>
                <p className="text-xs text-muted-foreground font-mono">Your connected wallet</p>
              </div>
            </div>
            {walletAddress ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <Link2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-mono text-muted-foreground break-all">{walletAddress}</p>
                </div>
                <button onClick={handleDisconnectWallet} className="flex items-center gap-2 px-4 py-2 border border-destructive/40 text-destructive rounded-full hover:bg-destructive/10 transition-all text-xs font-robotic">
                  <Unlink className="w-3.5 h-3.5" /> Disconnect
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground font-mono">Connect your Stellar wallet to interact with on-chain security features.</p>
                <button onClick={handleConnectWallet} disabled={walletLoading} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all disabled:opacity-50 text-xs font-robotic">
                  <Wallet className="w-3.5 h-3.5" /> {walletLoading ? 'Connecting...' : 'Connect Wallet'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Row 2: Verification + AI Help Center ──────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Verification / Verified Banner */}
          {!profile.is_verified ? (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-green-500/10 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h2 className="text-lg">Get Verified</h2>
                  <p className="text-xs text-muted-foreground">50 CLRX · builds community trust</p>
                </div>
              </div>
              <ul className="space-y-1.5 mb-4">
                {['Green checkmark on your profile', 'Credibility in the community', 'Commitment to platform safety'].map(b => (
                  <li key={b} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> {b}
                  </li>
                ))}
              </ul>
              <button onClick={handlePurchaseBadge} disabled={loading || profile.clrx_balance < 50}
                className="w-full px-6 py-2.5 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-robotic">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Award className="w-4 h-4" /> Purchase Badge (50 CLRX)</>}
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-transparent border border-green-500/20 rounded-2xl p-5 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="text-lg mb-0.5">You're Verified!</h3>
                <p className="text-sm text-muted-foreground">Thank you for being a trusted member of the Clarix community.</p>
              </div>
            </div>
          )}

          {/* AI Help Center */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col" style={{ minHeight: '260px' }}>
            <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg"><MessageSquare className="w-4 h-4 text-primary" /></div>
              <div>
                <h3 className="text-sm font-robotic uppercase tracking-tight">AI Help Center</h3>
                <p className="text-xs text-muted-foreground">Ask ClarixAI about rewards or features</p>
              </div>
            </div>
            <div className="flex-1 p-3 overflow-y-auto space-y-2 max-h-[180px] scrollbar-thin">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-xs ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-3 py-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" /></div>
                </div>
              )}
            </div>
            <form onSubmit={handleSendToAI} className="p-3 border-t border-border">
              <div className="flex gap-2">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question..." className="flex-1 bg-background border border-border rounded-full px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
                <button type="submit" disabled={chatLoading || !chatInput.trim()} className="p-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Row 3: Feedback Form + Past Fraud Reports ─────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Feedback Form */}
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-green-500/10 rounded-lg"><Heart className="w-4 h-4 text-green-500" /></div>
              <div>
                <h3 className="text-sm font-robotic uppercase tracking-tight">Feedback Form</h3>
                <p className="text-xs text-muted-foreground">Help us build the future of Clarix</p>
              </div>
            </div>
            <form onSubmit={handleSubmitFeedback} className="flex-1 flex flex-col gap-3">
              <textarea value={feedbackMsg} onChange={(e) => setFeedbackMsg(e.target.value)}
                placeholder="Suggest a feature or report a minor bug..." required
                className="flex-1 w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none min-h-[120px]" />
              <button type="submit" disabled={feedbackLoading || !feedbackMsg.trim()}
                className="w-full bg-foreground text-background py-2.5 rounded-full hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-robotic text-xs uppercase">
                {feedbackLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...</> : 'Submit Feedback'}
              </button>
            </form>
          </div>

          {/* Past Fraud Reports */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-orange-500/10 rounded-lg"><ShieldAlert className="w-4 h-4 text-orange-500" /></div>
              <div>
                <h3 className="text-sm font-robotic uppercase tracking-tight">My Fraud Reports</h3>
                <p className="text-xs text-muted-foreground">Your submitted on-chain fraud warnings</p>
              </div>
            </div>
            {reportsLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
                <Loader2 className="w-4 h-4 animate-spin" /> Fetching reports...
              </div>
            ) : pastReports.length > 0 ? (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                {pastReports.map((report) => (
                  <div key={report.id} className="p-3 bg-muted/30 border border-border rounded-xl">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-mono text-xs text-primary truncate max-w-[70%]">{report.wallet_address}</span>
                      <span className="text-[10px] text-muted-foreground ml-2 flex-shrink-0">{new Date(report.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground italic mb-1.5 line-clamp-2">"{report.description}"</p>
                    <div className="flex items-center gap-3 text-xs font-medium">
                      <span className="text-orange-500">Lost: {report.amount_lost} XLM</span>
                      {report.blockchain_tx_hash && (
                        <a href={`https://stellar.expert/explorer/testnet/tx/${report.blockchain_tx_hash}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Tx</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic py-4">You haven't submitted any fraud reports yet.</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
