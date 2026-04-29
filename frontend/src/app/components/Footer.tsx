import { Shield, Mail, Github } from 'lucide-react';
import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Clarix Logo" className="w-8 h-8 object-contain bg-black rounded p-1" />
              <span className="text-xl font-robotic tracking-wider uppercase">Clarix</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The first AI-powered wallet safety platform on the Stellar blockchain. Protecting your assets with real-time risk assessment.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-robotic uppercase tracking-widest mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="/app" className="text-sm text-muted-foreground hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link to="/app/scanner" className="text-sm text-muted-foreground hover:text-primary transition-colors">AI Scanner</Link></li>
              <li><Link to="/app/report" className="text-sm text-muted-foreground hover:text-primary transition-colors">Report Fraud</Link></li>
              <li><Link to="/app/docs" className="text-sm text-muted-foreground hover:text-primary transition-colors">Documentation</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-robotic uppercase tracking-widest mb-4">Community</h3>
            <ul className="space-y-2">
              <li><a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">Stellar Ecosystem</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-robotic uppercase tracking-widest mb-4">Connect</h3>
            <div className="flex gap-4 mb-4">
              <a href="https://github.com/purvai12" target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-lg hover:bg-primary hover:text-primary-foreground transition-all">
                <Github className="w-5 h-5" />
              </a>
              <a href="mailto:support@clarix.io" className="p-2 bg-muted rounded-lg hover:bg-primary hover:text-primary-foreground transition-all">
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              Email us: support@clarix.io
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Clarix Protocol. Built with ❤️ on Stellar.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-xs text-muted-foreground hover:underline">Privacy Policy</Link>
            <Link to="/terms" className="text-xs text-muted-foreground hover:underline">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
