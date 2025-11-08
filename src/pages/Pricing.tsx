import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Check, X } from 'lucide-react';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for small associations getting started',
      features: [
        'Up to 5 PayPoints',
        'Up to 100 transactions/month',
        'Basic analytics',
        'Email support',
        'Mobile money integration',
        'Basic team management (2 admins)'
      ],
      limitations: [
        'Limited customization',
        'PayPoint branding',
        'Basic reporting only'
      ],
      cta: 'Get Started Free',
      popular: false
    },
    {
      name: 'Professional',
      price: '2.5%',
      priceNote: 'per transaction',
      description: 'Ideal for active associations with regular payments',
      features: [
        'Unlimited PayPoints',
        'Unlimited transactions',
        'Advanced analytics & insights',
        'Priority email & chat support',
        'Mobile money & card payments',
        'Unlimited team members',
        'Custom branding',
        'Detailed reporting & exports',
        'Refund management',
        'Payment restrictions & rules'
      ],
      limitations: [],
      cta: 'Start Professional',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large associations and multi-organization setups',
      features: [
        'Everything in Professional',
        'Dedicated account manager',
        'Phone support',
        'Custom integrations',
        'Advanced security features',
        'White-label solution',
        'Custom reporting',
        'API access',
        'Training & onboarding',
        'SLA guarantee'
      ],
      limitations: [],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const faqs = [
    {
      question: 'Are there any setup fees?',
      answer: 'No, there are no setup fees for any of our plans. You can get started immediately after approval.'
    },
    {
      question: 'How do transaction fees work?',
      answer: 'For the Professional plan, we charge 2.5% per successful transaction. This covers payment processing, platform maintenance, and support. The Starter plan is completely free with limitations.'
    },
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the start of your next billing cycle.'
    },
    {
      question: 'What payment methods do you support?',
      answer: 'We support mobile money (MTN, Vodafone, AirtelTigo) and major credit/debit cards through our integration with Hubtel and other trusted payment gateways.'
    },
    {
      question: 'How quickly do I receive payments?',
      answer: 'Payments are typically settled to your account within 1-2 business days, depending on your payment gateway and bank processing times.'
    },
    {
      question: 'Is there a contract or can I cancel anytime?',
      answer: 'There are no long-term contracts. You can cancel your account at any time. For the Professional plan, you only pay transaction fees as you use the service.'
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-zinc-800 mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Choose the plan that fits your association's needs. Start free and scale as you grow.
            </p>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative rounded-2xl p-8 ${
                    plan.popular
                      ? 'bg-indigo-600 text-white shadow-2xl scale-105'
                      : 'bg-white border border-slate-200 shadow-sm'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-yellow-400 text-zinc-800 px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-zinc-800'}`}>
                      {plan.name}
                    </h3>
                    <div className="mb-4">
                      <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-zinc-800'}`}>
                        {plan.price}
                      </span>
                      {plan.priceNote && (
                        <span className={`text-sm ml-2 ${plan.popular ? 'text-indigo-100' : 'text-slate-600'}`}>
                          {plan.priceNote}
                        </span>
                      )}
                    </div>
                    <p className={`${plan.popular ? 'text-indigo-100' : 'text-slate-600'}`}>
                      {plan.description}
                    </p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className={`h-5 w-5 mt-0.5 mr-3 flex-shrink-0 ${
                          plan.popular ? 'text-green-300' : 'text-green-500'
                        }`} />
                        <span className={`text-sm ${plan.popular ? 'text-white' : 'text-slate-700'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, limitationIndex) => (
                      <li key={limitationIndex} className="flex items-start">
                        <X className={`h-5 w-5 mt-0.5 mr-3 flex-shrink-0 ${
                          plan.popular ? 'text-red-300' : 'text-red-500'
                        }`} />
                        <span className={`text-sm ${plan.popular ? 'text-indigo-100' : 'text-slate-500'}`}>
                          {limitation}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      plan.popular
                        ? 'bg-white text-indigo-600 hover:bg-slate-50 focus:ring-white'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-800 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-slate-600">
                Everything you need to know about PayPoint pricing and features.
              </p>
            </div>

            <div className="space-y-8">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl p-8 shadow-sm">
                  <h3 className="text-xl font-semibold text-zinc-800 mb-4">
                    {faq.question}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-indigo-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of student associations already using PayPoint. No setup fees, no hidden costs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/apply"
                className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-slate-50 text-indigo-600 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
              >
                Start Free Today
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent hover:bg-white/10 text-white font-semibold rounded-lg border border-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;