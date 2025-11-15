import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  Loader2,
  Shield,
  Copy,
  ClipboardCheck,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getPublicPaypoint } from '../lib/api';
import { buildShareUrl } from '../lib/url';
import type {
  BuilderField,
  BuilderResponseValues,
  PublicBuilderState,
  PublicPaypointResponse,
  SubmitPaymentPayload,
} from '../lib/api';

const currency = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  minimumFractionDigits: 2,
});

const publicInput =
  'mt-1 w-full rounded-2xl border border-white/15 bg-slate-900/40 px-3 py-2 text-sm text-white placeholder:text-white/40 caret-white focus:border-indigo-400/70 focus:outline-none focus:ring-0';

const storageKeyForSlug = (slug: string) => `paypoint-review-${slug}`;

const PayPointPage: React.FC = () => {
  const params = useParams<{ '*': string }>();
  const slug = (params['*'] ?? '').trim();
  const navigate = useNavigate();

  const [data, setData] = useState<PublicPaypointResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [codeCopySuccess, setCodeCopySuccess] = useState(false);
  const [lookupInput, setLookupInput] = useState(slug);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string | boolean>>({});
  const [selectedMethod, setSelectedMethod] = useState('');

  useEffect(() => {
    setLookupInput(slug);
  }, [slug]);

  const fetchPaypoint = useCallback(async () => {
    if (!slug) {
      return;
    }

    setIsLoading(true);
    setLookupError(null);
    try {
      const response = await getPublicPaypoint(slug);
      setData(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load PayPoint.';
      toast.error(message);
      setLookupError(message);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) {
      setData(null);
      setIsLoading(false);
      setLookupError(null);
      return;
    }
    fetchPaypoint();
  }, [slug, fetchPaypoint]);

  const builder: PublicBuilderState | null = data?.paypoint.builder ?? null;

  useEffect(() => {
    if (!builder) return;
    const defaults: Record<string, string | boolean> = {};
    builder.sections.forEach((section) => {
      section.fields.forEach((field) => {
        defaults[field.id] = field.type === 'checkbox' ? false : '';
      });
    });
    setFieldValues(defaults);
    setSelectedMethod(builder.payment.acceptedMethods[0] || data?.paymentMethods[0] || '');
  }, [builder, data?.paymentMethods]);

  const handleFieldChange = (field: BuilderField, value: string | boolean) => {
    setFieldValues((prev) => ({
      ...prev,
      [field.id]: value,
    }));
  };

  const handleCopyLink = async () => {
    if (!slug) return;
    try {
      const shareUrl = buildShareUrl(`/paypoint/${slug}`);
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      toast.error('Unable to copy link. Please copy manually.');
    }
  };

  const handleCopyAccessCode = async () => {
    const accessCode = data?.paypoint.accessCode;
    if (!accessCode) {
      return;
    }
    try {
      await navigator.clipboard.writeText(accessCode);
      setCodeCopySuccess(true);
      setTimeout(() => setCodeCopySuccess(false), 2000);
    } catch {
      toast.error('Unable to copy the access code. Please copy manually.');
    }
  };

  const buildResponsesPayload = (): BuilderResponseValues => {
    const responses: BuilderResponseValues = {};
    if (!builder) {
      return responses;
    }
    builder.sections.forEach((section) => {
      section.fields.forEach((field) => {
        const rawValue = fieldValues[field.id];
        let value = '';
        if (typeof rawValue === 'boolean') {
          value = rawValue ? 'true' : 'false';
        } else {
          value = rawValue ? String(rawValue) : '';
        }
        responses[field.id] = {
          label: field.label,
          value,
        };
      });
    });
    return responses;
  };

  const validateBuilderForm = (): string[] => {
    if (!builder) return [];
    const missing: string[] = [];
    builder.sections.forEach((section) => {
      section.fields.forEach((field) => {
        const rawValue = fieldValues[field.id];
        if (field.required) {
          if (field.type === 'checkbox') {
            if (!rawValue) {
              missing.push(field.label);
            }
          } else if (!String(rawValue ?? '').trim()) {
            missing.push(field.label);
          }
        }
      });
    });
    if (!selectedMethod) {
      missing.push('Payment Method');
    }
    return missing;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!slug || !builder) {
      return;
    }

    const missing = validateBuilderForm();
    if (missing.length > 0) {
      toast.error(`Please complete: ${missing.join(', ')}`);
      return;
    }

    const responses = buildResponsesPayload();
    const payload: SubmitPaymentPayload = {
      method: selectedMethod,
      responses,
      fullName: responses['field-full-name']?.value || '',
      studentId: responses['field-student-id']?.value || '',
      department: responses['field-department']?.value || '',
      yearGroup: responses['field-year-group']?.value || '',
    };

    setIsRedirecting(true);
    sessionStorage.setItem(storageKeyForSlug(slug), JSON.stringify(payload));
    navigate(`/paypoint/review/${slug}`);
  };

  const formatRelative = (isoDate: string | null) => {
    if (!isoDate) return 'Pending';
    try {
      return formatDistanceToNow(new Date(isoDate), { addSuffix: true });
    } catch {
      return isoDate;
    }
  };

  const renderFieldControl = (field: BuilderField) => {
    const commonClasses = publicInput;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={(fieldValues[field.id] as string) || ''}
            onChange={(event) => handleFieldChange(field, event.target.value)}
            placeholder={field.placeholder || ''}
            className={`${commonClasses} min-h-[120px]`}
          />
        );
      case 'select':
        return (
          <select
            id={field.id}
            value={(fieldValues[field.id] as string) || ''}
            onChange={(event) => handleFieldChange(field, event.target.value)}
            className={commonClasses}
          >
            {field.options?.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <label className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={Boolean(fieldValues[field.id])}
              onChange={(event) => handleFieldChange(field, event.target.checked)}
              className="h-4 w-4 rounded border-white/40 text-indigo-300 focus:ring-indigo-400"
            />
            {field.helperText || 'I confirm the information above is accurate.'}
          </label>
        );
      case 'number':
        return (
          <input
            id={field.id}
            type="number"
            value={(fieldValues[field.id] as string) || ''}
            onChange={(event) => handleFieldChange(field, event.target.value)}
            placeholder={field.placeholder || ''}
            className={commonClasses}
          />
        );
      case 'email':
        return (
          <input
            id={field.id}
            type="email"
            value={(fieldValues[field.id] as string) || ''}
            onChange={(event) => handleFieldChange(field, event.target.value)}
            placeholder={field.placeholder || ''}
            className={commonClasses}
          />
        );
      default:
        return (
          <input
            id={field.id}
            type="text"
            value={(fieldValues[field.id] as string) || ''}
            onChange={(event) => handleFieldChange(field, event.target.value)}
            placeholder={field.placeholder || ''}
            className={commonClasses}
          />
        );
    }
  };

  const normalizeLookupInput = (value: string): string => {
    if (!value) {
      return '';
    }
    let normalized = value.trim();
    if (!normalized) {
      return '';
    }
    try {
      const parsed = new URL(normalized);
      normalized = parsed.pathname || '';
    } catch {
      normalized = normalized.replace(/^[a-z]+:\/\/[^/]+/i, '');
    }
    const paypointIndex = normalized.toLowerCase().indexOf('paypoint/');
    if (paypointIndex > 0) {
      normalized = normalized.slice(paypointIndex);
    }
    normalized = normalized.replace(/^paypoint\//i, '');
    normalized = normalized.replace(/^\/+|\/+$/g, '');
    return normalized;
  };

  const handleLookupSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = normalizeLookupInput(lookupInput);
    if (!normalized) {
      toast.error('Enter a PayPoint link or access code to continue.');
      return;
    }
    const encodedPath = normalized
      .split('/')
      .filter(Boolean)
      .map((segment) => encodeURIComponent(segment.trim()))
      .join('/');
    if (!encodedPath) {
      toast.error('Enter a PayPoint link or access code to continue.');
      return;
    }
    if (encodedPath === slug) {
      fetchPaypoint();
      return;
    }
    navigate(`/paypoint/${encodedPath}`);
  };

  const shouldShowLookup = !slug || (!!lookupError && !isLoading);

  if (shouldShowLookup) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-white">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-[0_25px_55px_rgba(15,23,42,0.4)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">PayPoint Access</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Open your PayPoint</h1>
            <p className="mt-2 text-sm text-white/70">
              Paste the shared link or enter the secure access code you received from your organizer.
            </p>
            {lookupError && (
              <div className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {lookupError}
              </div>
            )}
            <form onSubmit={handleLookupSubmit} className="mt-6 space-y-4 text-left">
              <div>
                <label htmlFor="paypoint-lookup" className="text-xs font-semibold uppercase tracking-wide text-white/60">
                  Link or access code
                </label>
                <input
                  id="paypoint-lookup"
                  type="text"
                  value={lookupInput}
                  onChange={(event) => setLookupInput(event.target.value)}
                  placeholder="e.g. PP-ABCD12 or https://mypaypoint.onrender.com/paypoint/your-link"
                  className="mt-2 w-full rounded-2xl border border-white/15 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-indigo-400/60 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:brightness-110"
              >
                Find PayPoint
              </button>
            </form>
            <p className="mt-5 text-xs text-white/60">
              Tip: Ask your organizer for the PayPoint code if you can’t find their link.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-300" />
      </div>
    );
  }

  if (!builder) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-white">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-[0_25px_55px_rgba(15,23,42,0.45)] backdrop-blur">
            <Shield className="mx-auto h-8 w-8 text-indigo-300" />
            <h1 className="mt-4 text-xl font-semibold text-white">PayPoint is being prepared</h1>
            <p className="mt-2 text-sm text-white/70">
              This PayPoint does not have a live builder form yet. Please check back later or contact the organizer.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const acceptedMethods = builder.payment.acceptedMethods.length > 0 ? builder.payment.acceptedMethods : data.paymentMethods;

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-indigo-900/40 via-transparent lg:block" />
      <Header />
      <main className="relative flex-1">
        <section className="px-4 pt-12">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_25px_55px_rgba(15,23,42,0.45)] backdrop-blur lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">{data.organization?.name || 'Organizer'}</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">{builder.hero.heading}</h1>
              <p className="mt-2 text-white/70">{builder.hero.subheading}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-right">
              <p className="text-xs uppercase tracking-widest text-white/60">Amount due</p>
              <p className="text-3xl font-semibold text-white">{currency.format(builder.payment.amount)}</p>
              <p className="text-xs text-white/60">Per member</p>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-10 grid max-w-6xl gap-8 px-4 pb-16 lg:grid-cols-[minmax(0,2fr),minmax(320px,1fr)]">
          <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.35)] backdrop-blur">
            {builder.sections.map((section) => (
              <div key={section.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Section</p>
                    <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                    {section.description && <p className="mt-1 text-sm text-white/70">{section.description}</p>}
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Mandatory</span>
                </div>
                <div className="mt-4 space-y-4">
                  {section.fields.map((field) => (
                    <div key={field.id}>
                      <label htmlFor={field.id} className="text-xs font-semibold uppercase tracking-wide text-white/60">
                        {field.label}
                        {field.required && <span className="text-rose-500"> *</span>}
                      </label>
                      {renderFieldControl(field)}
                      {field.helperText && field.type !== 'checkbox' && (
                        <p className="mt-1 text-xs text-white/50">{field.helperText}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Payment Method</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {acceptedMethods.map((method) => {
                  const active = selectedMethod === method;
                  return (
                    <button
                      type="button"
                      key={method}
                      onClick={() => setSelectedMethod(method)}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold ${
                        active
                          ? 'border-indigo-500 bg-white text-indigo-700 shadow-sm'
                          : 'border-white/10 bg-transparent text-white/70 hover:border-indigo-400/60'
                      }`}
                    >
                      <CreditCard className="h-4 w-4" />
                      {method === 'mobile-money' ? 'Mobile Money' : 'Card Payment'}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isRedirecting}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRedirecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                  Preparing review…
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {builder.hero.primaryActionLabel}
                </>
              )}
            </button>
          </form>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600 to-purple-600 p-6 text-white shadow-lg">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-indigo-100">
                <span>Amount Breakdown</span>
                <span>{data.organization?.name}</span>
              </div>
              <p className="mt-3 text-3xl font-semibold">{currency.format(builder.payment.amount)}</p>
              <p className="text-sm text-indigo-100">
                {builder.payment.allowCustomAmount ? 'Members can adjust this amount.' : 'Fixed amount due per member.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90"
                  type="button"
                >
                  {copySuccess ? <ClipboardCheck className="mr-1 h-3.5 w-3.5" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
                  Copy link
                </button>
                <button
                  onClick={handleCopyAccessCode}
                  className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90"
                  type="button"
                >
                  {codeCopySuccess ? <ClipboardCheck className="mr-1 h-3.5 w-3.5" /> : <KeyRound className="mr-1 h-3.5 w-3.5" />}
                  Copy code
                </button>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                  {acceptedMethods.length} methods
                </span>
              </div>
              <div className="mt-4 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Access code</p>
                <p className="mt-2 text-2xl font-semibold text-white">{data.paypoint.accessCode}</p>
                <p className="mt-1 text-xs text-white/60">
                  Payers can search for this code on mypaypoint.onrender.com/paypoint to open this page instantly.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_15px_35px_rgba(15,23,42,0.35)] backdrop-blur">
              <h3 className="text-sm font-semibold text-white">Important notice</h3>
              <div className="mt-3 flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
                <Shield className="h-5 w-5 text-indigo-300" />
                <div>
                  <p>{builder.gating.restriction}</p>
                  <p className="mt-1 text-xs text-white/60">
                    Payments are verified against organizer records. Ensure your details match official submissions.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_15px_35px_rgba(15,23,42,0.35)] backdrop-blur">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Recent payments</h3>
                <span className="text-xs text-white/60">{data.recentTransactions.length} listed</span>
              </div>
              <div className="mt-4 space-y-4">
                {data.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-sm font-semibold text-white">{transaction.memberName}</p>
                    <p className="text-xs text-white/60">{transaction.department || 'Department'}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-white/50">
                      <span>{currency.format(transaction.amount)}</span>
                      <span>{transaction.paidAt ? formatRelative(transaction.paidAt) : 'Pending'}</span>
                    </div>
                  </div>
                ))}
                {data.recentTransactions.length === 0 && (
                  <p className="rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-6 text-center text-sm text-white/60">
                    No payments recorded yet.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </section>

        <section className="mx-auto mb-16 max-w-6xl rounded-3xl border border-amber-500/20 bg-amber-500/10 px-6 py-6 text-amber-100">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-100" />
            <div>
              <p className="text-sm font-semibold">Need help?</p>
              <p className="text-xs">
                Contact your organizer for adjustments or refunds. Receipts are tied to your unique reference.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PayPointPage;
