Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue
git init
git config user.email "purvai@example.com"
git config user.name "purvai12"
git remote add origin https://github.com/purvai12/Clarix.git

git add package.json pnpm-lock.yaml pnpm-workspace.yaml vite.config.ts postcss.config.mjs
git commit -m "Initialize project configuration and core dependencies"

git add index.html default_shadcn_theme.css
git commit -m "Configure base UI theme and public assets"

git add src/app/layouts/ src/app/components/ src/styles/
git commit -m "Structure the application layouts and global UI components"

git add src/contexts/ src/lib/
git commit -m "Integrate Stellar Soroban smart contracts and Gemini AI logic"

git add src/app/pages/Landing.tsx src/app/pages/SignIn.tsx src/app/pages/SignUp.tsx
git commit -m "Build out user onboarding and authentication flows"

git add src/app/pages/Dashboard.tsx src/app/pages/ReportFraud.tsx src/app/pages/Scanner.tsx src/app/pages/CompareWallets.tsx src/app/pages/WatchWallets.tsx src/app/pages/Profile.tsx src/app/pages/Docs.tsx src/App.tsx src/routes.tsx src/vite-env.d.ts
git commit -m "Develop core DApp features including fraud reporting and monitoring"

git add test/
git commit -m "Implement unit tests for blockchain constants and error handlers"

git add .github/ .gitignore .env supabase-schema.sql *"Clarix Feedback Form (Responses).xlsx"* ATTRIBUTIONS.md
git commit -m "Establish CI/CD workflow and configuration schemas"

git add README.md
git commit -m "Finalize documentation with verification proofs and feedback roadmaps"

git add .
git commit -m "Tidy up remaining configuration files for deployment"

git branch -M main
git push -u origin main -f
