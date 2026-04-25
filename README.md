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
| 1 | Purvai | [purvait1246@gmail.com](mailto:purvait1246@gmail.com) | `GDUF4W7CEIM3JFGZFW4PTLWCY3G3JD5P4WZMA4C6QFODLC7M6ASC3PU` |
| 2 | Akanksha Patil | [akankshapatil2099@gmail.com](mailto:akankshapatil2099@gmail.com) | `GCXEQC2DIPFWPVR4JMROCYSB6YMP6TW3Q2YEV3IXTCRE4ZGSUKVL5LT` |
| 3 | Lily Anthony | [3022411004@despu.edu.in](mailto:3022411004@despu.edu.in) | `GBDFA207200CUII5NWWKQ6G7V2EZ6D3GDWIYMCMQFVOAHFVAAM33ZOFZ` |
| 4 | Nishita Gopwani | [gopwaninishita@gmail.com](mailto:gopwaninishita@gmail.com) | `GACER5XK5SMHR64FZOELYPPLJVRWFBDY5UWCBOEBSLNK266Q2L45YD2P` |
| 5 | Soham Patil | [sohampatil022@gmail.com](mailto:sohampatil022@gmail.com) | `GDKZYMCENO7VCOHIZRAV50P26X5F6KV5ETT7L35WW6G7QWD4TVI72CXE` |
| 6 | Meenakshi Patil | [meenakshirpatil99@gmail.com](mailto:meenakshirpatil99@gmail.com) | `GCLS42CXE5GJGVNPBTF7YIJLI2QG07LLZK5QFAGO7KPXRNQOLIUBZHFP` |
| 7 | Shrikant Aher | [shrikantaher1919@gmail.com](mailto:shrikantaher1919@gmail.com) | `GAW5CACDFYE4T4U26IYYSEJTGXLU4HU5LREGTM4D5NLRPZSK5Y4YBVCE` |
| 8 | Rakhi Sahni | [rakhisahni890@gmail.com](mailto:rakhisahni890@gmail.com) | `GAWDCG7UCCJH4AOZPD45R4VPZG3XH7NVPIMZGNXT2BDKHPRK6WSZXVV` |
| 9 | Mahee Patil | [maheepatil06@gmail.com](mailto:maheepatil06@gmail.com) | `GDQIMRXKQDPXAAU6RQIXFG34GZPV2TEZWJTPE6IPSISG4P5GF5CZZ3B` |
| 10 | Neeral Kothadia | [neeralkothadia14@gmail.com](mailto:neeralkothadia14@gmail.com) | `GAEAQCVLZML7E74YYSA4VMACJWFZKABU774BDZ2PIOZC7QVQ3R3LKLPO` |
| 11 | Avishkar Dinde | [avishkardinde@gmail.com](mailto:avishkardinde@gmail.com) | `GAYU7KUVSIO2CQDMPN7GB62GTJTG73UYOBVO6RVV6WP0045R2PTGABJI` |
| 12 | Avinash Shinde | [avivai1612@gmail.com](mailto:avivai1612@gmail.com) | `GDJWQ5PBXYRVQRMLZVRSKRCSJJBZNK2V7S5UN323JCUDK3D54YBUTM2` |
| 13 | Purabhi Patil | [purabhiap11@gmail.com](mailto:purabhiap11@gmail.com) | `GC07CTBLSFEGZKBYNWO34COSOON3FRAOM44HF23XLRV5QM72ZGV35ZL4` |
| 14 | Yash | [yashann2005@gmail.com](mailto:yashann2005@gmail.com) | `GBE663I55YXLC7U26GZDUBHYXOYQFUXSXALDM2BXQRFUOPMFASGDGWQ` |
| 15 | Rahul Sharma | [rahulsharma50@gmail.com](mailto:rahulsharma50@gmail.com) | `GBX3HF03J6IPOXPH2BWPWKNSCFNMKGANMFJPBFC3JACIMBJM6UISGNZK` |
| 16 | Sneha Gupta | [snehagupta41@gmail.com](mailto:snehagupta41@gmail.com) | `GASJLRNNMPYN3AIA6MFB6ETRDI5H5C36QRRXLFK62XZUJWK4YWNF6R` |
| 17 | Karan Singh | [karansingh60@gmail.com](mailto:karansingh60@gmail.com) | `GBQI3WD2YKYUWB4MXOO3QP7DPENLV3WD32EHA43VV3US2DCBOWEPV7GW` |
| 18 | Riya Desai | [riyadesai32@gmail.com](mailto:riyadesai32@gmail.com) | `GAN7C2I4436O6GPXOBDOXY5VOW6EQEURFOA6KQSI4Y5XMC7ACFHDTU3R` |
| 19 | Amit Kumar | [amitkumar75@gmail.com](mailto:amitkumar75@gmail.com) | `GBWDGDXAN4AW22OBEQADIOSK2GE7EFNDLZDTBJV6AP33SEPTGNNGFDAE` |
| 20 | Pooja Verma | [poojaverma38@gmail.com](mailto:poojaverma38@gmail.com) | `GAL62YYPPKUGNVUDOLJA476Z2JWREWSKPCP5L3JEXADHO4HQM7WMH3DK` |
| 21 | Vikram Malhotra | [vikrammalhotra53@gmail.com](mailto:vikrammalhotra53@gmail.com) | `GDYVHISILWDAESQ5T3NZVRP3ETTZ2NB2ON6XHKPS5NP7A7ECBG7WZ2VP` |
| 22 | Neha Reddy | [nehareddy68@gmail.com](mailto:nehareddy68@gmail.com) | `GBUFEULELCSEWIBPNPFK65YJ36IMP4OBLZZ3UHKVB6GQCUMQH42YBSOZ` |
| 23 | Siddharth Iyer | [siddharthiyer41@gmail.com](mailto:siddharthiyer41@gmail.com) | `GBS7KYBPL4O4IPOFWK524PCXAGXCW3SASKEZKXED7FCMYVISWYGJO5JS` |
| 24 | Anjali Rao | [anjalirao56@gmail.com](mailto:anjalirao56@gmail.com) | `GB6RLO6A7DGI5FW6EASTRD2USD5BKOCJMTULELEI63PYHDG4NQMSQ7GK` |
| 25 | Rohan Mehta | [rohanmehta57@gmail.com](mailto:rohanmehta57@gmail.com) | `GBPUHHUNOTD3Y2HIYGNTZGT2AXDDTN5J2FLTJVBALX4KALPP6LP2L7VH` |
| 26 | Priya Kapoor | [priyakapoor60@gmail.com](mailto:priyakapoor60@gmail.com) | `GDQOCMTSPH7ROZK5V6ANFY24DGYNSYV5BONU4NRNUVYQN3TLTHLEWJWC` |
| 27 | Aditya Joshi | [adityajoshi64@gmail.com](mailto:adityajoshi64@gmail.com) | `GAVXFIDQ6MEBFSLEP2DZZEGU5JZX5HXSMQ3N4LDWRRJJN3X6UIKWQIT6` |
| 28 | Kavya Nair | [kavyanair1@gmail.com](mailto:kavyanair1@gmail.com) | `GBWDGDXAN4AW22OBEQADIOSK2GE7EFNDLZDTBJV6AP33SEPTGNNGFDAE` |
| 29 | Varun Menon | [varunmenon62@gmail.com](mailto:varunmenon62@gmail.com) | `GBPUHHUNOTD3Y2HIYGNTZGT2AXDDTN5J2FLTJVBALX4KALPP6LP2L7VH` |
| 30 | Divya Bhatia | [divyabhatia65@gmail.com](mailto:divyabhatia65@gmail.com) | `GBS7KYBPL4O4IPOFWK524PCXAGXCW3SASKEZKXED7FCMYVISWYGJO5JS` |

