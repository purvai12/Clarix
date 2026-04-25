<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Clarix React Router v7 (Data mode) application. PostHog is initialized in `src/main.tsx` and the `PostHogProvider` wraps the entire application. User identification is performed at sign-up and sign-in using the Supabase user ID. Nine events are instrumented across five files covering the full user journey: auth, wallet management, AI wallet scanning, fraud reporting, and watchlist management. A root-level error boundary captures unhandled React Router errors via `captureException`, and inline error tracking is added to all critical async flows.

| Event | Description | File |
|---|---|---|
| `user_signed_up` | User completes registration with email, password, username, and Stellar wallet | `src/contexts/AuthContext.tsx` |
| `user_signed_in` | User successfully signs in with email and password | `src/contexts/AuthContext.tsx` |
| `user_signed_out` | User signs out (PostHog session is reset) | `src/contexts/AuthContext.tsx` |
| `wallet_connected` | User connects a Stellar wallet via StellarWalletsKit | `src/contexts/AuthContext.tsx` |
| `wallet_disconnected` | User disconnects their Stellar wallet | `src/contexts/AuthContext.tsx` |
| `wallet_scanned` | User completes an AI risk scan of a Stellar address (core conversion event) | `src/app/pages/Scanner.tsx` |
| `fraud_report_submitted` | User submits an on-chain fraud report and earns CLRX reward | `src/app/pages/ReportFraud.tsx` |
| `watched_wallet_added` | User adds a wallet address to their watchlist | `src/app/pages/WatchWallets.tsx` |
| `watched_wallet_removed` | User removes a wallet from their watchlist | `src/app/pages/WatchWallets.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/394002/dashboard/1501299
- **Signup → Signin Conversion Funnel**: https://us.posthog.com/project/394002/insights/R6gIjXvo
- **Wallet Scans over Time**: https://us.posthog.com/project/394002/insights/qn5UCTV5
- **Fraud Reports Submitted**: https://us.posthog.com/project/394002/insights/eLlP6CZr
- **New Users and Sign-ins**: https://us.posthog.com/project/394002/insights/RqJ973T9
- **Wallet Connection and Disconnection**: https://us.posthog.com/project/394002/insights/EISgvhxi

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-react-react-router-7-data/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
