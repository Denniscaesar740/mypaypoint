import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  Gauge,
  Settings2,
  Building,
  CreditCard,
  FileSpreadsheet,
  UserCog,
  Link2,
  ClipboardList,
  FileDown,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';

const CoreFunctionalities: React.FC = () => {
  const superAdminSections = [
    {
      title: 'Command Center Dashboard',
      icon: Gauge,
      description:
        'Real-time view of the platform with metrics that combine organizational adoption and payment performance.',
      points: [
        'Totals: payments processed, revenue, active organizations',
        'Realtime feed of payment gateway performance and settlement status',
        'Pending items: refund requests, escalations, support tickets',
        'Trend charts for successful vs failed payments over time',
      ],
    },
    {
      title: 'Platform Management',
      icon: Settings2,
      description:
        'Tools to configure the business rules and experience that every organization inherits.',
      points: [
        'Define transaction fees, platform commissions, and settlement rules',
        'Customize landing page content, pricing tiers, and onboarding flows',
        'Set policies for refunds, dispute handling, and compliance checks',
        'Manage payment gateway credentials and fallback providers',
      ],
    },
    {
      title: 'Organization Governance',
      icon: Building,
      description:
        'Quickly onboard, support, or suspend associations while keeping historic data intact.',
      points: [
        'Create, approve, update, or suspend organizations',
        'Assign organization owners or reset administrative access',
        'Export organization activity reports in CSV or PDF formats',
        'Track adoption milestones and send nudges to inactive orgs',
      ],
    },
  ];

  const organizationWorkflows = [
    {
      title: 'Create PayPoints',
      icon: Link2,
      description: 'Launch payment channels for events, dues, or special projects in minutes.',
      fields: ['Title & description', 'Amount & currency', 'Member restrictions', 'Custom instructions'],
    },
    {
      title: 'Manage Collections',
      icon: ClipboardList,
      description:
        'Monitor who has paid, follow up with pending members, and manage communication touchpoints.',
      fields: ['Status tracking (paid, pending, overdue)', 'Automated reminders', 'Member directory sync'],
    },
    {
      title: 'Reporting & Refunds',
      icon: FileDown,
      description:
        'Always-on access to transaction history, support for adjustments, and exports for compliance.',
      fields: ['Downloadable PDF summaries', 'Detailed CSV exports and ledgers', 'Refund initiation with audit'],
    },
    {
      title: 'Team Management',
      icon: UserCog,
      description:
        'Distribute work amongst executives, treasurers, and secretaries with role-aware permissions.',
      fields: ['Invite sub-admins', 'Role templates (Finance, Support, Communications)', 'Activity logs'],
    },
  ];

  const payerJourney = [
    {
      title: 'Transparent PayPoint Pages',
      icon: CreditCard,
      description:
        'Each PayPoint link clearly states what the payment is for, the amount due, and who qualifies.',
      highlights: [
        'Responsive pages for mobile and desktop',
        'Association branding and PayPoint story',
        'Contextual FAQs and contact information',
      ],
    },
    {
      title: 'Guided Payment Forms',
      icon: FileSpreadsheet,
      description:
        'Capture the exact data associations need—department, year group, ID—without friction.',
      highlights: [
        'Form validation and smart defaults',
        'Optional fields and custom questionnaires',
        'Support for recurring member data',
      ],
    },
    {
      title: 'Secure Checkout & Proof',
      icon: ShieldAlert,
      description:
        'Reliable payment gateways, instant confirmations, and receipts stored for future reference.',
      highlights: [
        'Mobile money, card payments, and additional methods as needed',
        'Automated email confirmations and downloadable receipts',
        'Webhook-ready events for integration with third-party systems',
      ],
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
              Core Functionalities
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything Super Admins, Organization Admins, and Payers need to run and experience
              seamless campus payments from one unified platform.
            </p>
          </div>
        </section>

        {/* Super Admin */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-flex px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
                Super Admin Toolkit
              </span>
              <h2 className="mt-6 text-3xl font-bold text-zinc-800">
                Govern the Entire Platform with Confidence
              </h2>
              <p className="mt-3 text-slate-600 max-w-3xl mx-auto">
                The ACSES owner unlocks enterprise capabilities to maintain compliance, support
                organizations, and keep the PayPoint engine running at scale.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {superAdminSections.map((section) => {
                const Icon = section.icon;
                return (
                  <article
                    key={section.title}
                    className="rounded-2xl border border-slate-200 bg-white shadow-sm p-8 flex flex-col"
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-5">
                      <Icon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-800 mb-3">{section.title}</h3>
                    <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                      {section.description}
                    </p>
                    <ul className="space-y-3 text-sm text-slate-700">
                      {section.points.map((point) => (
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

        {/* Organization Flow */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-flex px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                Organization Admin Workflow
              </span>
              <h2 className="mt-6 text-3xl font-bold text-zinc-800">
                Build PayPoints, Manage Members, and Scale Collections
              </h2>
              <p className="mt-3 text-slate-600 max-w-3xl mx-auto">
                A cohesive toolkit gives associations everything they need to launch payment drives,
                collaborate with executives, and stay audit-ready.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {organizationWorkflows.map((workflow) => {
                const Icon = workflow.icon;
                return (
                  <article
                    key={workflow.title}
                    className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-blue-700" />
                      </div>
                      <h3 className="text-xl font-semibold text-zinc-800">{workflow.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                      {workflow.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {workflow.fields.map((field) => (
                        <span
                          key={field}
                          className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Payer Journey */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-flex px-4 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
                Member Experience
              </span>
              <h2 className="mt-6 text-3xl font-bold text-zinc-800">
                Delight Students with a Trusted Payment Process
              </h2>
              <p className="mt-3 text-slate-600 max-w-3xl mx-auto">
                Every PayPoint prioritizes clarity, speed, and trust to keep payments flowing and
                members satisfied.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {payerJourney.map((stage) => {
                const Icon = stage.icon;
                return (
                  <article
                    key={stage.title}
                    className="rounded-2xl border border-slate-200 bg-white shadow-sm p-8"
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-5">
                      <Icon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-800 mb-3">{stage.title}</h3>
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                      {stage.description}
                    </p>
                    <ul className="space-y-2 text-sm text-slate-700">
                      {stage.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-start">
                          <span className="mt-1 mr-3 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Refund loop */}
        <section className="py-16 bg-slate-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <div className="flex flex-col lg:flex-row gap-10 items-start">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wide mb-4">
                  <RotateCcw className="h-4 w-4" />
                  Accountability
                </div>
                <h2 className="text-3xl font-bold mb-4">
                  Refunds and Disputes Resolved Without Friction
                </h2>
                <p className="text-slate-300 leading-relaxed">
                  PayPoint keeps a clear audit trail of every transaction. Super Admins can step in
                  when escalations occur, while Organization Admins manage member expectations with
                  transparent statuses.
                </p>
              </div>
              <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6">
                <ul className="space-y-4 text-sm text-slate-200">
                  <li className="flex items-start">
                    <span className="mt-1 mr-3 h-2 w-2 rounded-full bg-indigo-400 flex-shrink-0" />
                    <span>Unified refund hub with status labels (Requested, Under Review, Completed)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mt-1 mr-3 h-2 w-2 rounded-full bg-indigo-400 flex-shrink-0" />
                    <span>Escalation paths from Organization Admin to Super Admin for disputes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mt-1 mr-3 h-2 w-2 rounded-full bg-indigo-400 flex-shrink-0" />
                    <span>Automated notifications to affected members at each step</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mt-1 mr-3 h-2 w-2 rounded-full bg-indigo-400 flex-shrink-0" />
                    <span>Ledger exports to share with finance committees or auditors</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CoreFunctionalities;
