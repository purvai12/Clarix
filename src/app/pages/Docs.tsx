import { motion } from 'motion/react';
import { Book, Shield, Zap, Award, Info, Lock, Globe, Mail } from 'lucide-react';

export function Docs() {
  const sections = [
    {
      title: 'What is Clarix?',
      icon: Shield,
      content: 'Clarix is a next-generation wallet safety platform built on the Stellar blockchain. It uses advanced AI and machine learning to analyze wallet behavior, detect potential fraud, and provide real-time risk assessments for users in the Stellar ecosystem.'
    },
    {
      title: 'AI Scanner Technology',
      icon: Zap,
      content: 'Our AI Scanner fetches live blockchain data from Horizon, including native XLM balance and the most recent transaction history. This data is then analyzed by our specialized models to identify patterns associated with phishing, wash trading, and other malicious activities.'
    },
    {
      title: 'CLRX Rewards',
      icon: Award,
      content: 'Users can earn CLRX tokens by contributing to the platform. Filing valid fraud reports and participating in community governance rewards you with tokens that can be used for platform features or community status.'
    },
    {
      title: 'Self-Custody First',
      icon: Lock,
      content: 'Clarix never holds your private keys. We integrate with industry-standard wallets like Freighter and Albedo to ensure that you always remain in full control of your assets while using our safety tools.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Book className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-robotic">Documentation</h1>
            <p className="text-muted-foreground text-lg">Learn how Clarix protects the Stellar ecosystem.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border p-8 rounded-2xl hover:border-primary/50 transition-colors"
            >
              <section.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl mb-3 font-robotic">{section.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-8 mb-16">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-2xl mb-4 font-robotic">Technical Architecture</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground mb-4">
                  Clarix is built using a modern decoupled architecture:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>Frontend:</strong> React + Vite with Tailwind CSS for high performance and responsive UI.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>Blockchain:</strong> Integration with Stellar Horizon API and Soroban Smart Contracts.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>AI Layer:</strong> Google Gemini Data Models for pattern recognition and risk assessment.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>Backend:</strong> Supabase for user profiles and off-chain reputation data.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl mb-6 font-robotic">Need more help?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="mailto:support@clarix.io" className="px-6 py-3 bg-muted hover:bg-muted/80 rounded-full transition-colors flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Community Forum
            </a>
            <a href="mailto:support@clarix.io" className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full transition-colors flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Contact Support
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