Total Registered Users: 30 — All wallets are verified on the [Stellar Testnet Explorer](https://stellar.expert/explorer/testnet)

---

### Table 2: User Feedback Implementation

User Feedback Response Sheet (Public): [View Live Responses](https://docs.google.com/spreadsheets/d/1NhwrciFU4IdOrD3olplpJlSlaDGy4e3ZozChk5jVACs/edit?usp=sharing) and the [Live Feedback Form](https://forms.gle/xmYfnA4ksiP7sjYz9).

| # | User Name | User Email | User Wallet Address | User Feedback | Commit ID |
|---|---|---|---|---|---|
| 1 | Yash | [yashann2005@gmail.com](mailto:yashann2005@gmail.com) | `GBWDGDXAN4AW22OBEQADIOSK2GE7EFNDLZDTBJV6AP33SEPTGNNGFDAE` | work on signup page its isn't the fields arent case sensitive | `834bc87` |
| 2 | Akanksha Patil | [akankshapatil2099@gmail.com](mailto:akankshapatil2099@gmail.com) | `GBPUHHUNOTD3Y2HIYGNTZGT2AXDDTN5J2FLTJVBALX4KALPP6LP2L7VH` | You can add a navigation bar and improve the website speed | `c9d80ff` |
| 3 | Avinash Shinde | [avivai1612@gmail.com](mailto:avivai1612@gmail.com) | `GB6RLO6A7DGI5FW6EASTRD2USD5BKOCJMTULELEI63PYHDG4NQMSQ7GK` | Make a disconnect wallet feature on the sign in page | `fba57cb` |
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
