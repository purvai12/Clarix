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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Profile Header */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center text-3xl text-primary-foreground">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl">{profile.username}</h1>

                {profile.is_verified && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-500">Verified</span>
                  </div>
                )}
                {pastReports.length >= 5 && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full ml-2 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-yellow-500 font-bold uppercase tracking-wider">Top Reporter</span>
                  </div>
                )}

              </div>
              <p className="text-muted-foreground">{profile.email}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Global feedback */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-500 rounded-lg mb-6">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {/* CLRX Balance */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary rounded-xl">
              <Award className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl">CLRX Balance</h2>
              <p className="text-muted-foreground">Your reward tokens</p>
            </div>
          </div>
          <div className="text-5xl mb-4">{profile.clrx_balance}</div>
          <p className="text-sm text-muted-foreground">
            Earn 10 CLRX for every fraud report you submit
          </p>
        </div>

        {/* Stellar Wallet Section */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-robotic uppercase tracking-tight">Stellar Wallet</h2>
              <p className="text-muted-foreground text-sm font-mono">Your connected Stellar wallet</p>
            </div>
          </div>

          {walletAddress ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <Link2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-robotic uppercase text-green-500 mb-1">Wallet Connected</p>
                  <p className="text-sm font-mono text-muted-foreground break-all">{walletAddress}</p>
                </div>
              </div>
              <button
                onClick={handleDisconnectWallet}
                className="flex items-center gap-2 px-5 py-2.5 border border-destructive/40 text-destructive rounded-full hover:bg-destructive/10 transition-all text-sm font-robotic"
              >
                <Unlink className="w-4 h-4" />
                Disconnect Wallet
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-mono">
                Connect your Stellar wallet to interact with on-chain security features.
              </p>
              <button
                onClick={handleConnectWallet}
                disabled={walletLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-robotic"
              >
                <Wallet className="w-4 h-4" />
                {walletLoading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          )}
        </div>

        {/* Verification Badge Section */}
        {!profile.is_verified && (
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl mb-2">Get Verified</h2>
                <p className="text-muted-foreground mb-4">
                  Become a verified contributor and build trust in the community. Verification badges
                  show that you're a serious fraud reporter.
                </p>

                <div className="bg-muted/50 border border-border rounded-xl p-4 mb-6">
                  <h3 className="mb-3">Benefits of verification:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        Green verification checkmark on your profile
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        Build credibility in the community
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        Show commitment to platform safety
                      </span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handlePurchaseBadge}
                  disabled={loading || profile.clrx_balance < 50}
                  className="w-full sm:w-auto px-8 py-4 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Award className="w-5 h-5" />
                      Purchase Badge (50 CLRX)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {profile.is_verified && (
          <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-transparent border border-green-500/20 rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="text-xl mb-1">You're Verified!</h3>
                <p className="text-muted-foreground">
                  Thank you for being a trusted member of the Clarix community.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI Help Center & Feedback Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* AI Help Center */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col min-h-[400px]">
            <div className="p-6 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-robotic uppercase tracking-tight">AI Help Center</h3>
                  <p className="text-xs text-muted-foreground">Ask ClarixAI about rewards or features</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[250px] scrollbar-thin">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs ${
                    m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-3 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
            
            <form onSubmit={handleSendToAI} className="p-4 border-t border-border mt-auto">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 bg-background border border-border rounded-full px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button 
                  type="submit" 
                  disabled={chatLoading || !chatInput.trim()}
                  className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Feature Feedback */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Heart className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-robotic uppercase tracking-tight">Feedback Form</h3>
                <p className="text-xs text-muted-foreground">Help us build the future of Clarix</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmitFeedback} className="flex-1 flex flex-col gap-4">
              <textarea 
                value={feedbackMsg}
                onChange={(e) => setFeedbackMsg(e.target.value)}
                placeholder="Suggest a feature or report a minor bug..."
                className="flex-1 w-full bg-background border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none min-h-[150px]"
                required
              />
              <button 
                type="submit"
                disabled={feedbackLoading || !feedbackMsg.trim()}
                className="w-full bg-foreground text-background py-3 rounded-full hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-robotic text-sm uppercase"
              >
                {feedbackLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>

        {/* Past Fraud Reports */}
        <div className="mt-8 bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-robotic uppercase tracking-tight">My Fraud Reports</h3>
              <p className="text-xs text-muted-foreground">Your submitted on-chain fraud warnings</p>
            </div>
          </div>
          
          {reportsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Fetching reports...
            </div>
          ) : pastReports.length > 0 ? (
            <div className="space-y-3">
              {pastReports.map((report) => (
                <div key={report.id} className="p-4 bg-muted/30 border border-border rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-mono text-sm text-primary">{report.wallet_address}</span>
                    <span className="text-xs text-muted-foreground">{new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground italic mb-2">"{report.description}"</p>
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <span className="text-orange-500">Lost: {report.amount_lost} XLM</span>
                    {report.blockchain_tx_hash && (
                      <a href={`https://stellar.expert/explorer/testnet/tx/${report.blockchain_tx_hash}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        View Tx
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">You haven't submitted any fraud reports yet.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
