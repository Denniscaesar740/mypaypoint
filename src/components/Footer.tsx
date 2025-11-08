import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Twitter, Facebook, Instagram, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <CreditCard className="h-8 w-8 text-indigo-400" />
              <span className="text-xl font-bold">PayPoint</span>
            </div>
            <p className="text-slate-400 mb-4 max-w-md">
              The digital payment management platform designed for university associations and groups. 
              Collect payments seamlessly with customized PayPoints.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="mailto:support@paypoint.com" className="text-slate-400 hover:text-indigo-400 transition-colors" aria-label="Email">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/platform-structure" className="text-slate-400 hover:text-white transition-colors">
                  Platform Structure
                </Link>
              </li>
              <li>
                <Link to="/core-functionalities" className="text-slate-400 hover:text-white transition-colors">
                  Core Functionalities
                </Link>
              </li>
              <li>
                <Link to="/analytics-insights" className="text-slate-400 hover:text-white transition-colors">
                  Analytics &amp; Insights
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-slate-400 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-slate-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/apply" className="text-slate-400 hover:text-white transition-colors">
                  Apply Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-slate-400 hover:text-white transition-colors">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            © 2025 PayPoint. All rights reserved.
          </p>
          <p className="text-slate-400 text-sm mt-2 sm:mt-0">
            Built with ❤️ by <a rel="nofollow" target="_blank" href="https://meku.dev" className="text-indigo-400 hover:text-indigo-300 transition-colors">Meku.dev</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
