
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Bell,
  LogOut,
  RefreshCw,
  Loader2,
  Download,
  Clipboard,
  ClipboardCheck,
  PlusCircle,
  Receipt,
  Users,
  Wallet,
  Users2,
  Palette,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Globe,
  KeyRound,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import type { OrgOverview, OrgPaypoint, OrgPaypointTransaction, OrgTeamMember } from '../lib/api';
import {
  addOrgTeamMember,
  createOrgPaypoint,
  getOrgOverview,
  getOrgPaypointReport,
  getOrgTeam,
  removeOrgTeamMember,
  updateOrgPaypointStatus,
} from '../lib/api';

import { buildShareUrl } from '../lib/url';
import { useNavigationGuard } from '../lib/hooks/useNavigationGuard';

type SessionInfo = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
};

const restrictionOptions = ['All members', 'Levels 100-400', 'Graduating class only', 'Departments: Mechanical & Electrical', 'Custom eligibility list'];

const permissionOptions = [
  { key: 'paypoints.manage', label: 'PayPoints', description: 'Create, edit, publish, and archive PayPoints.' },
  { key: 'transactions.view', label: 'Transactions', description: 'View payment activity and download reports.' },
  { key: 'team.manage', label: 'Team & Roles', description: 'Invite or remove teammates and manage permissions.' },
  { key: 'builder.manage', label: 'Form Builder', description: 'Configure the form builder and advanced automations.' },
];

const automationPresets = [
  { title: 'Auto reminders', description: 'Send nudges every 3 days to unpaid members.' },
  { title: 'Finance digest', description: 'Email CSV reconciliation to finance at 6AM.' },
  { title: 'Escalation rules', description: 'Route refunds to treasurer after 3 days pending.' },
];

const formatCurrency = (value: number): string => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(value);

const formatRelative = (isoDate: string): string => {
  if (!isoDate) return 'moments ago';
  try {
    return formatDistanceToNow(new Date(isoDate), { addSuffix: true });
  } catch {
    return isoDate;
  }
};

const formatTransactionStatus = (status: OrgPaypointTransaction['status']): string => {
  switch (status) {
    case 'paid':
      return 'Paid';
    case 'pending':
      return 'Pending';
    case 'refunded':
      return 'Refunded';
    default:
      return status;
  }
};

