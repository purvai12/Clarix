-- Clarix Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  clrx_balance INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Fraud reports table
CREATE TABLE IF NOT EXISTS fraud_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  description TEXT NOT NULL,
  amount_lost DECIMAL(20, 7) DEFAULT 0,
  transaction_hash TEXT,
  blockchain_tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE fraud_reports ENABLE ROW LEVEL SECURITY;

-- Policies for fraud_reports
CREATE POLICY "Users can view all fraud reports"
  ON fraud_reports FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Users can insert their own reports"
  ON fraud_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Watched wallets table
CREATE TABLE IF NOT EXISTS watched_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  nickname TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, wallet_address)
);

-- Enable RLS
ALTER TABLE watched_wallets ENABLE ROW LEVEL SECURITY;

-- Policies for watched_wallets
CREATE POLICY "Users can view their own watched wallets"
  ON watched_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watched wallets"
  ON watched_wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watched wallets"
  ON watched_wallets FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_fraud_reports_wallet ON fraud_reports(wallet_address);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_reporter ON fraud_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_watched_wallets_user ON watched_wallets(user_id);
