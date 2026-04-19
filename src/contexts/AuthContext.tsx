import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import {
  StellarWalletsKit,
  Networks,
} from '@creit.tech/stellar-wallets-kit';
import { defaultModules } from '@creit.tech/stellar-wallets-kit/modules/utils';
import { getWalletData } from '../lib/stellar';

interface Profile {
  id: string;
  email: string;
  username: string;
  clrx_balance: number;
  is_verified: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  walletAddress: string | null;
  xlmBalance: string | null;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: (userId?: string) => Promise<void>;
  refreshBalance: () => Promise<void>;
  connectWallet: () => Promise<string>;
  disconnectWallet: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const WALLET_STORAGE_KEY = 'clarix_wallet_address';

StellarWalletsKit.init({
  modules: defaultModules(),
  network: Networks.TESTNET,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]                 = useState<User | null>(null);
  const [profile, setProfile]           = useState<Profile | null>(null);
  const [loading, setLoading]           = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(
    () => localStorage.getItem(WALLET_STORAGE_KEY)
  );
  const [xlmBalance, setXlmBalance]     = useState<string | null>(null);

  // ── Profile loader ────────────────────────────────────────────────────────
  // Accepts an optional userId so it can be called before React state updates.
  const refreshProfile = async (userId?: string) => {
    const id = userId ?? user?.id;
    if (!id) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (!error && data) {
      setProfile(data);
    } else {
      setProfile({
        id,
        email: user?.email || 'Unknown',
        username: user?.user_metadata?.username || 'User',
        clrx_balance: 0,
        is_verified: false,
        wallet_address: walletAddress ?? null,
      } as Profile);
    }
  };

  // ── XLM balance loader ────────────────────────────────────────────────────
  const refreshBalance = async () => {
    const addr = walletAddress ?? localStorage.getItem(WALLET_STORAGE_KEY);
    if (!addr) return;
    try {
      const { balance } = await getWalletData(addr);
      setXlmBalance(balance);
    } catch {
      setXlmBalance(null);
    }
  };

  // ── Auth state listener ───────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      // Pass the user id directly — React state hasn't updated yet at this point
      if (session?.user) refreshProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) refreshProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []); // Run once on mount only

  // ── Auto-fetch balance when wallet address is known ───────────────────────
  useEffect(() => {
    if (walletAddress) refreshBalance();
  }, [walletAddress]);

  // ── Wallet connect ────────────────────────────────────────────────────────
  const connectWallet = async (): Promise<string> => {
    const { address } = await StellarWalletsKit.authModal();
    setWalletAddress(address);
    localStorage.setItem(WALLET_STORAGE_KEY, address);
    // Fetch balance immediately after connect
    try {
      const { balance } = await getWalletData(address);
      setXlmBalance(balance);
    } catch {
      /* ignore */
    }
    return address;
  };

  // ── Wallet disconnect ─────────────────────────────────────────────────────
  const disconnectWallet = async () => {
    await StellarWalletsKit.disconnect().catch(console.error);
    setWalletAddress(null);
    setXlmBalance(null);
    localStorage.removeItem(WALLET_STORAGE_KEY);
  };

  // ── Sign up ───────────────────────────────────────────────────────────────
  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id:           data.user.id,
        email,
        username,
        clrx_balance: 0,
        is_verified:  false,
        wallet_address: walletAddress ?? null,
      });
      if (profileError) throw profileError;
    }
  };

  // ── Sign in ───────────────────────────────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // Refresh balance after sign-in
    setTimeout(() => refreshBalance(), 500);
  };

  // ── Sign out ──────────────────────────────────────────────────────────────
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        walletAddress,
        xlmBalance,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        refreshBalance,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
