import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Loader2, Shield, CheckCircle2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  getPublicPaypoint,
  submitPaypointPayment,
} from '../lib/api';
import type {
  PublicPaypointResponse,
  SubmitPaymentPayload,
} from '../lib/api';

const currency = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  minimumFractionDigits: 2,
});

const storageKeyForSlug = (slug: string) => `paypoint-review-${slug}`;

const PaypointReviewPage: React.FC = () => {
  const params = useParams<{ '*': string }>();
  const slug = params['*'];
  const navigate = useNavigate();

  const [data, setData] = useState<PublicPaypointResponse | null>(null);
  const [payload, setPayload] = useState<SubmitPaymentPayload | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPaypoint = useCallback(async () => {
    if (!slug) {
      navigate('/');
      return;
    }

    try {
      const response = await getPublicPaypoint(slug);
      setData(response);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load PayPoint.');
      navigate('/');
    }
  }, [slug, navigate]);

  useEffect(() => {
    fetchPaypoint();
  }, [fetchPaypoint]);

  useEffect(() => {
    if (!slug) return;
    const stored = sessionStorage.getItem(storageKeyForSlug(slug));
    if (!stored) {
      toast.error('No payment details to review.');
      navigate(`/paypoint/${slug}`);
      return;
    }
    try {
      const parsed: SubmitPaymentPayload = JSON.parse(stored);
      setPayload(parsed);
    } catch (error) {
      console.error('Unable to parse review payload', error);
      toast.error('Unable to load review details.');
      navigate(`/paypoint/${slug}`);
    }
  }, [slug, navigate]);

  const handleConfirm = async () => {
    if (!slug || !payload) return;
    setIsSubmitting(true);
    try {
      await submitPaypointPayment(slug, payload);
      toast.success('Payment received! Check your inbox for confirmation.');
      sessionStorage.removeItem(storageKeyForSlug(slug));
      navigate(`/paypoint/${slug}`, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to process payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!data || !payload) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-300" />
      </div>
    );
  }

  const builder = data.paypoint.builder;

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-indigo-900/40 via-transparent lg:block" />
      <Header />
      <main className="relative flex-1 px-4 py-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm font-semibold text-white/70 transition hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to edit
          </button>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_25px_55px_rgba(15,23,42,0.45)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Review details</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Confirm payment information</h1>
            <p className="mt-1 text-sm text-white/70">
              Double-check your personal details and payment method before submitting.
            </p>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-white/90">Member information</h2>
                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
                  {payload.responses &&
                    Object.entries(payload.responses).map(([fieldId, entry]) => (
                      <div key={fieldId}>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">{entry.label}</p>
                        <p className="text-base text-white">{entry.value || '—'}</p>
                      </div>
                    ))}
                  {!payload.responses && <p className="text-white/60">No responses captured.</p>}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-white/90">Payment summary</h2>
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-600 to-purple-600 p-5 text-white shadow-lg">
                  <div className="flex items-center justify-between text-xs uppercase tracking-widest text-indigo-100">
                    <span>Amount due</span>
                    <span>{data.organization?.name}</span>
                  </div>
                  <p className="mt-3 text-3xl font-semibold">{currency.format(builder?.payment.amount ?? data.paypoint.amount)}</p>
                  <p className="text-sm text-indigo-100">
                    {payload.method === 'mobile-money' ? 'Mobile money charge' : 'Card charge'}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Payment method</p>
                  <p className="mt-1 text-white">
                    {payload.method === 'mobile-money' ? 'Mobile Money' : 'Card Payment'}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Restrictions</p>
                  <p className="mt-1 text-white">{builder?.gating.restriction || 'Organizer review required.'}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-end gap-3">
              <button
                onClick={() => navigate(`/paypoint/${slug}`)}
                className="rounded-2xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-indigo-400/60 hover:bg-indigo-500/10"
                type="button"
                disabled={isSubmitting}
              >
                Edit details
              </button>
              <button
                onClick={handleConfirm}
                className="inline-flex items-center rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                    Processing…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-white" />
                    Confirm & Pay
                  </>
                )}
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.35)] backdrop-blur">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-indigo-300" />
              <div>
                <p className="text-sm font-semibold text-white">Security note</p>
                <p className="text-xs text-white/70">
                  Payments are verified against organizer records. Ensure your details match official submissions.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaypointReviewPage;