const paypointStatusStyles: Record<'draft' | 'published' | 'archived', { label: string; classes: string }> = {
  draft: { label: 'Draft', classes: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30' },
  published: { label: 'Live', classes: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30' },
  archived: { label: 'Archived', classes: 'bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30' },
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: 'indigo' | 'green' | 'blue' | 'amber';
}> = ({ title, value, change, icon: Icon, accent = 'indigo' }) => {
  const accents: Record<'indigo' | 'green' | 'blue' | 'amber', { bg: string; text: string }> = {
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-600' },
    green: { bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-600' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-600' },
  };

  const accentStyles = accents[accent];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-white to-slate-50 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.12)] ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
        <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${accentStyles.bg} ${accentStyles.text}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-5 text-4xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{change}</p>
      <div className={`pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full ${accentStyles.bg}`} />
    </div>
  );
};
const OrgAdminDashboard: React.FC = () => {
  const location = useLocation();
  useNavigationGuard(location.pathname.startsWith('/org-admin'), 'Are you sure you want to leave the admin workspace?');

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [overview, setOverview] = useState<OrgOverview | null>(null);
  const [team, setTeam] = useState<OrgTeamMember[]>([]);
  const [paypoints, setPaypoints] = useState<OrgPaypoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [creatingPaypoint, setCreatingPaypoint] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null);
  const [downloadLoadingId, setDownloadLoadingId] = useState<string | null>(null);
  const [clipboardId, setClipboardId] = useState<string | null>(null);
  const [previewClipboardId, setPreviewClipboardId] = useState<string | null>(null);
  const [codeClipboardId, setCodeClipboardId] = useState<string | null>(null);
  const [teamSaving, setTeamSaving] = useState(false);
  const [teamRemovingId, setTeamRemovingId] = useState<string | null>(null);
  const [paypointForm, setPaypointForm] = useState({ title: '', description: '', amount: '', restriction: restrictionOptions[0] });
  const [teamForm, setTeamForm] = useState({ name: '', email: '', role: '', permissions: [] as string[] });
  const createFormRef = useRef<HTMLFormElement | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('paypoint.session');
    if (!stored) {
      toast.error('Please sign in to access the dashboard.');
      navigate('/login');
      return;
    }

    try {
      const parsed: SessionInfo = JSON.parse(stored);
      if (parsed.user.role !== 'organization-admin') {
        toast.error('You do not have access to the Organization Admin dashboard.');
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

  const loadOverview = useCallback(
    async (showLoader = true) => {
      if (!token) return;
      if (showLoader) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const [overviewData, teamData] = await Promise.all([getOrgOverview(token), getOrgTeam(token)]);
        setOverview(overviewData);
        setPaypoints(overviewData.paypoints as unknown as OrgPaypoint[]);
        setTeam(teamData.items);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to load organization data.');
      } finally {
        if (showLoader) {
          setIsLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [token]
  );

  useEffect(() => {
    if (!token) return;
    loadOverview();
    const interval = setInterval(() => loadOverview(false), 20000);
    return () => clearInterval(interval);
  }, [token, loadOverview]);

  const handleLogout = () => {
    localStorage.removeItem('paypoint.session');
    toast.success('Signed out.');
    navigate('/login');
  };

  const handleCreatePaypoint = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    const amountValue = Number(paypointForm.amount);
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      toast.error('Enter a valid amount greater than zero.');
      return;
    }

    setCreatingPaypoint(true);
    try {
      await createOrgPaypoint(token, {
        title: paypointForm.title.trim(),
        description: paypointForm.description.trim(),
        amount: amountValue,
        restriction: paypointForm.restriction,
      });
      toast.success('PayPoint created as draft.');
      setPaypointForm({ title: '', description: '', amount: '', restriction: restrictionOptions[0] });
      await loadOverview(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create PayPoint.');
    } finally {
      setCreatingPaypoint(false);
    }
  };

  const handleStatusChange = async (paypointId: string, status: 'draft' | 'published' | 'archived') => {
    if (!token) return;
    setStatusLoadingId(paypointId);
    try {
      await updateOrgPaypointStatus(token, paypointId, status);
      toast.success(`PayPoint status updated to ${status}.`);
      await loadOverview(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update PayPoint status.');
    } finally {
      setStatusLoadingId(null);
    }
  };

  const handleCopyLink = async (slug: string, paypointId: string) => {
    const shareUrl = buildShareUrl(`/paypoint/${slug}`);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setClipboardId(paypointId);
      toast.success('Live PayPoint link copied.');
      setTimeout(() => setClipboardId(null), 2000);
    } catch {
      toast.error('Could not copy link. Please copy manually.');
    }
  };

  const handleCopyBuilderPreview = async (paypointId: string) => {
    const previewUrl = buildShareUrl(`/org-admin/paypoints/${paypointId}/builder/live`);
    try {
      await navigator.clipboard.writeText(previewUrl);
      setPreviewClipboardId(paypointId);
      toast.success('Builder preview link copied.');
      setTimeout(() => setPreviewClipboardId(null), 2000);
    } catch {
      toast.error('Could not copy preview link.');
    }
  };

  const handleCopyAccessCode = async (paypointId: string, accessCode: string) => {
    try {
      await navigator.clipboard.writeText(accessCode);
      setCodeClipboardId(paypointId);
      toast.success('Access code copied.');
      setTimeout(() => setCodeClipboardId(null), 2000);
    } catch {
      toast.error('Could not copy access code. Please copy manually.');
    }
  };

  const handleDownloadReport = async (paypointId: string) => {
    if (!token) return;
    setDownloadLoadingId(paypointId);
    try {
      const report = await getOrgPaypointReport(token, paypointId);
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `paypoint-${paypointId}-report.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to download report.');
    } finally {
      setDownloadLoadingId(null);
    }
  };

  const handleAddTeamMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    if (!teamForm.name.trim() || !teamForm.email.trim() || !teamForm.role.trim()) {
      toast.error('Fill in name, email, and role.');
      return;
    }

    setTeamSaving(true);
    try {
      const created = await addOrgTeamMember(token, {
        name: teamForm.name.trim(),
        email: teamForm.email.trim(),
        role: teamForm.role.trim(),
        permissions: teamForm.permissions,
      });
      setTeam((prev) => [...prev, created]);
      toast.success('Team member added.');
      setTeamForm({ name: '', email: '', role: '', permissions: [] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to add teammate.');
    } finally {
      setTeamSaving(false);
    }
  };

  const handleRemoveTeamMember = async (memberId: string) => {
    if (!token) return;
    setTeamRemovingId(memberId);
    try {
      await removeOrgTeamMember(token, memberId);
      setTeam((prev) => prev.filter((member) => member.id !== memberId));
      toast.success('Team member removed.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to remove teammate.');
    } finally {
      setTeamRemovingId(null);
    }
  };

  const handleTeamPermissionToggle = (permission: string) => {
    setTeamForm((prev) => {
      const hasPermission = prev.permissions.includes(permission);
      return {
        ...prev,
        permissions: hasPermission ? prev.permissions.filter((value) => value !== permission) : [...prev.permissions, permission],
      };
    });
  };

  const handlePaypointFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setPaypointForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTeamFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setTeamForm((prev) => ({ ...prev, [name]: value }));
  };

  const scrollToCreateForm = () => {
    if (createFormRef.current) {
      createFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sortedPaypoints = useMemo(() => {
    return [...paypoints].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [paypoints]);

  const publishedCount = useMemo(() => paypoints.filter((item) => item.status === 'published').length, [paypoints]);
  const draftCount = useMemo(() => paypoints.filter((item) => item.status === 'draft').length, [paypoints]);
  const builderCompleted = useMemo(() => paypoints.filter((item) => item.builderSummary && item.builderSummary.progress >= 90).length, [paypoints]);

  const recentTransactions = overview?.recentTransactions ?? [];
  const activityFeed = overview?.activity ?? [];

  const lastSync = overview?.organization?.lastActivity ? formatRelative(overview.organization.lastActivity) : 'moments ago';

  if (isLoading || !overview) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-indigo-400" />
        <p className="text-sm text-slate-400">Preparing your workspace...</p>
      </div>
    );
  }

  const stats = overview.stats ?? { totalCollected: 0, activePaypoints: 0, totalTransactions: 0, unpaidMembers: 0 };

  const statCards = [
    {
      title: 'Total collected',
      value: formatCurrency(stats.totalCollected ?? 0),
      change: 'Across every published PayPoint',
      icon: Wallet,
      accent: 'green' as const,
    },
    {
      title: 'Active PayPoints',
      value: stats.activePaypoints ?? 0,
      change: `${publishedCount} live • ${draftCount} drafts`,
      icon: Globe,
      accent: 'blue' as const,
    },
    {
      title: 'Transactions logged',
      value: stats.totalTransactions ?? 0,
      change: 'Synced in real time',
      icon: Receipt,
      accent: 'indigo' as const,
    },
    {
      title: 'Members pending',
      value: stats.unpaidMembers ?? 0,
      change: 'Need nudges or follow-up',
      icon: Users,
      accent: 'amber' as const,
    },
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.18),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-indigo-900/40 via-transparent lg:block" />
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_25px_55px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Org admin workspace</p>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">{overview.organization?.name ?? 'Organization'}</h1>
              <p className="text-sm text-slate-400">
                {overview.organization?.category ?? 'Community'} • {publishedCount} live PayPoints • synced {lastSync}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/70">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  Compliance-ready payouts
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1">
                  <TrendingUp className="h-4 w-4 text-indigo-300" />
                  Real-time analytics
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1">
                  <Users2 className="h-4 w-4 text-pink-300" />
                  {team.length} teammates active
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => loadOverview(false)}
                disabled={isRefreshing}
                className="inline-flex h-12 items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 text-sm font-medium text-white transition hover:border-indigo-400/50 hover:text-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin text-indigo-300" /> : <RefreshCw className="h-4 w-4 text-indigo-300" />}
                Sync now
              </button>
              <button
                type="button"
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:border-indigo-400/60 hover:text-indigo-200"
              >
                <Bell className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:border-indigo-400/60 hover:text-indigo-200 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-red-500 to-orange-400 px-5 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:brightness-110"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </header>

        <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.7fr,1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_55px_rgba(15,23,42,0.35)] backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-wide text-white/60">PayPoints</p>
                  <h2 className="text-2xl font-semibold text-white">Operational pipeline</h2>
                  <p className="text-sm text-slate-400">Manage the lifecycle of every contributions page.</p>
                </div>
                <button
                  type="button"
                  onClick={scrollToCreateForm}
                  className="inline-flex items-center gap-2 rounded-2xl border border-indigo-400/40 px-4 py-2 text-sm font-semibold text-indigo-100 transition hover:border-indigo-300/70 hover:bg-indigo-500/10"
                >
                  <PlusCircle className="h-4 w-4" />
                  Create PayPoint
                </button>
              </div>
              <div className="mt-6 space-y-4">
                {sortedPaypoints.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900/40 p-6 text-center">
                    <p className="text-base font-medium text-white">No PayPoints just yet</p>
                    <p className="mt-1 text-sm text-slate-400">Create a PayPoint to start sharing payments with members.</p>
                  </div>
                )}
                {sortedPaypoints.slice(0, 4).map((paypoint) => {
                  const statusMeta = paypointStatusStyles[paypoint.status];
                  return (
                    <div
                      key={paypoint.id}
                      className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 transition hover:border-indigo-400/50 hover:bg-slate-900/70"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-white">{paypoint.title}</h3>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusMeta.classes}`}>
                              {statusMeta.label}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400">{paypoint.restriction}</p>
                          <div className="mt-3 flex flex-wrap gap-4 text-sm text-white">
                            <span>{formatCurrency(paypoint.amount)}</span>
                            <span className="text-white/70">Collected {formatCurrency(paypoint.totalCollected || 0)}</span>
                            <span className="text-white/60">{paypoint.unpaidMembers} unpaid</span>
                          </div>
                        </div>
                        <div className="text-right text-xs text-white/60">
                          <p>Updated {formatRelative(paypoint.updatedAt)}</p>
                          <p className="mt-1 inline-flex items-center gap-1 text-emerald-300">
                            <Globe className="h-3.5 w-3.5" />
                            {paypoint.slug}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/70">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-semibold text-white">
                          <KeyRound className="h-3.5 w-3.5 text-indigo-300" />
                          {paypoint.accessCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyAccessCode(paypoint.id, paypoint.accessCode)}
                          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 font-semibold text-white transition hover:border-indigo-400/60">
                          {codeClipboardId === paypoint.id ? (
                            <ClipboardCheck className="h-3.5 w-3.5 text-emerald-300" />
                          ) : (
                            <KeyRound className="h-3.5 w-3.5 text-indigo-300" />
                          )}
                          <span className="text-xs">Copy code</span>
                        </button>
                      </div>
                      {paypoint.builderSummary && (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/80">
                          <p className="text-sm font-medium text-white">Builder progress: {paypoint.builderSummary.progress}%</p>
                          <p className="mt-1 text-white/60">Sections configured: {paypoint.builderSummary.sections}</p>
                          <p className="mt-1 text-white/60">
                            Last edited {paypoint.builderSummary.lastEditedAt ? formatRelative(paypoint.builderSummary.lastEditedAt) : 'recently'}
                          </p>
                        </div>
                      )}
                      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                        <button
                          type="button"
                          onClick={() => navigate(`/org-admin/paypoints/${paypoint.id}/builder`)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-3 py-2 text-sm font-medium text-white transition hover:border-indigo-400/60"
                        >
                          <Palette className="h-4 w-4 text-indigo-300" />
                          Builder
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/org-admin/paypoints/${paypoint.id}/transactions`)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-3 py-2 text-sm font-medium text-white transition hover:border-indigo-400/60"
                        >
                          <Receipt className="h-4 w-4 text-emerald-300" />
                          Transactions
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(paypoint.slug, paypoint.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-3 py-2 text-sm font-medium text-white transition hover:border-indigo-400/60"
                        >
                          {clipboardId === paypoint.id ? <ClipboardCheck className="h-4 w-4 text-emerald-300" /> : <Clipboard className="h-4 w-4 text-indigo-300" />}
                          Share link
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyBuilderPreview(paypoint.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-3 py-2 text-sm font-medium text-white transition hover:border-indigo-400/60"
                        >
                          {previewClipboardId === paypoint.id ? <ClipboardCheck className="h-4 w-4 text-emerald-300" /> : <Palette className="h-4 w-4 text-pink-300" />}
                          Live preview
                        </button>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(paypoint.id, paypoint.status === 'published' ? 'archived' : 'published')}
                          disabled={statusLoadingId === paypoint.id}
                          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold text-white transition hover:border-indigo-400/60 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {statusLoadingId === paypoint.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-indigo-300" />}
                          {paypoint.status === 'published' ? 'Archive' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadReport(paypoint.id)}
                          disabled={downloadLoadingId === paypoint.id}
                          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold text-white transition hover:border-indigo-400/60 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {downloadLoadingId === paypoint.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5 text-emerald-300" />}
                          Export
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.4)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-wide text-white/60">Transactions</p>
                  <h2 className="text-2xl font-semibold text-white">Live payer activity</h2>
                  <p className="text-sm text-slate-400">Monitor every payment, response, and verification.</p>
                </div>
                <TrendingUp className="h-10 w-10 text-indigo-300" />
              </div>
              <div className="mt-6 space-y-4">
                {recentTransactions.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-white/15 px-4 py-5 text-center text-sm text-slate-400">No transactions recorded yet. Once members start paying, you will see them here instantly.</p>
                )}
                {recentTransactions.slice(0, 6).map((transaction) => {
                  const statusLabel = formatTransactionStatus(transaction.status);
                  const responseEntries = Object.entries(transaction.responses ?? {}).slice(0, 2) as Array<[string, { label?: string; value?: string }]>;
                  return (
                    <div key={transaction.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-base font-semibold text-white">{transaction.memberName}</p>
                          <p className="text-sm text-slate-400">{transaction.department}</p>
                          <p className="text-xs text-slate-400">Ref: {transaction.reference}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-emerald-300">{formatCurrency(transaction.amount)}</p>
                          <p className="text-xs text-white/70">{transaction.paidAt ? formatRelative(transaction.paidAt) : 'Awaiting payment'}</p>
                          <span className="mt-1 inline-flex items-center justify-center rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/80">
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                      {responseEntries.length > 0 && (
                        <div className="mt-4 grid gap-4 text-sm text-white/80 md:grid-cols-2">
                          {responseEntries.map(([key, response]) => (
                            <div key={key} className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
                              <p className="text-[11px] uppercase tracking-wide text-white/40">{response.label ?? key}</p>
                              <p className="mt-1 text-sm text-white">{response.value ?? '--'}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/60">
                        <button
                          type="button"
                          onClick={() => navigate(`/org-admin/paypoints/${transaction.paypointId}/transactions`)}
                          className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 font-medium text-white transition hover:border-indigo-400/60"
                        >
                          View details
                        </button>
                        <span className="text-white/40">•</span>
                        <span>{transaction.paypointTitle}</span>
                        {transaction.method && (
                          <>
                            <span className="text-white/40">•</span>
                            <span>{transaction.method}</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <form
              ref={createFormRef}
              onSubmit={handleCreatePaypoint}
              className="rounded-3xl border border-white/10 bg-gradient-to-b from-indigo-950/70 via-slate-950 to-slate-950 p-6 shadow-[0_25px_55px_rgba(15,23,42,0.45)]"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <PlusCircle className="h-5 w-5 text-indigo-200" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Create</p>
                  <h3 className="text-xl font-semibold text-white">Launch a PayPoint</h3>
                </div>
              </div>
              <div className="mt-6 space-y-4 text-sm">
                <div>
                  <label htmlFor="title" className="text-xs uppercase tracking-wide text-white/60">
                    PayPoint title
                  </label>
                  <input
                    id="title"
                    name="title"
                    value={paypointForm.title}
                    onChange={handlePaypointFormChange}
                    placeholder="e.g., Semester dues 2025"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-indigo-400/70 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="text-xs uppercase tracking-wide text-white/60">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={paypointForm.description}
                    onChange={handlePaypointFormChange}
                    rows={3}
                    placeholder="Give contributors context and expectations"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-indigo-400/70 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="amount" className="text-xs uppercase tracking-wide text-white/60">
                    Default amount (GHS)
                  </label>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    min="1"
                    value={paypointForm.amount}
                    onChange={handlePaypointFormChange}
                    placeholder="50"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-indigo-400/70 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="restriction" className="text-xs uppercase tracking-wide text-white/60">
                    Eligibility
                  </label>
                  <select
                    id="restriction"
                    name="restriction"
                    value={paypointForm.restriction}
                    onChange={handlePaypointFormChange}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-indigo-400/70 focus:outline-none"
                  >
                    {restrictionOptions.map((option) => (
                      <option key={option} value={option} className="bg-slate-900 text-slate-100">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={creatingPaypoint}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingPaypoint ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {creatingPaypoint ? 'Creating...' : 'Publish draft'}
              </button>
            </form>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-10 w-10 text-indigo-300" />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Automations</p>
                  <h3 className="text-xl font-semibold text-white">Keep finances in motion</h3>
                  <p className="text-sm text-white/70">Preset workflows that keep members informed.</p>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {automationPresets.map((automation) => (
                  <div key={automation.title} className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                    <p className="text-sm font-semibold text-white">{automation.title}</p>
                    <p className="text-xs text-white/70">{automation.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-xs text-white/60">
                <ShieldCheck className="mb-2 h-5 w-5 text-emerald-300" />
                Builder-ready PayPoints ({builderCompleted}/{paypoints.length}) already have review pages enabled for members before payment.
              </div>
            </div>
          </div>
        </section>
        <section className="mt-10 grid gap-6 lg:grid-cols-[1.5fr,1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Team workspace</p>
                <h3 className="text-2xl font-semibold text-white">Access control</h3>
                <p className="text-sm text-white/70">Invite your finance, compliance, and executive teammates.</p>
              </div>
              <Users2 className="h-10 w-10 text-indigo-300" />
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Members</p>
                <div className="max-h-[360px] space-y-4 overflow-y-auto pr-2">
                  {team.length === 0 && <p className="text-sm text-white/60">No teammates yet — invite your first collaborator.</p>}
                  {team.map((member) => (
                    <div key={member.id} className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-white">{member.name}</p>
                          <p className="text-sm text-white/60">{member.email}</p>
                          <p className="text-xs text-white/50">Role: {member.role}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTeamMember(member.id)}
                          disabled={teamRemovingId === member.id}
                          className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white transition hover:border-rose-400/60 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {teamRemovingId === member.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Remove'}
                        </button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {member.permissions.length === 0 && <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/60">Basic access</span>}
                        {member.permissions.map((permission) => (
                          <span key={permission} className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/70">
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <form onSubmit={handleAddTeamMember} className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/40 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Invite teammate</p>
                <div>
                  <label htmlFor="team-name" className="text-xs text-white/60">
                    Full name
                  </label>
                  <input
                    id="team-name"
                    name="name"
                    value={teamForm.name}
                    onChange={handleTeamFormChange}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-indigo-400/70 focus:outline-none"
                    placeholder="Ama K."
                    required
                  />
                </div>
                <div>
                  <label htmlFor="team-email" className="text-xs text-white/60">
                    Work email
                  </label>
                  <input
                    id="team-email"
                    type="email"
                    name="email"
                    value={teamForm.email}
                    onChange={handleTeamFormChange}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-indigo-400/70 focus:outline-none"
                    placeholder="finance@org.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="team-role" className="text-xs text-white/60">
                    Role
                  </label>
                  <input
                    id="team-role"
                    name="role"
                    value={teamForm.role}
                    onChange={handleTeamFormChange}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-indigo-400/70 focus:outline-none"
                    placeholder="Finance lead"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-white/60">Permissions</p>
                  <div className="space-y-3">
                    {permissionOptions.map((permission) => (
                      <label key={permission.key} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-white/30 bg-transparent text-indigo-500 focus:ring-indigo-400"
                          checked={teamForm.permissions.includes(permission.key)}
                          onChange={() => handleTeamPermissionToggle(permission.key)}
                        />
                        <span>
                          <span className="font-semibold">{permission.label}</span>
                          <span className="block text-xs text-white/60">{permission.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={teamSaving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-400 px-4 py-2.5 text-sm font-semibold text-emerald-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {teamSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                  {teamSaving ? 'Sending invite...' : 'Invite teammate'}
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Activity feed</p>
                  <h3 className="text-xl font-semibold text-white">Realtime log</h3>
                  <p className="text-sm text-white/70">Everything your workspace has done in chronological order.</p>
                </div>
                <RefreshCw className="h-6 w-6 text-indigo-300" />
              </div>
              <div className="mt-5 space-y-5">
                {activityFeed.length === 0 && <p className="text-sm text-white/60">No activities to show yet.</p>}
                {activityFeed.slice(0, 6).map((entry) => (
                  <div key={entry.id} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />
                    <div>
                      <p className="text-sm font-semibold text-white">{entry.title}</p>
                      <p className="text-xs text-white/70">{entry.description}</p>
                      <div className="mt-1 text-[11px] text-white/50">
                        <span>{entry.actor}</span>
                        <span className="mx-2 text-white/30">•</span>
                        <span>{formatRelative(entry.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-3">
                <Globe className="h-10 w-10 text-indigo-300" />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Live links</p>
                  <h3 className="text-xl font-semibold text-white">Share-ready experiences</h3>
                  <p className="text-sm text-white/70">Every published PayPoint ships with a branded review page before checkout.</p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-dashed border-white/20 bg-slate-900/40 p-4 text-sm text-white/80">
                <p>
                  Copying a PayPoint link now points directly to the hosted experience (e.g.{' '}
                  <span className="font-semibold text-indigo-200">/paypoint/engineering-society/semester-dues-2025</span>) so payers skip the builder workspace and see the live payment form instantly.
                </p>
              </div>
              <p className="mt-4 text-xs text-white/60">
                Need a public preview? Use the “Live preview” button on each PayPoint card. Those URLs stay in sync in real time, matching the builder configuration exactly.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OrgAdminDashboard;


