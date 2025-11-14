import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { BuilderField, BuilderSection, PaypointBuilderResponse } from '../lib/api';
import { getPaypointBuilder } from '../lib/api';

type SessionInfo = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
};

const currencyFormatter = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  minimumFractionDigits: 2,
});

const previewShell = 'rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_55px_rgba(15,23,42,0.45)] backdrop-blur';
const previewInput =
  'mt-1 w-full rounded-2xl border border-white/15 bg-slate-900/40 px-3 py-2 text-sm text-white placeholder:text-white/40 caret-white focus:border-indigo-400/70 focus:outline-none focus:ring-0';

const PaypointBuilderPreview: React.FC = () => {
  const { paypointId } = useParams<{ paypointId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [builderData, setBuilderData] = useState<PaypointBuilderResponse | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | boolean>>({});

  useEffect(() => {
    const stored = localStorage.getItem('paypoint.session');
    if (!stored) {
      toast.error('Please sign in to open the builder preview.');
      navigate('/login');
      return;
    }

    try {
      const parsed: SessionInfo = JSON.parse(stored);
      if (parsed.user.role !== 'organization-admin') {
        toast.error('Only organization admins can access this preview.');
        navigate('/');
        return;
      }
      setSession(parsed);
    } catch (error) {
      console.error('Unable to parse session blob', error);
      localStorage.removeItem('paypoint.session');
      navigate('/login');
    }
  }, [navigate]);

  const token = session?.token;

  const loadPreview = useCallback(async () => {
    if (!token || !paypointId) return;
    try {
      const builder = await getPaypointBuilder(token, paypointId);
      setBuilderData(builder);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load builder preview.');
      navigate('/org-admin');
    }
  }, [token, paypointId, navigate]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  useEffect(() => {
    if (!builderData) return;
    const defaults: Record<string, string | boolean> = {};
    builderData.builder.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.type === 'checkbox') {
          defaults[field.id] = false;
        } else if (field.type === 'select' && field.options?.length) {
          defaults[field.id] = field.options[0].value;
        } else {
          defaults[field.id] = '';
        }
      });
    });
    setFormValues(defaults);
  }, [builderData]);

  const handleFieldChange = (field: BuilderField, value: string | boolean) => {
    setFormValues((prev) => ({
      ...prev,
      [field.id]: value,
    }));
  };

  const renderField = (field: BuilderField) => {
    const commonInputClasses = previewInput;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={(formValues[field.id] as string) || ''}
            onChange={(event) => handleFieldChange(field, event.target.value)}
            placeholder={field.placeholder || ''}
            className={`${commonInputClasses} min-h-[100px]`}
          />
        );
      case 'select':
        return (
          <select
            id={field.id}
            value={(formValues[field.id] as string) || ''}
            onChange={(event) => handleFieldChange(field, event.target.value)}
            className={commonInputClasses}
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
          <label className="mt-2 inline-flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={Boolean(formValues[field.id])}
              onChange={(event) => handleFieldChange(field, event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            {field.helperText || 'I acknowledge'}
          </label>
        );
      default:
        return (
          <input
            id={field.id}
            type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
            value={(formValues[field.id] as string) || ''}
            onChange={(event) => handleFieldChange(field, event.target.value)}
            placeholder={field.placeholder || ''}
            className={commonInputClasses}
          />
        );
    }
  };

  const builder = builderData?.builder;

  const paymentCard = useMemo(() => {
    if (!builder) return null;
    return (
      <div className="rounded-2xl bg-indigo-600 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between text-sm uppercase tracking-wide text-indigo-100">
          <span>Amount Breakdown</span>
          <span>ACSES</span>
        </div>
        <div className="mt-4 text-2xl font-semibold">{currencyFormatter.format(builder.payment.amount)}</div>
        <p className="text-sm text-indigo-100">Default amount due</p>
      </div>
    );
  }, [builder]);

  if (!builder) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-10 text-center shadow-[0_25px_55px_rgba(15,23,42,0.45)]">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-indigo-300" />
          <p className="mt-3 text-sm font-medium text-white/70">Loading builder preview…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 pb-16 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-indigo-900/40 via-transparent lg:block" />
      <div className="relative mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-semibold text-white/70 transition hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to builder
        </button>

        <div className={previewShell}>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Live builder preview</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{builder.hero.heading}</h1>
            <p className="mt-2 text-white/70">{builder.hero.subheading}</p>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[280px,1fr]">
            {paymentCard}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              {builder.sections.map((section: BuilderSection) => (
                <section key={section.id} className="mt-6 first:mt-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">{section.title}</h2>
                    <span className="text-xs font-semibold uppercase tracking-wide text-white/50">Mandatory</span>
                  </div>
                  {section.description && <p className="mt-1 text-sm text-white/60">{section.description}</p>}
                  <div className="mt-4 space-y-4">
                    {section.fields.map((field) => (
                      <div key={field.id}>
                        <label
                          htmlFor={field.id}
                          className="text-xs font-semibold uppercase tracking-wide text-white/60"
                        >
                          {field.label}
                          {field.required && <span className="text-rose-400"> *</span>}
                        </label>
                        {renderField(field)}
                        {field.helperText && field.type !== 'checkbox' && (
                          <p className="mt-1 text-xs text-white/50">{field.helperText}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))}

              <section className="mt-6">
                <h2 className="text-lg font-semibold text-white">Payment Method</h2>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {builder.payment.acceptedMethods.map((method) => (
                    <div
                      key={method}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80"
                    >
                      {method === 'mobile-money' ? 'Mobile Money' : 'Card Payment'}
                    </div>
                  ))}
                </div>
              </section>

              <button className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30">
                {builder.hero.primaryActionLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaypointBuilderPreview;
