import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  paragraphs: string[];
  highlights: string[];
}

const LegalLayout: React.FC<LegalLayoutProps> = ({ title, subtitle, paragraphs, highlights }) => (
  <div className="min-h-screen bg-white text-slate-900">
    <Header />
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-10">
      <header className="space-y-4">
        <p className="text-sm uppercase tracking-wider text-indigo-600">PayPoint Legal Center</p>
        <h1 className="text-4xl font-bold text-zinc-900">{title}</h1>
        <p className="text-lg text-slate-600">{subtitle}</p>
      </header>

      <section className="space-y-6">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-base leading-relaxed text-slate-700">
            {paragraph}
          </p>
        ))}
      </section>

      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-zinc-800">At a glance</h2>
        <ul className="space-y-2 text-slate-700 text-sm">
          {highlights.map((highlight) => (
            <li key={highlight} className="flex items-start">
              <span className="mt-1 mr-2 h-2 w-2 rounded-full bg-indigo-600 flex-shrink-0" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
    <Footer />
  </div>
);

export const PrivacyPolicy: React.FC = () => (
  <LegalLayout
    title="Privacy Policy"
    subtitle="We keep your organization data private and only process what is necessary to deliver PayPoint."
    paragraphs={[
      'PayPoint collects basic identity and contact information so we can authenticate administrators and send receipts to guests. We never sell information to third parties and only share with partners if you opt in.',
      'We retain logins, audit trails, and payment records only as long as required for legal and reconciliation purposes. You can request export or deletion of your organization data by contacting support.',
    ]}
    highlights={[
      'Consent-based communication and opt-out controls',
      'PCI-aligned data handling for payment tokens',
      'Granular consent logs for every administrator',
    ]}
  />
);

export const TermsOfService: React.FC = () => (
  <LegalLayout
    title="Terms of Service"
    subtitle="These terms describe how PayPoint supports associations while keeping obligations clear and enforceable."
    paragraphs={[
      'By using PayPoint, your institution agrees to our acceptable use policy, timely payment of invoices, and cooperation on compliance reviews. The platform is always evolving to stay ahead of payment regulations.',
      'Account owners are fully responsible for the content they publish, the permissions they grant, and the payment workflows they launch. We strive to ensure fairness, transparency, and uptime, but access is subject to the terms below.',
    ]}
    highlights={[
      'Simple tiered pricing with no hidden fees',
      'Platform access revoked for policy violations',
      'Refunds and dispute paths detailed within',
    ]}
  />
);

export const SecurityOverview: React.FC = () => (
  <LegalLayout
    title="Security"
    subtitle="Security is core to PayPoint - from infrastructure to the customer experience."
    paragraphs={[
      'Our infrastructure is hosted in a secure, monitored environment with ISO-aligned practices and automated patching. Each service communicates over TLS, and we encrypt sensitive data at rest and in transit.',
      'Multi-factor authentication is available for super-admin and organization-admin accounts. We rotate keys periodically, run penetration tests, and maintain incident playbooks so your organization is never unknowingly at risk.',
    ]}
    highlights={[
      'End-to-end TLS and encryption for stored secrets',
      'Continuous monitoring, rate limiting, and anomaly detection',
      'SOC 2 inspired controls with external reviews',
    ]}
  />
);
