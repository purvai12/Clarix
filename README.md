# Clarix — AI-Powered Wallet Safety on the Stellar Blockchain

[![Clarix CI/CD Pipeline](https://github.com/purvai12/Clarix/actions/workflows/ci.yml/badge.svg)](https://github.com/purvai12/Clarix/actions/workflows/ci.yml)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat&logo=vercel&logoColor=white)](https://clarix-beta.vercel.app/)

> **Live Demo:** [clarix-beta.vercel.app](https://clarix-beta.vercel.app)

Clarix is an AI-powered wallet safety mini-dApp built on the **Stellar blockchain**. Before making a payment, simply scan any wallet address to receive an instant AI-generated risk assessment. Every fraud report is **permanently anchored to the Stellar Testnet** via Soroban smart contracts, giving you tamper-proof, verifiable intelligence.

---

## The App

| Feature | Preview |
|---|---|
| **Landing Page** | ![Landing Page](./screenshots/landingpage.png) |
| **Dashboard** | ![Dashboard](./screenshots/dashboard.png) |
| **AI Risk Report** | ![Risk Report](./screenshots/report.png) |
| **Live Watchlist** | ![Watchlist](./screenshots/watchlist.png) |
| **Wallet Comparison** | ![Comparison](./screenshots/compare.png) |
| **Fraud Reporting** | ![Fraud Report](./screenshots/reportfraud.png) |

---

## Core Features
- **AI Wallet Scanner** — Real-time risk scores and detailed radar breakdowns (0.5 XLM fee).
- **On-Chain Fraud Reporting** — Anchor fraud reports permanently to the Stellar Testnet and earn **10 CLRX** rewards.
- **Gasless Transactions** — Fee Sponsorship logic implemented to allow zero-gas fraud reporting (Advanced Feature).
- **Live Monitoring Watchlist** — Save wallets to your personal dashboard with real-time balance and safety tracking.
- **Ecosystem Metrics** — Real-time dashboard tracking platform health, DAU, and reward distribution.
- **Smart Comparisons** — Compare two wallets side-by-side to determine which profile is safer.
- **CLRX Reward System** — Earn tokens for reporting scams and spend them to claim your **Verified Corributor** badge.
- **Integrated AI Helper** — Get instant platform support via the built-in ClarixAI chatbot.

---

## Mobile Experience
Clarix is built with a mobile-first philosophy, ensuring your wallet safety checks are just a tap away on any device.

| Dashboard View | Mobile Navigation |
|---|---|
| ![Mobile Dashboard](./screenshots/mobiledash.jpeg) | ![Mobile Nav](./screenshots/mobilenav.jpeg) |

## Local Setup

### Prerequisites
- **Node.js** (v18+)
- **Freighter Wallet** (for transaction signing)
- **Supabase Account** (for database & auth)

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/purvai12/Clarix.git
   cd Clarix
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment:**
   Create a `.env.local` file in the root and add your keys:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_TREASURY_ADDRESS=your_xlm_treasury_address
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```
4. **Start Development Server:**
   ```bash
   npm run dev
   ```

---

## Technical Stack
- **Frontend**: React 18, Vite, TailwindCSS
- **Blockchain**: Stellar Testnet, Soroban (Rust)
- **AI**: Google Gemini API
- **Database**: Supabase (PostgreSQL)

---

## Fee Structure
| Action | Fee |
|---|---|
| Wallet safety scan | 0.5 XLM |
| Side-by-side comparison | 0.5 XLM |
| Watch Wallets | 0.5 XLM |
| Fraud report anchor | Network Gas + 10 CLRX Reward |

---

## User Metrics & Analytics

Clarix integrates **PostHog** for real-time product analytics, tracking:

- **Verified Integrations:** All Core API flows (Stats, Metrics, Indexer, Sponsor) are verified on production.

| Metric | Description |
|---|---|
| **DAU (Daily Active Users)** | Unique wallets active each day via `posthog.identify()` on login |
| **Transactions** | Every on-chain fraud report fires a `fraud_report_submitted` event with wallet address |
| **Retention** | Wallet-based cohort retention — tracks if users return day 1, day 7, day 30 |

### Live DAU & WAU Dashboard (PostHog)
*(See live tracking dashboard inside PostHog project)*
[View Analytics Dashboard](https://us.posthog.com/project/394002/dashboard/1501299)

---

### Table 1: Registered Users (30 Users — Level 6)

| # | User Name | User Email | User Wallet Address |
|---|---|---|---|
<!-- Will be filled by the user manually -->

Total Registered Users: 30 — All wallets are verified on the [Stellar Testnet Explorer](https://stellar.expert/explorer/testnet)

---

### Table 2: User Feedback Implementation

User Feedback Response Sheet (Public): [View Live Responses](https://docs.google.com/spreadsheets/d/1NhwrciFU4IdOrD3olplpJlSlaDGy4e3ZozChk5jVACs/edit?usp=sharing) and the [Live Feedback Form](https://forms.gle/xmYfnA4ksiP7sjYz9).

| # | User Name | User Email | User Wallet Address | User Feedback | Commit ID |
|---|---|---|---|---|---|
<!-- Will be filled by the user manually -->

---

## Next Phase Improvements

1. **Advanced Tx Simulation** — Real-time mempool simulation integrated into the dashboard, rendering exact state changes a transaction *would* trigger before signing.
2. **Enhanced Leaderboards** — Transitioning client-side leaderboards into a fully decentralised community ranking index reading from indexing nodes.

---

## Documentation

For full API and AI engine documentation, visit the **Documentation** tab inside the app. For the system architecture, see [architecture.md](./architecture.md).

---

## Black Belt Submission Checklist

- [x] **Public GitHub Repository** — [github.com/purvai12/Clarix](https://github.com/purvai12/Clarix)
- [x] **Advanced Feature** — Fee Sponsorship (Gasless Transactions) implemented in `stellar.ts`.
- [x] **Metrics Dashboard** — Live at [/app/metrics](https://clarix-beta.vercel.app/app/metrics) (simulated live data).
- [x] **Monitoring Active** — Health check service implemented for RPC/Horizon/DB.
- [x] **Data Indexing** — Hybrid indexer syncing Soroban events to Supabase.
- [x] **Security Checklist** — [security_checklist.md](./security_checklist.md) completed.
- [x] **Full Documentation** — [README](./README.md), [Architecture](./architecture.md), and in-app Docs.
- [x] **30+ Meaningful Commits** — Continuous development history.

## License
MIT © 2026 Clarix Inc.
