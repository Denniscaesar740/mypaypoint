import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Bell,
  LogOut,
  Building,
  ShieldCheck,
  CreditCard,
  Settings,
  Activity,
  BarChart3,
  ClipboardList,
  RefreshCw,
  CheckCircle,
  PauseCircle,
  PlayCircle,
  Loader2,
  FileText,
  CalendarDays,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import type {
  ActivityEntry,
  AdminOverview,
  Announcement,
  ApplicationRecord,
  GatewayProvider,
  Organization,
  PricingConfig,
  RefundRequest,
} from '../lib/api';
import {
  approveOrganization,
  createAnnouncement,
  createOrganization,
  getAdminApplications,
  getAdminOrganizations,
  getAdminOverview,
  getAnnouncements,
  getGateways,
  getPricingConfig,
  getRefunds,
  reactivateOrganization,
  resolveRefund,
  reviewApplication,
  restoreGateway,
  suspendOrganization,
  triggerGatewayFailover,
  updatePricingConfig,
} from '../lib/api';
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

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: 'indigo' | 'emerald' | 'blue' | 'amber';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, accent = 'indigo' }) => {
  const accentStyles: Record<'indigo' | 'emerald' | 'blue' | 'amber', { bg: string; text: string }> = {
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-300' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-300' },
    blue: { bg: 'bg-sky-500/10', text: 'text-sky-300' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-300' },
  };

  const accentTokens = accentStyles[accent];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-100 shadow-[0_20px_45px_rgba(15,23,42,0.3)] backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/60">{title}</p>
        <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${accentTokens.bg} ${accentTokens.text}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-4xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-white/70">{change}</p>
      <div className={`pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full ${accentTokens.bg}`} />
    </div>
  );
};

const organizationCategories = ['Academic', 'Professional', 'Creative', 'Sports', 'Religious', 'Other'];

const formatCurrency = (value: number): string => `GHS ${value.toLocaleString('en-US')}`;

const formatRelativeTime = (isoDate: string): string => {
  try {
    return `${formatDistanceToNow(new Date(isoDate), { addSuffix: true })}`;
  } catch {
    return isoDate;
  }
};

const shellOverlay = 'rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_55px_rgba(15,23,42,0.45)] backdrop-blur';

