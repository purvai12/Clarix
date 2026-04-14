# Clarix - AI-Powered Wallet Safety on Stellar

[![CI Pipeline](https://github.com/purvai12/Clarix/actions/workflows/ci.yml/badge.svg)](https://github.com/purvai12/Clarix/actions)

Clarix is an AI-powered wallet safety mini-dApp built on the Stellar blockchain. Before making a payment, simply scan any wallet address to receive an instant AI-generated risk assessment. Every fraud report is permanently anchored to the Stellar Testnet via Soroban smart contracts, giving you tamper-proof verifiable intelligence.

**Live Demo URL:** [https://clarix-beta.vercel.app/](https://clarix-beta.vercel.app/)  
**Demo Video:** [Watch Demo Video Here](#) *(Placeholder)*  
**User Feedback Form:** [Google Form Link](https://forms.gle/wb4x1UDGMSWNebMVA)  
**User Feedback Responses:** [Clarix Feedback Form (Responses).xlsx](./Clarix%20Feedback%20Form%20(Responses).xlsx)

## Next Phase Evolution Based on User Feedback

Based on the collected user feedback, here is our roadmap for the next phase of development:
- **Enhanced Mobile UI Elements:** Improve the spacing and contrast for mobile users (based on feedback regarding readability in sunlight).
- **Expanded Token Integrations:** Incorporate a wider variety of custom tokens mapped to wallet risk profiles.
- **Improved Smart Contract Reporting:** Collect qualitative metrics alongside the boolean fraud toggles.
- **Git Commits for Improvements:** See our history for future git commits corresponding to these items.

## Mobile Responsive View

![Mobile View](./public/mobile-view.png)
*(Note: Replace with actual screenshot)*

## Smart Contract Details (Stellar Testnet)

| Contract | ID |
|----------|-----|
| ClarixRegistry | `CBLTKX433VCXF4TRKGNP4V26UAWJZ6YXC2VVXYGQM2NDIBFIQFTQZGTY` |
| ClarixReward | `CDCLUCN5DQWEHQB3FWP7N6D6NT54WBWAXO5EZI6HCVFBZFT3AIAJCEX7` |
| Admin Keypair | `GDUSDXP3RR7FIY6JOAKPFKULKWJIR6QX4F7OXGAR5PAPGJSCNKATUFF7` |

**Testnet Transaction Hash for Inter-contract Call:** 
`c7f8a15995b0789d3a778c89bdf0f023ea234b6b63ca0c5db6110f22ffcad5c4` (Demonstrated in test environment).

Inter-contract call: When a user files a report through `clarix_registry::file_report(...)`, it automatically invokes `clarix_reward::reward(reporter_address)` to mint 10 CLRX tokens.

## Error Handling

The application handles three types of blockchain errors natively via the UI:

| Error | Cause | User Message |
|-------|-------|--------------|
| `UserRejectedError` | User clicks Cancel in Freighter wallet | "Transaction rejected by user." |
| `InsufficientFundsError` | Account has no XLM for fees | "Insufficient XLM to pay the network fee." |
| `NetworkError` | RPC/simulation failure, timeout | "Network or simulation error: [detail]" |

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite |
| Blockchain | Stellar Testnet, Soroban (Rust) |
| AI | Google Gemini API |
| Database | Supabase (PostgreSQL) |
| Wallet | Freighter Extension |

## Setup Instructions

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account
- Google Gemini API key
- Freighter wallet extension

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env.local` file with your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_TREASURY_ADDRESS=your_stellar_treasury_address
   ```

4. Set up Supabase database using the schema in `supabase-schema.sql`
5. Start the development server:
   ```bash
   pnpm dev
   ```

## Mobile Responsive

The navigation bar, dashboard, and all content screens are fully responsive. The top nav pill bar becomes horizontally scrollable on narrow viewports while keeping the user profile always visible.

## License

MIT
