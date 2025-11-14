import React from 'react';
import { ArrowRight, Shield, Zap, Users } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-800 leading-tight">
              Collect payments with{' '}
              <span className="text-indigo-600">ease</span> for your campus association
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl">
              PayPoint is the digital payment management platform designed for university associations and groups. 
              Create customized PayPoints, collect funds seamlessly, and manage everything in one place.
            </p>
            
            {/* Features */}
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-6">
              <div className="flex items-center space-x-2 text-slate-600">
                <Shield className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-medium">Secure Payments</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600">
                <Zap className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-medium">Instant Setup</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600">
                <Users className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-medium">Team Management</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="/apply"
                className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Apply to Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a
                href="/how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-slate-50 text-indigo-600 font-semibold rounded-lg border border-indigo-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Learn How It Works
              </a>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Digital payment dashboard interface"
                className="rounded-2xl shadow-2xl w-full h-auto"
                loading="lazy"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
