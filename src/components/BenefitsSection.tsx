import React from 'react';
import { Shield, Zap, Eye, Users, TrendingUp, Clock } from 'lucide-react';

const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: Zap,
      title: 'Fast Setup',
      description: 'Get your association up and running in minutes. Create PayPoints instantly and start collecting payments right away.'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Bank-grade security with encrypted transactions. Integrated with trusted payment gateways like Hubtel for Ghana.'
    },
    {
      icon: Eye,
      title: 'Transparent Tracking',
      description: 'Real-time payment tracking with detailed analytics. Know exactly who paid, when, and how much at any time.'
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Add sub-admins and executives with role-based permissions. Collaborate effectively with your team.'
    },
    {
      icon: TrendingUp,
      title: 'Smart Analytics',
      description: 'Comprehensive insights into payment trends, member participation, and revenue analytics for better decision making.'
    },
    {
      icon: Clock,
      title: 'Time Saving',
      description: 'Automate payment collection and reduce manual work. Focus on what matters most for your association.'
    }
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-800 mb-4">
            Why Choose PayPoint?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Built specifically for university associations with features that matter most to student organizations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                  <Icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-800 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;