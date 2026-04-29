import { motion } from 'motion/react';
import { Shield, Lock, Fingerprint, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function Landing() {
  return (
    <div className="size-full overflow-y-auto bg-background">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
            alt="Blockchain security"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <img src="/logo.png" alt="Clarix Logo" className="w-24 h-24 object-contain opacity-70" />
            </motion.div>

            <h1 className="text-6xl md:text-8xl text-white mb-6 tracking-tight">Clarix</h1>

            <p className="text-xl md:text-2xl text-white/90 mb-4 max-w-xl">
              AI-powered wallet safety on Stellar blockchain
            </p>
            <p className="text-lg text-white/70 mb-12 max-w-xl">
              Scan any wallet for instant risk assessment. Report fraud on-chain. Earn CLRX rewards.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white text-black px-10 py-4 rounded-full hover:bg-white/90 transition-colors flex items-center gap-2"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link to="/auth/signin">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="border-2 border-white text-white px-10 py-4 rounded-full hover:bg-white/10 transition-colors"
                >
                  Sign In
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-8 md:px-16 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl mb-24 max-w-3xl">
            Blockchain-verified fraud protection
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Fingerprint className="w-12 h-12 mb-6" strokeWidth={1.5} />
              <h3 className="mb-4">AI Wallet Scanner</h3>
              <p className="text-muted-foreground leading-relaxed">
                Paste any Stellar address for instant AI-powered risk assessment before sending funds.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Lock className="w-12 h-12 mb-6" strokeWidth={1.5} />
              <h3 className="mb-4">On-Chain Reports</h3>
              <p className="text-muted-foreground leading-relaxed">
                Fraud reports permanently stored via Soroban smart contracts on Stellar Testnet.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <img src="/logo.png" alt="Clarix Logo" className="w-12 h-12 mb-6 object-contain" />
              <h3 className="mb-4">Earn CLRX Rewards</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get 10 CLRX tokens for every verified fraud report. Spend 50 CLRX for verification badge.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 px-8 md:px-16 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl mb-8">Built for the Stellar ecosystem</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Check className="w-6 h-6 mt-1 flex-shrink-0" strokeWidth={2} />
                  <div>
                    <h4 className="mb-2">Watch wallets in real-time</h4>
                    <p className="text-muted-foreground">Monitor saved addresses for suspicious activity</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Check className="w-6 h-6 mt-1 flex-shrink-0" strokeWidth={2} />
                  <div>
                    <h4 className="mb-2">Compare wallets side-by-side</h4>
                    <p className="text-muted-foreground">Risk comparison of two addresses before transacting</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Check className="w-6 h-6 mt-1 flex-shrink-0" strokeWidth={2} />
                  <div>
                    <h4 className="mb-2">Global AI assistant</h4>
                    <p className="text-muted-foreground">ClarixAI chatbot available on every screen</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-[500px]"
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1639322537228-f710d846310a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
                alt="Stellar blockchain"
                className="w-full h-full object-cover rounded-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-8 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-5xl md:text-6xl mb-8">Ready to protect your assets?</h2>
          <p className="text-xl text-muted-foreground mb-12">
            Join the community building a safer Stellar ecosystem.
          </p>
          <Link to="/auth/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="bg-primary text-primary-foreground px-12 py-5 rounded-full hover:bg-primary/90 transition-colors"
            >
              Start Scanning Wallets
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
