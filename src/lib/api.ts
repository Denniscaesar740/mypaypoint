export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const resolveDefaultApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:4000';
    }
  }
  return 'https://mypaypoint.onrender.com';
};

export const API_BASE_URL =
  (typeof import.meta !== 'undefined'
    ? (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_API_BASE_URL
    : undefined) || resolveDefaultApiBaseUrl();

type RequestConfig = RequestInit & {
  token?: string;
};

async function request<T>(path: string, config: RequestConfig = {}): Promise<T> {
  const headers = new Headers(config.headers || {});

  if (config.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (config.token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${config.token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...config,
      headers,
    });
  } catch (error) {
    throw new ApiError(0, 'Unable to reach the server. Please check your connection.', error);
  }

  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const message =
      (data as { message?: string } | null)?.message ||
      `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, data);
  }

  return data as T;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  expiresIn: number;
}

export async function login(credentials: { email: string; password: string }): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function logout(token: string): Promise<void> {
  await request('/auth/logout', {
    method: 'POST',
    token,
  });
}

export interface AnalyticsSummary {
  totalLogins: number;
  failedLogins: number;
  loginsByRole: Array<{ role: string; count: number }>;
  activeSessions: number;
  generatedAt: string;
}

export async function getAnalyticsSummary(token: string): Promise<AnalyticsSummary> {
  return request<AnalyticsSummary>('/analytics/summary', {
    method: 'GET',
    token,
  });
}

export interface ValidateResponse {
  user: LoginResponse['user'];
  issuedAt: string;
}

export async function validateSession(token: string): Promise<ValidateResponse> {
  return request<ValidateResponse>('/auth/validate', {
    method: 'GET',
    token,
  });
}

export interface AdminOverview {
  stats: {
    totalRevenue: number;
    activeOrganizations: number;
    suspendedOrganizations: number;
    pendingOrganizations: number;
    openRefunds: number;
    gatewayHealth: number;
  };
  metrics: Array<{
    title: string;
    value: number;
    changeLabel: string;
  }>;
  topOrganizations: Array<Organization>;
  activity: Array<ActivityEntry>;
  checklist: Array<{
    id: string;
    label: string;
    complete: boolean;
  }>;
}

export interface Organization {
  id: string;
  name: string;
  category: string;
  status: 'pending' | 'active' | 'suspended';
  totalRevenue: number;
  pendingApprovals: number;
  contactEmail: string | null;
  lastActivity: string;
}

export interface ActivityEntry {
  id: string;
  type: string;
  title: string;
  description: string;
  actor: string;
  timestamp: string;
}

export interface OrganizationsResponse {
  items: Organization[];
  summary: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
  };
}

export interface RefundRequest {
  id: string;
  organizationId: string;
  organizationName: string;
  memberName: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'declined';
  submittedAt: string;
  resolvedAt?: string;
  resolutionNote?: string | null;
}

export interface RefundsResponse {
  items: RefundRequest[];
}

export interface GatewayProvider {
  id: string;
  name: string;
  status: 'healthy' | 'degraded';
  uptime: number;
  fallbackActive: boolean;
  lastIncident: string;
}

export interface GatewaysResponse {
  items: GatewayProvider[];
}

export interface PricingConfig {
  transactionFee: number;
  platformCommission: number;
  updatedAt: string;
  updatedBy: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  scheduledFor: string;
  status: 'scheduled' | 'published';
}

export interface AnnouncementsResponse {
  items: Announcement[];
}

export interface OrgPaypointTransaction {
  id: string;
  memberName: string;
  studentId?: string;
  department: string;
  yearGroup?: string;
  amount: number;
  status: 'paid' | 'pending' | 'refunded';
  reference: string;
  paidAt: string | null;
  method?: string;
  responses?: BuilderResponseValues;
}

export type BuilderFieldType = 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'select' | 'checkbox';

export interface BuilderFieldOption {
  id: string;
  label: string;
  value: string;
}

export interface BuilderFieldValidation {
  type: string;
  value?: string | number;
  message?: string;
}

export interface BuilderField {
  id: string;
  label: string;
  type: BuilderFieldType;
  required: boolean;
  helperText?: string;
  placeholder?: string;
  width?: 'full' | 'half';
  options?: BuilderFieldOption[];
  validations?: BuilderFieldValidation[];
}

export interface BuilderSection {
  id: string;
  title: string;
  description?: string;
  fields: BuilderField[];
}

export interface BuilderStageProgress {
  id: string;
  title: string;
  description: string;
  bullets?: string[];
  complete: boolean;
}

export interface BuilderAutomationToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface PaypointBuilderState {
  version: number;
  presetId: string;
  accent: string;
  hero: {
    heading: string;
    subheading: string;
    primaryActionLabel: string;
  };
  payment: {
    amount: number;
    allowCustomAmount: boolean;
    acceptedMethods: string[];
    dueDate: string | null;
  };
  automation: BuilderAutomationToggle[];
  gating: {
    restriction: string;
    requireStudentId: boolean;
    referenceField: string;
  };
  sections: BuilderSection[];
  stageProgress: BuilderStageProgress[];
  updatedAt: string;
  updatedBy: string;
}

export type PublicBuilderState = Pick<
  PaypointBuilderState,
  'presetId' | 'accent' | 'hero' | 'payment' | 'sections' | 'gating'
>;

export type BuilderResponseValues = Record<string, { label: string; value: string }>;

export interface BuilderSummary {
  presetId: string;
  accent?: string;
  sections: number;
  lastEditedAt: string | null;
  progress: number;
}

export interface BuilderFieldTemplate {
  type: BuilderFieldType;
  label: string;
  description: string;
  capabilities: string[];
  sampleValue: string;
  optionTemplate?: BuilderFieldOption[];
}

export interface BuilderBlueprint {
  id: string;
  title: string;
  description: string;
  accent: string;
  tags: string[];
  sections: BuilderSection[];
}

export interface BuilderMetadataResponse {
  fieldLibrary: BuilderFieldTemplate[];
  stageTemplates: Array<{
    id: string;
    title: string;
    description: string;
    bullets?: string[];
    defaultComplete?: boolean;
  }>;
  blueprints: BuilderBlueprint[];
  automationOptions: Array<{
    id: string;
    label: string;
    description: string;
    defaultEnabled: boolean;
  }>;
}

export interface PaypointBuilderResponse {
  paypoint: {
    id: string;
    title: string;
    status: 'draft' | 'published' | 'archived';
    amount: number;
    restriction: string;
    description: string;
    link: string;
    slug: string;
    updatedAt: string;
    builderSummary: BuilderSummary;
  };
  builder: PaypointBuilderState;
}

export interface SavePaypointBuilderPayload {
  presetId?: string;
  accent?: string;
  hero?: PaypointBuilderState['hero'];
  payment?: Partial<PaypointBuilderState['payment']>;
  gating?: Partial<PaypointBuilderState['gating']>;
  sections?: BuilderSection[];
  automation?: Array<{ id: string; enabled: boolean }>;
  stageProgress?: Array<{ id: string; complete: boolean }>;
}

export interface OrgPaypoint {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  amount: number;
  restriction: string;
  slug: string;
  link: string;
  status: 'draft' | 'published' | 'archived';
  totalCollected: number;
  unpaidMembers: number;
  createdAt: string;
  updatedAt: string;
  transactions: OrgPaypointTransaction[];
  fieldSchema?: BuilderField[];
  builderState?: PaypointBuilderState;
  builderSummary?: BuilderSummary;
}

export interface OrgPaypointsResponse {
  items: OrgPaypoint[];
}

export interface OrgOverview {
  organization: {
    id: string;
    name: string;
    category: string;
    status: string;
    totalRevenue: number;
    pendingApprovals: number;
    contactEmail: string;
    lastActivity: string;
  };
  stats: {
    totalCollected: number;
    activePaypoints: number;
    totalTransactions: number;
    unpaidMembers: number;
  };
  paypoints: Array<{
    id: string;
    title: string;
    amount: number;
    status: 'draft' | 'published' | 'archived';
    totalCollected: number;
    unpaidMembers: number;
    link: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    restriction: string;
    builderSummary?: BuilderSummary;
  }>;
  recentTransactions: Array<
    OrgPaypointTransaction & {
      paypointId: string;
      paypointTitle: string;
    }
  >;
  activity: ActivityEntry[];
  team: OrgTeamMember[];
}

export interface OrgTeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  addedAt: string;
  updatedAt?: string;
}

export interface OrgTeamResponse {
  items: OrgTeamMember[];
}

export interface OrgPaypointReport {
  summary: {
    totalCollected: number;
    totalTransactions: number;
    unpaidMembers: number;
  };
  transactions: OrgPaypointTransaction[];
  generatedAt: string;
}

export interface OrgPaypointDetail {
  paypoint: {
    id: string;
    title: string;
    amount: number;
    status: 'draft' | 'published' | 'archived';
    restriction: string;
    link: string;
    createdAt: string;
    updatedAt: string;
  };
  transactions: OrgPaypointTransaction[];
}

export interface PublicPaypointResponse {
  paypoint: {
    id: string;
    title: string;
    description: string;
    amount: number;
    restriction: string;
    link: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    totalCollected: number;
    unpaidMembers: number;
    updatedAt: string;
    createdAt: string;
    builder: PublicBuilderState | null;
  };
  organization: {
    id: string;
    name: string;
    category: string;
  } | null;
  stats: {
    totalCollected: number;
    unpaidMembers: number;
    transactions: number;
  };
  recentTransactions: OrgPaypointTransaction[];
  paymentMethods: string[];
}

export interface SubmitPaymentPayload {
  fullName?: string;
  studentId?: string;
  department?: string;
  yearGroup?: string;
  method: string;
  responses?: BuilderResponseValues;
}

export interface SubmitPaymentResponse {
  reference: string;
  amount: number;
  paypoint: {
    title: string;
    link: string;
  };
  method: string;
  processedAt: string;
}

export async function getAdminOverview(token: string): Promise<AdminOverview> {
  return request<AdminOverview>('/admin/overview', {
    method: 'GET',
    token,
  });
}

export async function getAdminOrganizations(token: string): Promise<OrganizationsResponse> {
  return request<OrganizationsResponse>('/admin/organizations', {
    method: 'GET',
    token,
  });
}

export async function createOrganization(
  token: string,
  payload: { name: string; category: string; contactEmail?: string }
): Promise<Organization> {
  return request<Organization>('/admin/organizations', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function approveOrganization(token: string, organizationId: string): Promise<Organization> {
  return request<Organization>(`/admin/organizations/${organizationId}/approve`, {
    method: 'POST',
    token,
  });
}

export async function suspendOrganization(token: string, organizationId: string): Promise<Organization> {
  return request<Organization>(`/admin/organizations/${organizationId}/suspend`, {
    method: 'POST',
    token,
  });
}

export async function reactivateOrganization(token: string, organizationId: string): Promise<Organization> {
  return request<Organization>(`/admin/organizations/${organizationId}/reactivate`, {
    method: 'POST',
    token,
  });
}

export async function getRefunds(token: string): Promise<RefundsResponse> {
  return request<RefundsResponse>('/admin/refunds', {
    method: 'GET',
    token,
  });
}

export async function resolveRefund(
  token: string,
  refundId: string,
  payload: { action: 'approve' | 'decline'; note?: string }
): Promise<RefundRequest> {
  return request<RefundRequest>(`/admin/refunds/${refundId}/resolve`, {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function getGateways(token: string): Promise<GatewaysResponse> {
  return request<GatewaysResponse>('/admin/gateways', {
    method: 'GET',
    token,
  });
}

export async function triggerGatewayFailover(token: string, gatewayId: string): Promise<GatewayProvider> {
  return request<GatewayProvider>(`/admin/gateways/${gatewayId}/failover`, {
    method: 'POST',
    token,
  });
}

export async function restoreGateway(token: string, gatewayId: string): Promise<GatewayProvider> {
  return request<GatewayProvider>(`/admin/gateways/${gatewayId}/restore`, {
    method: 'POST',
    token,
  });
}

export async function getPricingConfig(token: string): Promise<PricingConfig> {
  return request<PricingConfig>('/admin/settings/pricing', {
    method: 'GET',
    token,
  });
}

export async function updatePricingConfig(
  token: string,
  payload: { transactionFee: number; platformCommission: number }
): Promise<PricingConfig> {
  return request<PricingConfig>('/admin/settings/pricing', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function getAnnouncements(token: string): Promise<AnnouncementsResponse> {
  return request<AnnouncementsResponse>('/admin/announcements', {
    method: 'GET',
    token,
  });
}

export async function createAnnouncement(
  token: string,
  payload: { title: string; content: string; scheduledFor?: string }
): Promise<Announcement> {
  return request<Announcement>('/admin/announcements', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function getOrgOverview(token: string): Promise<OrgOverview> {
  return request<OrgOverview>('/org/overview', {
    method: 'GET',
    token,
  });
}

export async function getOrgPaypoints(token: string): Promise<OrgPaypointsResponse> {
  return request<OrgPaypointsResponse>('/org/paypoints', {
    method: 'GET',
    token,
  });
}

export async function createOrgPaypoint(
  token: string,
  payload: { title: string; description: string; amount: number; restriction?: string }
): Promise<OrgPaypoint> {
  return request<OrgPaypoint>('/org/paypoints', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateOrgPaypointStatus(
  token: string,
  paypointId: string,
  status: 'draft' | 'published' | 'archived'
): Promise<OrgPaypoint> {
  return request<OrgPaypoint>(`/org/paypoints/${paypointId}/status`, {
    method: 'POST',
    token,
    body: JSON.stringify({ status }),
  });
}

export async function getOrgPaypointTransactions(token: string, paypointId: string): Promise<OrgPaypointDetail> {
  return request<OrgPaypointDetail>(`/org/paypoints/${paypointId}/transactions`, {
    method: 'GET',
    token,
  });
}

export async function getOrgPaypointReport(token: string, paypointId: string): Promise<OrgPaypointReport> {
  return request<OrgPaypointReport>(`/org/paypoints/${paypointId}/report`, {
    method: 'GET',
    token,
  });
}

export async function getOrgTeam(token: string): Promise<OrgTeamResponse> {
  return request<OrgTeamResponse>('/org/team', {
    method: 'GET',
    token,
  });
}

export async function addOrgTeamMember(
  token: string,
  payload: { name: string; email: string; role: string; permissions?: string[] }
): Promise<OrgTeamMember> {
  return request<OrgTeamMember>('/org/team', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateOrgTeamMember(
  token: string,
  memberId: string,
  payload: { role?: string; permissions?: string[] }
): Promise<OrgTeamMember> {
  return request<OrgTeamMember>(`/org/team/${memberId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  });
}

