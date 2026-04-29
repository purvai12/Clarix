import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string;
          clrx_balance: number;
          is_verified: boolean;
          wallet_address: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          wallet_address?: string;
          clrx_balance?: number;
          is_verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          wallet_address?: string;
          clrx_balance?: number;
          is_verified?: boolean;
          created_at?: string;
        };
      };
      fraud_reports: {
        Row: {
          id: string;
          reporter_id: string;
          wallet_address: string;
          description: string;
          amount_lost: number;
          transaction_hash: string;
          blockchain_tx_hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          wallet_address: string;
          description: string;
          amount_lost: number;
          transaction_hash?: string;
          blockchain_tx_hash?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          wallet_address?: string;
          description?: string;
          amount_lost?: number;
          transaction_hash?: string;
          blockchain_tx_hash?: string;
          created_at?: string;
        };
      };
      watched_wallets: {
        Row: {
          id: string;
          user_id: string;
          wallet_address: string;
          nickname: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          wallet_address: string;
          nickname?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          wallet_address?: string;
          nickname?: string;
          created_at?: string;
        };
      };
    };
  };
};
