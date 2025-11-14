import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Loader2, RefreshCw, Search, User, Wallet } from 'lucide-react';
import type { OrgPaypointDetail, OrgPaypointTransaction } from '../lib/api';
import { getOrgPaypointTransactions } from '../lib/api';

type SessionInfo = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(value);

const formatRelative = (isoDate: string | null) => {
  if (!isoDate) return 'Pending';
  try {
    return formatDistanceToNow(new Date(isoDate), { addSuffix: true });
  } catch {
    return isoDate;
  }
};

const shellOverlay = 'rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_55px_rgba(15,23,42,0.45)] backdrop-blur';

const PaypointTransactionsPage: React.FC = () => {
  const { paypointId } = useParams<{ paypointId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [detail, setDetail] = useState<OrgPaypointDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selected, setSelected] = useState<OrgPaypointTransaction | null>(null);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'refunded'>('all');

  useEffect(() => {
    const stored = localStorage.getItem('paypoint.session');
    if (!stored) {
      toast.error('Please sign in to access transactions.');
      navigate('/login');
      return;
    }
    try {
      const parsed: SessionInfo = JSON.parse(stored);
      if (parsed.user.role !== 'organization-admin') {
        toast.error('Only Organization Admins can view transactions.');
        navigate('/');
        return;
      }
      setSession(parsed);
    } catch (error) {
      console.error('Failed to parse session', error);
      localStorage.removeItem('paypoint.session');
      navigate('/login');
    }
  }, [navigate]);

  const token = session?.token;

  const loadTransactions = useCallback(
    async (showLoader = true) => {
      if (!token || !paypointId) return;
      if (showLoader) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      try {
        const response = await getOrgPaypointTransactions(token, paypointId);
        setDetail(response);
        setSelected((prev) => {
          if (!prev) {
            return response.transactions[0] || null;
          }
          const updated = response.transactions.find((tx) => tx.id === prev.id);
          return updated || response.transactions[0] || null;
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to load transactions.');
      } finally {
        if (showLoader) {
          setIsLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [token, paypointId]
  );

  useEffect(() => {
    if (!token || !paypointId) return;
    loadTransactions();
    const interval = setInterval(() => loadTransactions(false), 8000);
    return () => clearInterval(interval);
  }, [token, paypointId, loadTransactions]);

  const transactions = useMemo(() => {
    if (!detail) return [];
    return detail.transactions.filter((transaction) => {
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
      const normalizedFilter = filter.trim().toLowerCase();
      const matchesText =
        normalizedFilter.length === 0 ||
        [transaction.memberName, transaction.reference, transaction.department, transaction.studentId]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedFilter));
      return matchesStatus && matchesText;
    });
  }, [detail, filter, statusFilter]);

  const paidCount = useMemo(() => transactions.filter((tx) => tx.status === 'paid').length, [transactions]);
  const pendingCount = useMemo(
    () => transactions.filter((tx) => tx.status === 'pending').length,
    [transactions]
  );
  const refundedCount = useMemo(
    () => transactions.filter((tx) => tx.status === 'refunded').length,
    [transactions]
  );
  const totalCollected = useMemo(
    () =>
      transactions
        .filter((tx) => tx.status === 'paid')
        .reduce((sum, tx) => sum + tx.amount, 0),
    [transactions]
  );

  if (!session) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white/70">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-indigo-300" />
        Loading transactions…
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-10 text-center shadow-[0_25px_55px_rgba(15,23,42,0.45)]">
          <p className="text-sm text-white/70">Unable to load PayPoint transactions.</p>
          <button
            onClick={() => navigate('/org-admin')}
            className="mt-4 rounded-2xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-indigo-400/60 hover:bg-indigo-500/10"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-indigo-900/40 via-transparent lg:block" />
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/org-admin')}
              className="rounded-2xl border border-white/15 p-2 text-white/70 transition hover:border-indigo-400/60 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-white/60">PayPoint transactions</p>
              <h1 className="text-2xl font-semibold text-white">{detail.paypoint.title}</h1>
              <p className="text-xs text-white/60">{detail.paypoint.restriction}</p>
            </div>
          </div>
          <button
            onClick={() => loadTransactions(false)}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-indigo-400/60 hover:bg-indigo-500/10"
          >
            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin text-indigo-300" /> : <RefreshCw className="h-4 w-4 text-indigo-300" />}
            Sync now
          </button>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6">
        <section className="grid gap-6 md:grid-cols-2">
          <div className={shellOverlay}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">PayPoint overview</p>
                <h2 className="text-2xl font-semibold text-white">{detail.paypoint.title}</h2>
              </div>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  detail.paypoint.status === 'published'
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : detail.paypoint.status === 'draft'
                    ? 'bg-amber-500/15 text-amber-300'
                    : 'bg-white/10 text-white'
                }`}
              >
                {detail.paypoint.status}
              </span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide">
                  <Wallet className="h-3.5 w-3.5 text-indigo-300" /> Amount
                </p>
                <p className="mt-2 text-xl font-semibold text-white">{formatCurrency(detail.paypoint.amount)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                <p className="text-[11px] font-semibold uppercase tracking-wide">Transactions</p>
                <p className="mt-2 text-xl font-semibold text-white">{detail.transactions.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                <p className="text-[11px] font-semibold uppercase tracking-wide">Last updated</p>
                <p className="mt-2 text-xl font-semibold text-white">{formatRelative(detail.paypoint.updatedAt)}</p>
              </div>
            </div>
          </div>

          <div className={shellOverlay}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Live metrics</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                <p className="text-[11px] font-semibold uppercase tracking-wide">Collected</p>
                <p className="mt-2 text-xl font-semibold">{formatCurrency(totalCollected)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                <p className="text-[11px] font-semibold uppercase tracking-wide">Paid</p>
                <p className="mt-2 text-xl font-semibold text-white">{paidCount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-amber-200">
                <p className="text-[11px] font-semibold uppercase tracking-wide">Pending</p>
                <p className="mt-2 text-xl font-semibold">{pendingCount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-rose-200">
                <p className="text-[11px] font-semibold uppercase tracking-wide">Refunded</p>
                <p className="mt-2 text-xl font-semibold">{refundedCount}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(320px,1fr)]">
          <div className={shellOverlay}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-1 items-center rounded-2xl border border-white/10 bg-white/5 px-3">
                <Search className="h-4 w-4 text-white/50" />
                <input
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  placeholder="Search member, department, or reference"
                  className="w-full bg-transparent px-2 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {['all', 'paid', 'pending', 'refunded'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status as typeof statusFilter)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statusFilter === status
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'border border-white/15 text-white/70 hover:border-indigo-400/60'
                    }`}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-sm">
                <thead className="bg-white/5 text-left text-[11px] font-semibold uppercase tracking-widest text-white/60">
                  <tr>
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {transactions.map((transaction) => {
                    const isSelected = selected?.id === transaction.id;
                    return (
                      <tr
                        key={transaction.id}
                        onClick={() => setSelected(transaction)}
                        className={`cursor-pointer transition ${
                          isSelected ? 'bg-indigo-500/20' : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <td className="px-4 py-3 text-white">
                          <div className="font-semibold">{transaction.memberName}</div>
                          {transaction.studentId && <div className="text-xs text-white/50">{transaction.studentId}</div>}
                        </td>
                        <td className="px-4 py-3 text-white/70">{transaction.department || '—'}</td>
                        <td className="px-4 py-3 text-white/70">
                          {transaction.method === 'mobile-money' ? 'Mobile Money' : transaction.method || 'Card'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              transaction.status === 'paid'
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : transaction.status === 'pending'
                                ? 'bg-amber-500/15 text-amber-300'
                                : 'bg-rose-500/15 text-rose-300'
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-white">{formatCurrency(transaction.amount)}</td>
                        <td className="px-4 py-3 text-white/60">{transaction.reference}</td>
                        <td className="px-4 py-3 text-white/60">{formatRelative(transaction.paidAt)}</td>
                      </tr>
                    );
                  })}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-sm text-white/60">
                        No transactions match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className={shellOverlay}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Payer details</p>
                <h3 className="text-xl font-semibold text-white">
                  {selected ? selected.memberName : 'Select a transaction'}
                </h3>
              </div>
              {selected && (
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    selected.status === 'paid'
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : selected.status === 'pending'
                      ? 'bg-amber-500/15 text-amber-300'
                      : 'bg-rose-500/15 text-rose-300'
                  }`}
                >
                  {selected.status}
                </span>
              )}
            </div>

            {selected ? (
              <div className="mt-4 space-y-4 text-sm text-white/70">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Payment reference</p>
                  <p className="mt-1 text-base font-semibold text-white">{selected.reference}</p>
                  <p className="text-xs text-white/50">Updated {formatRelative(selected.paidAt)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Contact</p>
                  <p className="mt-1 text-white">{selected.memberName}</p>
                  {selected.studentId && <p className="text-xs text-white/50">Student ID: {selected.studentId}</p>}
                  <p className="text-xs text-white/50">Department: {selected.department || '—'}</p>
                  {selected.yearGroup && <p className="text-xs text-white/50">Year: {selected.yearGroup}</p>}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Form responses</p>
                  <div className="mt-2 space-y-2">
                    {selected.responses ? (
                      Object.values(selected.responses).map((response) => (
                        <div key={`${selected.id}-${response.label}`}>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">{response.label}</p>
                          <p className="text-sm text-white">{response.value || '—'}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-white/50">No additional responses recorded.</p>
                    )}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Amount</p>
                  <p className="mt-1 text-xl font-semibold text-white">{formatCurrency(selected.amount)}</p>
                  <p className="text-xs text-white/60">
                    Method: {selected.method === 'mobile-money' ? 'Mobile Money' : selected.method || 'Card'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-8 text-sm text-white/60">
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-center">
                  <User className="h-6 w-6 text-white/40" />
                  Select a transaction to view payer details.
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PaypointTransactionsPage;
