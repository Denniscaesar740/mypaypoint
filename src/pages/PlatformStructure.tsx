import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  Crown,
  Building2,
  Users,
  ShieldCheck,
  LayoutDashboard,
  Wallet,
  Settings,
} from 'lucide-react';

const PlatformStructure: React.FC = () => {
  const roleCards = [
    {
      title: 'Super Admin (ACSES Owner)',
      icon: Crown,
      summary:
        'Full platform oversight with authority to configure, monitor, and intervene across every organization.',
      responsibilities: [
        'Onboard and manage all organizations (create, update, suspend, delete)',
        'Administer payment gateways, refunds, disputes, and escalations',
        'Configure global platform settings, pricing, and landing page content',
        'Access platform-wide analytics covering transactions, revenue, and performance',
        'Monitor payment health including gateway uptime and settlement timelines',
      ],
      badges: ['Global Access', 'Financial Oversight', 'Configuration Control'],
    },
    {
      title: 'Organization Admin',
      icon: Building2,
      summary:
        'Owns the experience for a single association with tools to manage payments, teams, and member records.',
      responsibilities: [
        'Create tailored PayPoints with custom titles, descriptions, amounts, and restrictions',
        'Share payment links and monitor collection status in real time',
        'Handle refunds requested by members and maintain transaction logs',
        'Invite executives or treasurers as sub-admins with granular permissions',
        'Track organization analytics including revenue, top contributors, and unpaid members',
      ],
      badges: ['Org-Level Control', 'Team Collaboration', 'Member Focus'],
    },
    {
      title: 'User / Payer (Student)',
      icon: Users,
      summary:
        'The member-facing experience that makes paying dues or fees simple, transparent, and instant.',
      responsibilities: [
        'View PayPoint information including payment description, amount, and eligibility criteria',
        'Submit required personal details such as name, student ID, department, and year group',
        'Complete payments through mobile money, cards, or any integrated method',
        'Receive confirmations, receipts, and optional email acknowledgements',
        'Request support or refunds through their association when necessary',
      ],
      badges: ['Secure Checkout', 'Multi-Channel Payments', 'Receipts'],
    },
  ];

  const governanceLayers = [
    {
      title: 'Security & Compliance',
      icon: ShieldCheck,
      points: [
        'Role-based access control across every area of the platform',
        'Audit trails on administrative actions and payment events',
        'Configurable approval workflows for sensitive actions like refunds',
      ],
    },
    {
      title: 'Operational Visibility',
      icon: LayoutDashboard,
      points: [
        'Super Admins see cross-organization metrics and performance trends',
        'Organization Admins receive PayPoint-level insights and reminders',
        'Automated alerts for failed transactions or unusual activity',
      ],
    },
    {
      title: 'Financial Management',
      icon: Wallet,
      points: [
        'Centralized settlement controls and payout tracking',
        'Policy rules for transaction fees and commissions',
        'Refund lifecycle management with escalation paths',
      ],
    },
    {
      title: 'Configuration & Growth',
      icon: Settings,
      points: [
        'Super Admins define pricing, branding, and landing content',
        'Organization Admins customize PayPoints to match their unique context',
        'Structured onboarding flows to keep associations compliant and ready',
      ],
    },
  ];

  const collaborationFlow = [
    {
      step: 'Super Admin Onboards Organization',
      description:
        'Approves association requests, activates dashboards, and assigns initial administrators.',
    },
    {
      step: 'Organization Admin Sets Up PayPoints',
      description:
        'Creates payment channels, configures restrictions, adds team members, and shares links.',
    },
    {
      step: 'Members Complete Payments',
      description:
        'Students visit the PayPoint, provide required details, pay securely, and receive receipts.',
    },
    {
      step: 'Analytics & Oversight',
      description:
        'Super Admin and Organization Admin monitor collections, refunds, and growth via dashboards.',
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-zinc-800 mb-6">
              Platform Structure &amp; Roles
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              PayPoint balances enterprise-grade oversight with on-the-ground execution. Explore how
              each persona collaborates to deliver seamless campus payments.
            </p>
          </div>
        </section>

        {/* Roles */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {roleCards.map((role) => {
                const Icon = role.icon;
                return (
                  <article
                    key={role.title}
                    className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm p-8"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <Icon className="h-7 w-7 text-indigo-600" />
                      </div>
                      <div className="flex gap-2 text-xs font-semibold text-indigo-600">
                        {role.badges.map((badge) => (
                          <span
                            key={badge}
                            className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-800 mb-3">{role.title}</h2>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">{role.summary}</p>
                    <ul className="space-y-3 text-sm text-slate-700">
                      {role.responsibilities.map((item) => (
                        <li key={item} className="flex items-start">
                          <span className="mt-1 mr-3 h-2.5 w-2.5 rounded-full bg-indigo-500 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Governance Layers */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-zinc-800 mb-3">
                Built-In Governance and Collaboration
              </h2>
              <p className="text-slate-600 max-w-3xl mx-auto">
                Each role comes with targeted permissions to maintain security, accountability, and
                a unified payment experience without slowing teams down.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {governanceLayers.map((layer) => {
                const Icon = layer.icon;
                return (
                  <article
                    key={layer.title}
                    className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-zinc-800">{layer.title}</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-700">
                      {layer.points.map((point) => (
                        <li key={point} className="flex items-start">
                          <span className="mt-1 mr-3 h-2.5 w-2.5 rounded-full bg-indigo-500 flex-shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Collaboration Flow */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-zinc-800 mb-3">Collaboration Flow</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                A streamlined handover from platform governance to on-campus execution ensures
                everyone knows what to do at each stage.
              </p>
            </div>
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 border-l-2 border-dashed border-indigo-200 hidden sm:block" />
              <div className="space-y-10">
                {collaborationFlow.map((item, index) => (
                  <div key={item.step} className="relative flex gap-6 items-start">
                    <div className="hidden sm:flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex-1">
                      <h3 className="text-lg font-semibold text-zinc-800 mb-2">{item.step}</h3>
                      <p className="text-slate-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-indigo-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Join the PayPoint Network</h2>
            <p className="text-indigo-100 mb-6">
              Let&apos;s help you align leadership expectations with smart payment workflows. Apply
              for your association or talk to us about custom enterprise support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/apply"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
              >
                Apply Your Organization
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 border border-white/40 rounded-lg font-semibold text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
              >
                Talk to the PayPoint Team
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PlatformStructure;
