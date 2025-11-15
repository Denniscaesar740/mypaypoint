import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

const CTASection: React.FC = () => {
  const features = [
    'Setup in under 24 hours',
    'No setup fees or hidden costs',
    'Dedicated support team',
    'Secure payment processing'
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-indigo-600 to-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Association's Payments?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of student associations already using PayPoint to collect payments seamlessly.
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-indigo-100">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/apply"
              className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-slate-50 text-indigo-600 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
            >
              Apply Now - It's Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent hover:bg-white/10 text-white font-semibold rounded-lg border border-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
            >
              Have Questions? Contact Us
            </a>
            <a
              href="/paypoint"
              className="inline-flex items-center justify-center px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-lg border border-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
            >
              Open a PayPoint
            </a>
          </div>

          <p className="text-indigo-200 text-sm mt-6">
            No credit card required - Free to apply - Get started in minutes
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