export async function removeOrgTeamMember(token: string, memberId: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/org/team/${memberId}`, {
    method: 'DELETE',
    token,
  });
}

export async function getPaypointBuilderMetadata(token: string): Promise<BuilderMetadataResponse> {
  return request<BuilderMetadataResponse>('/org/paypoints/builder/metadata', {
    method: 'GET',
    token,
  });
}

export async function getPaypointBuilder(token: string, paypointId: string): Promise<PaypointBuilderResponse> {
  return request<PaypointBuilderResponse>(`/org/paypoints/${paypointId}/builder`, {
    method: 'GET',
    token,
  });
}

export async function savePaypointBuilder(
  token: string,
  paypointId: string,
  payload: SavePaypointBuilderPayload
): Promise<PaypointBuilderResponse> {
  return request<PaypointBuilderResponse>(`/org/paypoints/${paypointId}/builder`, {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function getPublicPaypoint(slug: string): Promise<PublicPaypointResponse> {
  return request<PublicPaypointResponse>(`/paypoint/${slug}`, {
    method: 'GET',
  });
}

export async function submitPaypointPayment(
  slug: string,
  payload: SubmitPaymentPayload
): Promise<SubmitPaymentResponse> {
  return request<SubmitPaymentResponse>(`/paypoint/${slug}/pay`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
