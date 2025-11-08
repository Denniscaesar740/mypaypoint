import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { UserPlus, CreditCard, BarChart3, Settings, Users, Shield } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: UserPlus,
      title: 'Apply & Get Approved',
      description: 'Submit your association details including university, association type, and leadership information. Our team reviews applications within 24 hours.',
      details: [
        'Fill out the application form with association details',
        'Provide verification documents',
        'Wait for approval (usually within 24 hours)',
        'Receive your dashboard access credentials'
      ]
    },
    {
      icon: Settings,
      title: 'Setup Your Organization',
      description: 'Configure your organization profile, add team members, and customize your payment settings.',
      details: [
        'Complete your organization profile',
        'Upload your association logo',
        'Add sub-admins and team members',
        'Configure payment gateway settings'
      ]
    },
    {
      icon: CreditCard,
      title: 'Create PayPoints',
      description: 'Create customized payment links for different purposes - dues, events, merchandise, or any other payments.',
      details: [
        'Set payment title and description',
        'Define amount and currency',
        'Add restrictions (year groups, departments)',
        'Generate shareable payment link'
      ]
    },
    {
      icon: Users,
      title: 'Share & Collect',
      description: 'Share your PayPoint links with members through WhatsApp, email, or social media and start collecting payments.',
      details: [
        'Share PayPoint links with members',
        'Members make payments using mobile money or cards',
        'Receive instant payment notifications',
        'Download receipts and confirmations'
      ]
    },
    {
      icon: BarChart3,
      title: 'Monitor & Analyze',
      description: 'Track payments in real-time, generate reports, and gain insights into your association\'s financial activities.',
      details: [
        'View real-time payment dashboard',
        'Generate detailed reports',
        'Track member payment status',
        'Analyze payment trends and patterns'
      ]
    },
    {
      icon: Shield,
      title: 'Manage & Secure',
      description: 'Handle refunds, manage disputes, and ensure all transactions are secure and compliant.',
      details: [
        'Process refunds when needed',
        'Handle payment disputes',
        'Maintain transaction security',
        'Export data for record keeping'
      ]
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
              How PayPoint Works
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From application to payment collection, here's your complete guide to getting started with PayPoint 
              and transforming how your association manages payments.
            </p>
          </div>
        </section>

        {/* Detailed Steps */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-20">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isEven = index % 2 === 0;
                
                return (
                  <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${isEven ? '' : 'lg:grid-flow-col-dense'}`}>
                    {/* Content */}
                    <div className={isEven ? '' : 'lg:col-start-2'}>
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
                          <Icon className="h-8 w-8 text-indigo-600" />
                        </div>
                      </div>
                      
                      <h2 className="text-3xl font-bold text-zinc-800 mb-4">
                        {step.title}
                      </h2>
                      <p className="text-lg text-slate-600 mb-6">
                        {step.description}
                      </p>
                      
                      <ul className="space-y-3">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start">
                            <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-slate-700">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Image */}
                    <div className={isEven ? 'lg:col-start-2' : 'lg:col-start-1'}>
                      <div className="relative">
                        <img
                          src={`https://images.unsplash.com/photo-${
                            index === 0 ? '1556742049-0cfed4f6a45d' :
                            index === 1 ? '1460925895917-afdab827c52f' :
                            index === 2 ? '1563013544-824ae1b704d3' :
                            index === 3 ? '1522202176988-66273c2fd55f' :
                            index === 4 ? '1551288049-2f4e4f6a5a6f' :
                            '1563013544-824ae1b704d3'
                          }?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80`}
                          alt={`Step ${index + 1}: ${step.title}`}
                          className="rounded-2xl shadow-lg w-full h-auto"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
              Join hundreds of student associations already using PayPoint to streamline their payment processes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/apply"
                className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-slate-50 text-indigo-600 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
              >
                Apply Now - It's Free
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent hover:bg-white/10 text-white font-semibold rounded-lg border border-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
              >
                Have Questions?
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;