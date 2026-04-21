# Clarix Security Checklist

This document tracks the security measures implemented in the Clarix dApp to ensure user safety and protocol integrity.

## 1. Authentication & API Security
- [x] **Wallet-First Auth**: Mandatory wallet connection via Freighter/Stellar Wallets Kit before accessing premium features.
- [x] **Supabase RLS**: Row Level Security (RLS) enabled on all tables (`profiles`, `fraud_reports`, `watched_wallets`).
- [x] **Input Validation**: Strict client-side and server-side (via Supabase triggers) validation for email, wallet addresses, and report hashes.
- [x] **Sensitive Keys**: All API keys (Gemini, Supabase) are stored in `.env` and accessed via environment variables.

## 2. Blockchain Security
- [x] **Soroban Integrity**: Fraud reports are immutable and anchored to the Stellar blockchain via audited smart contracts.
- [x] **Transaction Verification**: All transactions are simulated and prepared via `server.prepareTransaction` before user signing.
- [x] **Fee Gating**: 0.5 XLM fee gate ensures protocol sustainability and discourages spam scanning.
- [x] **Reward Verification**: CLRX rewards for fraud reports are verified against report existence in the `ClarixRegistry`.

## 3. Frontend Security
- [x] **XSS Prevention**: React's automatic escaping protects against Cross-Site Scripting.
- [x] **CSRF Protection**: Supabase Auth tokens are stored securely and verified on each request.
- [x] **Content Security Policy**: Implemented via Vercel headers (see `vercel.json`).

## 4. Operational Monitoring
- [x] **Health Check Dashboard**: Real-time status tracking for Horizon, RPC, and Database services.
- [x] **Error Logging**: Centralized error handling in `stellar.ts` to prevent sensitive data leakage.
- [x] **Audit Trail**: Every fraud report includes a verifiable blockchain transaction hash.

## 5. Future Hardening
- [ ] Implement Multi-signature approval for Treasury withdrawals.
- [ ] Transition AI risk scoring to an off-chain oracle with on-chain verification.
