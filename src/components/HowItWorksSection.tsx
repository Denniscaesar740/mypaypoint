import React from 'react';
import { UserPlus, CreditCard, BarChart3 } from 'lucide-react';

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: UserPlus,
      title: 'Apply & Get Approved',
      description: 'Submit your association details and get approved by our team. Setup takes less than 24 hours.',
      step: '01'
    },
    {
      icon: CreditCard,
      title: 'Create PayPoints',
      description: 'Create customized payment links for dues, events, or souvenirs. Set amounts, restrictions, and descriptions.',
      step: '02'
    },
    {
      icon: BarChart3,
      title: 'Collect & Manage',
      description: 'Share your PayPoint links and start collecting payments. Monitor everything from your dashboard.',
      step: '03'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-800 mb-4">
            How PayPoint Works
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Get started with PayPoint in three simple steps and transform how your association collects payments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative text-center">
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {step.step}
                </div>
                
                {/* Icon */}
                <div className="mt-8 mb-6 flex justify-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
                    <Icon className="h-8 w-8 text-indigo-600" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-zinc-800 mb-4">
                  {step.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {step.description}
                </p>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-slate-200 transform translate-x-6">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-indigo-600 rounded-full"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;