const SuperAdminDashboard: React.FC = () => {
  const location = useLocation();
  useNavigationGuard(location.pathname.startsWith('/super-admin'), 'Are you sure you want to leave the admin workspace?');

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [orgSummary, setOrgSummary] = useState<{ total: number; active: number; pending: number; suspended: number }>({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
  });
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [gateways, setGateways] = useState<GatewayProvider[]>([]);
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [registeringOrg, setRegisteringOrg] = useState(false);
  const [orgActionLoading, setOrgActionLoading] = useState<string | null>(null);
  const [refundActionLoading, setRefundActionLoading] = useState<string | null>(null);
  const [gatewayActionLoading, setGatewayActionLoading] = useState<string | null>(null);
  const [pricingSaving, setPricingSaving] = useState(false);
  const [announcementSaving, setAnnouncementSaving] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const [newOrganization, setNewOrganization] = useState({
    name: '',
    category: organizationCategories[0],
    contactEmail: '',
  });

  const [pricingForm, setPricingForm] = useState({
    transactionFee: '',
    platformCommission: '',
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    scheduledFor: '',
  });
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [applicationActionLoading, setApplicationActionLoading] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const storedSession = localStorage.getItem('paypoint.session');
    if (!storedSession) {
      toast.error('Please sign in to access the dashboard.');
      navigate('/login');
      return;
    }

    try {
      const parsed: SessionInfo = JSON.parse(storedSession);
      if (parsed.user.role !== 'super-admin') {
        toast.error('You do not have access to the Super Admin dashboard.');
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

  const loadAll = useCallback(
    async (showLoader = true) => {
      if (!token) return;

      if (showLoader) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const [
          overviewData,
          organizationsData,
          refundsData,
          gatewaysData,
          pricingData,
          announcementsData,
          applicationsData,
        ] = await Promise.all([
          getAdminOverview(token),
          getAdminOrganizations(token),
          getRefunds(token),
          getGateways(token),
          getPricingConfig(token),
          getAnnouncements(token),
          getAdminApplications(token),
        ]);

        setOverview(overviewData);
        setOrganizations(organizationsData.items);
        setOrgSummary(organizationsData.summary);
        setRefunds(refundsData.items);
        setGateways(gatewaysData.items);
        setPricing(pricingData);
        setPricingForm({
          transactionFee: pricingData.transactionFee.toString(),
          platformCommission: pricingData.platformCommission.toString(),
        });
        setAnnouncements(announcementsData.items);
        setApplications(applicationsData.items);
        setLastRefreshed(new Date());
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Failed to load dashboard data.');
        }
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
    loadAll();

    const interval = setInterval(() => {
      loadAll(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [token, loadAll]);

  const handleApplicationDecision = useCallback(
    async (applicationId: string, action: 'approved' | 'declined') => {
      if (!token) return;
      setApplicationActionLoading(applicationId);
      try {
        const updated = await reviewApplication(token, applicationId, action);
        setApplications((prev) =>
          prev.map((item) => (item.id === applicationId ? updated : item))
        );
        toast.success(`Application ${action === 'approved' ? 'approved' : 'declined'}.`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to update application status.');
      } finally {
        setApplicationActionLoading(null);
      }
    },
    [token]
  );

  const handleLogout = () => {
    localStorage.removeItem('paypoint.session');
    toast.success('Signed out.');
    navigate('/login');
  };

  const handleCreateOrganization = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    if (!newOrganization.name.trim()) {
      toast.error('Organization name is required.');
      return;
    }

    setRegisteringOrg(true);
    try {
      await createOrganization(token, {
        name: newOrganization.name.trim(),
        category: newOrganization.category,
        contactEmail: newOrganization.contactEmail.trim() || undefined,
      });
      toast.success('Organization registered successfully.');
      setNewOrganization({
        name: '',
        category: organizationCategories[0],
        contactEmail: '',
      });
      await loadAll(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to register organization.');
      }
    } finally {
      setRegisteringOrg(false);
    }
  };

  const handleOrganizationAction = async (
    action: 'approve' | 'suspend' | 'reactivate',
    organizationId: string
  ) => {
    if (!token) return;
    setOrgActionLoading(organizationId);
    try {
      if (action === 'approve') {
        await approveOrganization(token, organizationId);
        toast.success('Organization approved.');
      } else if (action === 'suspend') {
        await suspendOrganization(token, organizationId);
        toast.info('Organization suspended.');
      } else {
        await reactivateOrganization(token, organizationId);
        toast.success('Organization reactivated.');
      }
      await loadAll(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Organization action failed.');
      }
    } finally {
      setOrgActionLoading(null);
    }
  };

  const handleResolveRefund = async (refundId: string, action: 'approve' | 'decline') => {
    if (!token) return;
    setRefundActionLoading(refundId);
    try {
      await resolveRefund(token, refundId, { action });
      toast.success(`Refund ${action === 'approve' ? 'approved' : 'declined'}.`);
      await loadAll(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to resolve refund.');
      }
    } finally {
      setRefundActionLoading(null);
    }
  };

  const handleGatewayAction = async (gatewayId: string, action: 'failover' | 'restore') => {
    if (!token) return;
    setGatewayActionLoading(gatewayId);
    try {
      if (action === 'failover') {
        await triggerGatewayFailover(token, gatewayId);
        toast.warning('Gateway failover triggered.');
      } else {
        await restoreGateway(token, gatewayId);
        toast.success('Gateway restored.');
      }
      await loadAll(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Gateway action failed.');
      }
    } finally {
      setGatewayActionLoading(null);
    }
  };

  const handleUpdatePricing = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    const transactionFee = Number(pricingForm.transactionFee);
    const platformCommission = Number(pricingForm.platformCommission);

    if (Number.isNaN(transactionFee) || Number.isNaN(platformCommission)) {
      toast.error('Enter numeric values for transaction fee and platform commission.');
      return;
    }

    setPricingSaving(true);
    try {
      await updatePricingConfig(token, { transactionFee, platformCommission });
      toast.success('Pricing updated.');
      await loadAll(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update pricing.');
      }
    } finally {
      setPricingSaving(false);
    }
  };

  const handleCreateAnnouncement = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
      toast.error('Announcement title and content are required.');
      return;
    }

    setAnnouncementSaving(true);
    try {
      await createAnnouncement(token, {
        title: announcementForm.title.trim(),
        content: announcementForm.content.trim(),
        scheduledFor: announcementForm.scheduledFor || undefined,
      });
      toast.success('Announcement scheduled.');
      setAnnouncementForm({
        title: '',
        content: '',
        scheduledFor: '',
      });
      await loadAll(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to schedule announcement.');
      }
    } finally {
      setAnnouncementSaving(false);
    }
  };

  const pendingRefunds = useMemo(
    () => refunds.filter((refund) => refund.status === 'pending'),
    [refunds]
  );

  const topOrganizations = useMemo(() => overview?.topOrganizations ?? [], [overview]);

  const activityFeed: ActivityEntry[] = useMemo(() => overview?.activity ?? [], [overview]);

  const checklistItems = useMemo(() => overview?.checklist ?? [], [overview]);

  const stats = overview?.stats;

  return (
    <div className="super-admin-dashboard relative min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-indigo-900/40 via-transparent lg:block" />
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 text-white sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button className="rounded-2xl border border-white/15 p-2 text-white/70 hover:border-indigo-400/60 hover:text-white sm:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-white/60">PayPoint Platform Control</p>
              <h1 className="text-2xl font-semibold text-white">Super Admin Command Center</h1>
              {lastRefreshed && <p className="text-xs text-white/60">Synced {formatRelativeTime(lastRefreshed.toISOString())}</p>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => loadAll(false)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-indigo-400/60 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin text-indigo-300" /> : <RefreshCw className="h-4 w-4 text-indigo-300" />}
              {isRefreshing ? 'Refreshing' : 'Sync data'}
            </button>
            <button className="rounded-2xl border border-white/15 p-2 text-white/70 transition hover:border-indigo-400/60 hover:text-white">
              <Bell className="h-5 w-5" />
            </button>
            <button className="rounded-2xl border border-white/15 p-2 text-white/70 transition hover:border-indigo-400/60 hover:text-white">
              <Settings className="h-5 w-5" />
            </button>
            <button className="relative rounded-2xl border border-white/15 p-2 text-white/70 transition hover:border-indigo-400/60 hover:text-white">
              <Menu className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 inline-flex h-3 w-3 items-center justify-center rounded-full bg-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-100" />
              </span>
            </button>
            <div className="hidden flex-col text-right sm:flex">
              <span className="text-sm font-semibold text-white">{session?.user.name ?? 'Super Admin'}</span>
              <span className="text-xs text-white/60">{session?.user.email ?? 'admin@paypoint.com'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-red-500 to-orange-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:brightness-110"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex min-h-[50vh] items-center justify-center text-white/60">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-indigo-300" />
            Loading dashboard…
          </div>
        ) : (
          <>
            {stats && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Total Revenue (MTD)"
                  value={formatCurrency(stats.totalRevenue)}
                  change={overview?.metrics[0]?.changeLabel ?? ''}
                  icon={BarChart3}
                  accent="emerald"
                />
                <StatCard
                  title="Active Organizations"
                  value={stats.activeOrganizations.toString()}
                  change={`${stats.pendingOrganizations} pending approval`}
                  icon={Building}
                  accent="indigo"
                />
                <StatCard
                  title="Open Refunds"
                  value={stats.openRefunds.toString()}
                  change={`${refunds.filter((r) => r.status === 'pending').length} awaiting review`}
                  icon={ShieldCheck}
                  accent="amber"
                />
                <StatCard
                  title="Gateway Health"
                  value={`${stats.gatewayHealth}%`}
                  change={`${gateways.length} providers monitored`}
                  icon={Activity}
                  accent="blue"
                />
              </div>
            )}

            <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <article className={`${shellOverlay} lg:col-span-2`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Organizations</h2>
                    <p className="text-sm text-white/60">Approve new associations and keep everyone compliant.</p>
                  </div>
                  <div className="rounded-xl bg-white/5 px-4 py-2 text-sm text-white/70">
                    Total {orgSummary.total} • Active {orgSummary.active} • Pending {orgSummary.pending}
                  </div>
                </div>

                <form
                  onSubmit={handleCreateOrganization}
                  className="mt-6 grid grid-cols-1 gap-4 rounded-2xl bg-white/5 p-4 sm:grid-cols-4"
                >
                  <input
                    type="text"
                    required
                    value={newOrganization.name}
                    onChange={(event) => setNewOrganization((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Organization name"
                    className="col-span-1 sm:col-span-2 rounded-lg border border-white/15 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                  <select
                    value={newOrganization.category}
                    onChange={(event) => setNewOrganization((prev) => ({ ...prev, category: event.target.value }))}
                    className="rounded-lg border border-white/15 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    {organizationCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="email"
                      value={newOrganization.contactEmail}
                      onChange={(event) => setNewOrganization((prev) => ({ ...prev, contactEmail: event.target.value }))}
                      placeholder="Contact email (optional)"
                      className="rounded-lg border border-white/15 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:flex-1"
                    />
                    <button
                      type="submit"
                      disabled={registeringOrg}
                      className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
                    >
                      {registeringOrg ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Register'}
                    </button>
                  </div>
                </form>

                <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-white/5">
                      <tr className="text-left text-xs font-semibold uppercase tracking-wider text-white/60">
                        <th className="px-4 py-3">Organization</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Revenue</th>
                        <th className="px-4 py-3">Pending</th>
                        <th className="px-4 py-3">Last activity</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white/5 text-sm">
                      {organizations.map((organization) => (
                        <tr key={organization.id}>
                          <td className="px-4 py-3 font-medium text-white/90">{organization.name}</td>
                          <td className="px-4 py-3 text-white/70">{organization.category}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                organization.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : organization.status === 'pending'
                                  ? 'bg-amber-50 text-amber-600'
                                  : 'bg-rose-50 text-rose-600'
                              }`}
                            >
                              {organization.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white/80">{formatCurrency(organization.totalRevenue)}</td>
                          <td className="px-4 py-3 text-white/70">{organization.pendingApprovals}</td>
                          <td className="px-4 py-3 text-white/60">{formatRelativeTime(organization.lastActivity)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              {organization.status === 'pending' && (
                                <button
                                  onClick={() => handleOrganizationAction('approve', organization.id)}
                                  disabled={orgActionLoading === organization.id}
                                  className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
                                >
                                  {orgActionLoading === organization.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle className="mr-1 h-4 w-4" />
                                      Approve
                                    </>
                                  )}
                                </button>
                              )}
                              {organization.status === 'active' && (
                                <button
                                  onClick={() => handleOrganizationAction('suspend', organization.id)}
                                  disabled={orgActionLoading === organization.id}
                                  className="inline-flex items-center rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-300"
                                >
                                  {orgActionLoading === organization.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <PauseCircle className="mr-1 h-4 w-4" />
                                      Suspend
                                    </>
                                  )}
                                </button>
                              )}
                              {organization.status === 'suspended' && (
                                <button
                                  onClick={() => handleOrganizationAction('reactivate', organization.id)}
                                  disabled={orgActionLoading === organization.id}
                                  className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                                >
                                  {orgActionLoading === organization.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <PlayCircle className="mr-1 h-4 w-4" />
                                      Reactivate
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>

              <article className={shellOverlay}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Refunds & disputes</h2>
                    <p className="text-sm text-white/60">Resolve escalations quickly to maintain trust.</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                </div>
                <div className="mt-6 space-y-4">
                  {pendingRefunds.length === 0 ? (
                    <div className="rounded-xl bg-white/5 p-4 text-sm text-white/60">
                      No pending refunds at the moment.
                    </div>
                  ) : (
                    pendingRefunds.map((refund) => (
                      <div key={refund.id} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-white/90">{refund.memberName}</p>
                            <p className="text-xs text-white/60">
                              {refund.organizationName} • {formatRelativeTime(refund.submittedAt)}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-white">{formatCurrency(refund.amount)}</p>
                        </div>
                        <p className="mt-2 text-white/70">{refund.reason}</p>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleResolveRefund(refund.id, 'approve')}
                            disabled={refundActionLoading === refund.id}
                            className="inline-flex flex-1 items-center justify-center rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
                          >
                            {refundActionLoading === refund.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Approve refund'
                            )}
                          </button>
                          <button
                            onClick={() => handleResolveRefund(refund.id, 'decline')}
                            disabled={refundActionLoading === refund.id}
                            className="inline-flex flex-1 items-center justify-center rounded-lg bg-slate-200 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-slate-300 disabled:cursor-not-allowed disabled:bg-white/10"
                          >
                            {refundActionLoading === refund.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Decline'
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </article>
            </section>

            <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <article className={`${shellOverlay} lg:col-span-2`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Payment gateways</h2>
                    <p className="text-sm text-white/60">Manage provider status, failover, and uptime.</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <CreditCard className="h-5 w-5" />
                  </span>
                </div>
                <div className="mt-6 space-y-3">
                  {gateways.map((gateway) => (
                    <div
                      key={gateway.id}
                      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white/90">{gateway.name}</p>
                        <p className="text-xs text-white/60">
                          Uptime {gateway.uptime}% • Last incident {formatRelativeTime(gateway.lastIncident)}
                        </p>
                      </div>
                      <div className="flex flex-1 flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-end">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            gateway.status === 'healthy'
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {gateway.status === 'healthy' ? 'Healthy' : 'Degraded'}
                        </span>
                        <button
                          onClick={() =>
                            handleGatewayAction(gateway.id, gateway.fallbackActive ? 'restore' : 'failover')
                          }
                          disabled={gatewayActionLoading === gateway.id}
                          className={`inline-flex items-center rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed ${
                            gateway.fallbackActive
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-400'
                              : 'bg-amber-500 text-white hover:bg-amber-600 disabled:bg-amber-300'
                          }`}
                        >
                          {gatewayActionLoading === gateway.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : gateway.fallbackActive ? (
                            'Restore primary'
                          ) : (
                            'Trigger failover'
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className={shellOverlay}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Pricing & fees</h2>
                    <p className="text-sm text-white/60">Adjust platform-wide fee structures.</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/70">
                    <Settings className="h-5 w-5" />
                  </span>
                </div>
                <form onSubmit={handleUpdatePricing} className="mt-6 space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-white/60">
                      Transaction fee (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={pricingForm.transactionFee}
                      onChange={(event) => setPricingForm((prev) => ({ ...prev, transactionFee: event.target.value }))}
                      className="mt-1 w-full rounded-lg border border-white/15 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-white/60">
                      Platform commission (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={pricingForm.platformCommission}
                      onChange={(event) =>
                        setPricingForm((prev) => ({ ...prev, platformCommission: event.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-white/15 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={pricingSaving}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
                  >
                    {pricingSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      'Save pricing'
                    )}
                  </button>
                  {pricing && (
                    <p className="text-xs text-white/50">
                      Last updated {formatRelativeTime(pricing.updatedAt)} by {pricing.updatedBy}.
                    </p>
                  )}
                </form>

                <div className="mt-8 border-t border-slate-100 pt-6">
                  <h3 className="text-sm font-semibold text-white">Announcements</h3>
                  <p className="mt-1 text-xs text-white/60">Schedule updates for the landing page or dashboards.</p>
                  <form onSubmit={handleCreateAnnouncement} className="mt-4 space-y-3">
                    <input
                      type="text"
                      value={announcementForm.title}
                      onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, title: event.target.value }))}
                      placeholder="Announcement title"
                      className="w-full rounded-lg border border-white/15 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                    <textarea
                      value={announcementForm.content}
                      onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, content: event.target.value }))}
                      rows={3}
                      placeholder="Write announcement content…"
                      className="w-full rounded-lg border border-white/15 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                    <input
                      type="datetime-local"
                      value={announcementForm.scheduledFor}
                      onChange={(event) =>
                        setAnnouncementForm((prev) => ({ ...prev, scheduledFor: event.target.value }))
                      }
                      className="w-full rounded-lg border border-white/15 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                    <button
                      type="submit"
                      disabled={announcementSaving}
                      className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-600"
                    >
                      {announcementSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Scheduling…
                        </>
                      ) : (
                        'Schedule announcement'
                      )}
                    </button>
                  </form>
                  <div className="mt-4 space-y-3">
                    {announcements.slice(0, 3).map((announcement) => (
                      <div key={announcement.id} className="rounded-xl bg-white/5 p-4 text-xs text-white/70">
                        <p className="font-semibold text-white/90">{announcement.title}</p>
                        <p className="mt-1">{announcement.content}</p>
                        <p className="mt-1 text-white/60">
                          {announcement.status === 'scheduled' ? 'Scheduled for' : 'Published on'}{' '}
                          {new Date(announcement.scheduledFor).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            </section>

            <section className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className={`${shellOverlay} xl:col-span-2`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Strategic analytics</h2>
                    <p className="text-sm text-white/60">Monitor revenue trends and performance.</p>
                  </div>
                  <button className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    <FileText className="h-4 w-4" />
                    Download summary
                  </button>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                  {overview?.metrics.map((metric) => (
                    <div key={metric.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                          <TrendingUp className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-white/60">{metric.title}</p>
                          <p className="text-2xl font-semibold text-white">
                            {metric.title === 'Revenue' ? formatCurrency(metric.value) : metric.value}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-white/60">{metric.changeLabel}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Top performing organizations</h3>
                    <button className="text-xs font-medium text-indigo-600 hover:text-indigo-500">View all</button>
                  </div>
                  <div className="mt-4 space-y-3">
                    {topOrganizations.map((organization) => (
                      <div
                        key={organization.id}
                        className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white/90">{organization.name}</p>
                          <p className="text-xs text-white/60">{organization.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">
                            {formatCurrency(organization.totalRevenue)}
                          </p>
                          <p className="text-xs text-emerald-600">
                            Updated {formatRelativeTime(organization.lastActivity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className={shellOverlay}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Recent activity</h2>
                    <button className="text-xs font-medium text-indigo-600 hover:text-indigo-500">View history</button>
                  </div>
                  <div className="mt-4 space-y-4">
                    {activityFeed.length === 0 && (
                      <div className="rounded-xl bg-white/5 p-4 text-sm text-white/60">No recent activity.</div>
                    )}
                    {activityFeed.map((activity) => (
                      <div key={activity.id} className="rounded-xl bg-white/5 p-4 text-sm text-white/70">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-white/90">{activity.title}</p>
                          <span className="text-xs text-white/50">{formatRelativeTime(activity.timestamp)}</span>
                        </div>
                        <p className="mt-1 text-xs uppercase tracking-wide text-white/60">{activity.actor}</p>
                        <p className="mt-1 text-white/70">{activity.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={shellOverlay}>
                  <div className="flex items-center gap-3">
                    <ClipboardList className="h-5 w-5 text-indigo-600" />
                    <div>
                      <h2 className="text-lg font-semibold text-white">Operational checklist</h2>
                      <p className="text-xs text-white/60">Track mission-critical tasks.</p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-3">
                    {checklistItems.map((item) => (
                      <li key={item.id} className="flex items-start gap-3 rounded-xl bg-white/5 px-4 py-3">
                        <div
                          className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full ${
                            item.complete ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-white/70'
                          }`}
                        >
                          <CheckCircle className="h-3 w-3" />
                        </div>
                        <span className={`text-sm ${item.complete ? 'text-white/60 line-through' : 'text-white/70'}`}>
                          {item.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={shellOverlay}>
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-indigo-600" />
                    <div>
                      <h2 className="text-lg font-semibold text-white">Upcoming announcements</h2>
                      <p className="text-xs text-white/60">Preview what the community will see next.</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {announcements.length === 0 && (
                      <div className="rounded-xl bg-white/5 p-4 text-sm text-white/60">
                        No announcements scheduled.
                      </div>
                    )}
                    {announcements.slice(0, 3).map((announcement) => (
                      <div key={announcement.id} className="rounded-xl bg-white/5 p-4 text-sm text-white/70">
                        <p className="font-semibold text-white/90">{announcement.title}</p>
                        <p className="mt-1 text-xs text-white/60">
                          {announcement.status === 'scheduled' ? 'Scheduled for' : 'Published on'}{' '}
                          {new Date(announcement.scheduledFor).toLocaleString()}
                        </p>
                        <p className="mt-2">{announcement.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            <section className="mt-10">
              <div className={shellOverlay}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Pending applications</h2>
                    <p className="text-xs text-white/60">Review incoming organizations before they gain access.</p>
                  </div>
                  <span className="text-xs text-white/50">Auto-refreshes every 30s</span>
                </div>
                <div className="mt-6 space-y-4">
                  {applications.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/30 bg-white/5 px-4 py-6 text-sm text-white/60">
                      No applications awaiting review.
                    </div>
                  ) : (
                    applications.map((application) => {
                      const isLoadingAction = applicationActionLoading === application.id;
                      const isPending = application.status === 'pending';
                      return (
                        <article key={application.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_45px_rgba(2,6,23,0.45)]">
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-lg font-semibold text-white">{application.organizationName}</p>
                              <p className="text-xs text-white/60">
                                {application.university} • {application.organizationType}
                              </p>
                              <p className="text-xs text-white/50">Submitted {formatRelativeTime(application.submittedAt)}</p>
                            </div>
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                application.status === 'approved'
                                  ? 'bg-emerald-500/20 text-emerald-200'
                                  : application.status === 'declined'
                                  ? 'bg-rose-500/20 text-rose-200'
                                  : 'bg-indigo-500/20 text-indigo-200'
                              }`}
                            >
                              {application.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 text-xs text-white/70">
                            <div>
                              <p className="text-[11px] uppercase tracking-wide text-white/50">Primary contact</p>
                              <p className="font-semibold text-white/90">{application.contactName}</p>
                              <p>{application.contactEmail}</p>
                              <p>{application.contactPhone}</p>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-wide text-white/50">Organization stats</p>
                              <p>{application.memberCount} members</p>
                              <p className="text-white/60">Established {application.establishedYear}</p>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-wide text-white/50">Notes</p>
                              <p>{application.description || 'No additional notes provided.'}</p>
                              {application.reviewNote && (
                                <p className="mt-1 text-[10px] text-white/50">Review note: {application.reviewNote}</p>
                              )}
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-white/70">
                            <span className="rounded-full border border-white/15 px-3 py-1">
                              Registration: {application.documents?.registrationDoc?.name || 'missing'}
                            </span>
                            <span className="rounded-full border border-white/15 px-3 py-1">
                              Leadership: {application.documents?.leadershipProof?.name || 'missing'}
                            </span>
                            <span className="rounded-full border border-white/15 px-3 py-1">
                              Affiliation: {application.documents?.universityAffiliation?.name || 'missing'}
                            </span>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleApplicationDecision(application.id, 'approved')}
                              disabled={!isPending || isLoadingAction}
                              className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isLoadingAction ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApplicationDecision(application.id, 'declined')}
                              disabled={!isPending || isLoadingAction}
                              className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:border-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isLoadingAction ? 'Processing...' : 'Decline'}
                            </button>
                          </div>
                          {application.reviewedBy && application.reviewedAt && (
                            <p className="mt-3 text-[11px] text-white/50">
                              Reviewed by {application.reviewedBy} on {new Date(application.reviewedAt).toLocaleString()}
                            </p>
                          )}
                        </article>
                      );
                    })
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;

