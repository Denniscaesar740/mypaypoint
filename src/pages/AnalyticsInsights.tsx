import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  Activity,
  TrendingUp,
  PieChart,
  ArrowDownRight,
  ArrowUpRight,
  FileBarChart2,
  Download,
  Target,
  AlertTriangle,
  Calendar,
  Award,
} from 'lucide-react';

const AnalyticsInsights: React.FC = () => {
  const platformMetrics = [
    {
      title: 'Total Transactions',
      icon: Activity,
      description:
        'Track the volume of payments processed across every association with filters by date, organization, or payment method.',
      highlights: [
        'Success vs failure breakdown',
        'Average transaction size',
        'Settlement timelines per gateway',
      ],
    },
    {
      title: 'Top Organizations by Revenue',
      icon: Award,
      description:
        'Surface high-performing associations to celebrate success, identify best practices, and replicate what works.',
      highlights: [
        'Rankings by revenue, growth rate, or active PayPoints',
        'Flag sudden dips or spikes to investigate root causes',
        'Export-ready leaderboards for reports',
      ],
    },
    {
      title: 'Gateway Performance',
      icon: TrendingUp,
      description:
        'Monitor payment gateways with uptime, failure reasons, and latency so you can intervene before members notice issues.',
      highlights: [
        'Alerting for repeated failures',
        'Comparative success rates between gateways',
        'Settlement and reconciliation status',
      ],
    },
  ];

  const organizationMetrics = [
    {
      title: 'Collection Overview',
      icon: PieChart,
      points: [
        'Total collected vs outstanding balance',
        'Breakdown per PayPoint, department, or year group',
        'Top contributors and frequent payers',
      ],
    },
    {
      title: 'Member Engagement',
      icon: Target,
      points: [
        'List of unpaid members with reminder tools',
        'Trend analysis to spot seasonal spikes',
        'Conversion rates from reminder campaigns',
      ],
    },
    {
      title: 'Operational Health',
      icon: AlertTriangle,
      points: [
        'Refund status and SLA tracking',
        'Dispute resolution timelines',
        'Support requests and resolution efficiency',
      ],
    },
  ];

  const reportingFeatures = [
    {
      title: 'One-Click Exports',
      icon: Download,
      description:
        'Generate PDF board reports or CSV ledgers to share with finance teams, auditors, or student leadership.',
    },
    {
      title: 'Scheduling & Automation',
      icon: Calendar,
      description:
        'Schedule weekly or monthly digest emails that summarize key metrics for stakeholders.',
    },
    {
      title: 'Custom Dashboards',
      icon: FileBarChart2,
      description:
        'Build saved views tailored to Super Admins, Organization Admins, or finance officers with the filters they use most.',
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
              Analytics &amp; Insights
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              PayPoint translates campus payments into actionable intelligence for Super Admins,
              Organization Admins, and executive stakeholders.
            </p>
          </div>
        </section>

        {/* Platform Metrics */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-flex px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
                Super Admin Visibility
              </span>
              <h2 className="mt-6 text-3xl font-bold text-zinc-800">
                See the Whole Platform in One Glance
              </h2>
              <p className="mt-3 text-slate-600 max-w-3xl mx-auto">
                Understand revenue, usage, and operational health across every association to make
                data-backed decisions.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {platformMetrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <article
                    key={metric.title}
                    className="rounded-2xl border border-slate-200 bg-white shadow-sm p-8"
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-5">
                      <Icon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-800 mb-3">{metric.title}</h3>
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                      {metric.description}
                    </p>
                    <ul className="space-y-3 text-sm text-slate-700">
                      {metric.highlights.map((item) => (
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

        {/* Organization Metrics */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-flex px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                Organization Admin Deep Dive
              </span>
              <h2 className="mt-6 text-3xl font-bold text-zinc-800">
                Turn Collections into Operational Intelligence
              </h2>
              <p className="mt-3 text-slate-600 max-w-3xl mx-auto">
                Access detailed analytics for every PayPoint to manage revenue, motivate members,
                and meet finance committee expectations.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {organizationMetrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <article
                    key={metric.title}
                    className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-5">
                      <Icon className="h-6 w-6 text-blue-700" />
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-800 mb-3">{metric.title}</h3>
                    <ul className="space-y-3 text-sm text-slate-700">
                      {metric.points.map((point) => (
                        <li key={point} className="flex items-start">
                          <span className="mt-1 mr-3 h-2.5 w-2.5 rounded-full bg-blue-500 flex-shrink-0" />
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

        {/* Trend Insights */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              <article className="rounded-2xl border border-slate-200 bg-white shadow-sm p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <ArrowUpRight className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-800">
                    Growth &amp; Drop Detection
                  </h3>
                </div>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  Spot trends early with automated insights that highlight standout moments in your
                  payment data.
                </p>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start">
                    <span className="mt-1 mr-3 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span>Signals for week-over-week revenue growth or decline</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mt-1 mr-3 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span>Recommendations on campaigns to run or PayPoints to promote</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mt-1 mr-3 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span>Alerts when payment failures exceed defined thresholds</span>
                  </li>
                </ul>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <ArrowDownRight className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Failed vs Successful Payments</h3>
                </div>
                <p className="text-sm text-slate-300 mb-5 leading-relaxed">
                  Monitor failure patterns to keep donor confidence high. Drill down by payment
                  method, device type, or member segment.
                </p>
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <ul className="space-y-3 text-sm text-slate-200">
                    <li className="flex justify-between">
                      <span>Success Rate (MTN MoMo)</span>
                      <span className="font-semibold text-emerald-400">97.2%</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Success Rate (Cards)</span>
                      <span className="font-semibold text-emerald-400">94.5%</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Failure Reasons (Top)</span>
                      <span className="font-semibold text-red-300">Network Timeout</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Follow-Up Queue</span>
                      <span className="font-semibold text-yellow-200">16 members</span>
                    </li>
                  </ul>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Reporting */}
        <section className="py-20 bg-slate-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-white mb-12">
              <h2 className="text-3xl font-bold mb-3">Shareable, Trustworthy Reporting</h2>
              <p className="text-slate-300 max-w-3xl mx-auto">
                Empower committees, finance teams, and university partners with polished reports
                that prove transparency.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
              {reportingFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {feature.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AnalyticsInsights;
