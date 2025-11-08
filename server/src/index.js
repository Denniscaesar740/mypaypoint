import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

dotenv.config();

const PORT = process.env.PORT || 4000;

const app = express();

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://localhost:4173', 'https://mypaypoint.onrender.com'];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || corsOrigins.includes(origin) || corsOrigins.includes('*')) {
        return callback(null, origin);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());

const users = [
  {
    id: '1',
    email: 'admin@paypoint.com',
    role: 'super-admin',
    name: 'ACSES Owner',
    passwordHash: bcrypt.hashSync('AdminPass123!', 10),
  },
  {
    id: '2',
    email: 'treasurer@engsociety.edu',
    role: 'organization-admin',
    name: 'Engineering Society Treasurer',
    passwordHash: bcrypt.hashSync('OrgAdmin2025!', 10),
  },
];

const sessions = new Map();
const analytics = {
  totalLogins: 0,
  failedLogins: 0,
  loginsByRole: new Map(),
};

let activityLog = [];

let organizations = [
  {
    id: 'org-1',
    name: 'Engineering Society',
    category: 'Academic',
    status: 'pending',
    totalRevenue: 182400,
    pendingApprovals: 12,
    contactEmail: 'engsociety@university.edu',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'org-2',
    name: 'Business School Association',
    category: 'Professional',
    status: 'active',
    totalRevenue: 161200,
    pendingApprovals: 4,
    contactEmail: 'bsa@university.edu',
    lastActivity: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: 'org-3',
    name: 'Medical Students Union',
    category: 'Academic',
    status: 'active',
    totalRevenue: 143950,
    pendingApprovals: 2,
    contactEmail: 'medunion@university.edu',
    lastActivity: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'org-4',
    name: 'Media & Communications Club',
    category: 'Creative',
    status: 'suspended',
    totalRevenue: 65400,
    pendingApprovals: 0,
    contactEmail: 'media.club@university.edu',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

let refunds = [
  {
    id: 'refund-1',
    organizationId: 'org-2',
    organizationName: 'Business School Association',
    memberName: 'Ama Boateng',
    amount: 450,
    reason: 'Duplicate payment detected',
    status: 'pending',
    submittedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'refund-2',
    organizationId: 'org-3',
    organizationName: 'Medical Students Union',
    memberName: 'Yaw Mensah',
    amount: 275,
    reason: 'Event cancellation',
    status: 'pending',
    submittedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'refund-3',
    organizationId: 'org-1',
    organizationName: 'Engineering Society',
    memberName: 'Efua Owusu',
    amount: 120,
    reason: 'Wrong department payment',
    status: 'approved',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    resolvedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

let gatewayProviders = [
  {
    id: 'gateway-1',
    name: 'Hubtel',
    status: 'healthy',
    uptime: 99.95,
    fallbackActive: false,
    lastIncident: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'gateway-2',
    name: 'Paystack',
    status: 'healthy',
    uptime: 99.87,
    fallbackActive: false,
    lastIncident: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'gateway-3',
    name: 'ExpressPay',
    status: 'degraded',
    uptime: 98.42,
    fallbackActive: true,
    lastIncident: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
];

let pricingConfig = {
  transactionFee: 2.5,
  platformCommission: 1.0,
  updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  updatedBy: 'ACSES Owner',
};

let announcements = [
  {
    id: 'announcement-1',
    title: 'Quarterly Pricing Update',
    content: 'Platform commission updated to 1.0% effective next week.',
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    status: 'scheduled',
  },
];

const userOrganizationMap = new Map([
  ['2', 'org-1'],
]);

const paymentMethods = ['mobile-money', 'card'];

const defaultFieldSchema = () => [
  {
    id: 'field-full-name',
    label: 'Full Name',
    type: 'text',
    required: true,
    helperText: 'Enter your name as it appears on your student ID',
  },
  {
    id: 'field-student-id',
    label: 'Student ID',
    type: 'text',
    required: true,
    helperText: 'e.g., UG1234567',
  },
  {
    id: 'field-department',
    label: 'Department',
    type: 'text',
    required: true,
    helperText: 'Provide your current department',
  },
  {
    id: 'field-year-group',
    label: 'Year Group',
    type: 'text',
    required: true,
    helperText: 'e.g., 2025',
  },
];

function cloneFieldSchema(schema) {
  return schema.map((field) => ({
    ...field,
    options: field.options ? [...field.options] : undefined,
  }));
}

const builderFieldLibrary = [
  {
    type: 'text',
    label: 'Short Text',
    description: 'Single-line responses for names, IDs, locations, and custom identifiers.',
    capabilities: ['required', 'placeholder', 'helperText', 'regex'],
    sampleValue: 'e.g., Ama Owusu',
  },
  {
    type: 'textarea',
    label: 'Paragraph',
    description: 'Multi-line responses for narratives like justification notes.',
    capabilities: ['required', 'helperText', 'charLimit'],
    sampleValue: 'Share any context we need to approve your exemption.',
  },
  {
    type: 'number',
    label: 'Number',
    description: 'For numeric inputs like ballot counts or donation top-ups.',
    capabilities: ['required', 'min', 'max'],
    sampleValue: '25',
  },
  {
    type: 'email',
    label: 'Email Address',
    description: 'Automatically validates email format for digital receipts.',
    capabilities: ['required', 'domainRestriction'],
    sampleValue: 'member@university.edu',
  },
  {
    type: 'phone',
    label: 'Phone / WhatsApp',
    description: 'Collects phone numbers in international format for MoMo confirmations.',
    capabilities: ['required', 'countryCode'],
    sampleValue: '+233 54 555 0101',
  },
  {
    type: 'select',
    label: 'Dropdown',
    description: 'Predefined options for programs, houses, ticket categories, etc.',
    capabilities: ['required', 'options'],
    sampleValue: 'Level 300',
    optionTemplate: [
      { id: 'option-a', label: 'Option A', value: 'A' },
      { id: 'option-b', label: 'Option B', value: 'B' },
    ],
  },
  {
    type: 'checkbox',
    label: 'Checkbox',
    description: 'Capture acknowledgements such as refund limitations.',
    capabilities: ['required'],
    sampleValue: 'I confirm my details are accurate.',
  },
];

const builderStageTemplates = [
  {
    id: 'context',
    title: 'Guardrails',
    description: 'Clarify who can pay, communication tone, and due-date expectations.',
    bullets: ['Eligibility & restriction note', 'Payment closing behavior', 'Owner acknowledgement'],
    defaultComplete: true,
  },
  {
    id: 'form',
    title: 'Form Schema',
    description: 'Decide on the data capture structure and validations members must satisfy.',
    bullets: ['Sections & ordering', 'Field validations', 'Default helper text'],
  },
  {
    id: 'automation',
    title: 'Automation',
    description: 'Confirm reminders, reconciliation cadence, and finance collaboration.',
    bullets: ['Reminder channels', 'Finance recipients', 'Reporting cadence'],
  },
  {
    id: 'preview',
    title: 'Preview & Publish',
    description: 'Ensure the payment page looks correct before members see it.',
    bullets: ['Branding review', 'Accessibility pass', 'Final hand-off'],
  },
];

const builderAutomationOptions = [
  {
    id: 'auto-reminders',
    label: 'Payment reminders',
    description: 'Email/SMS nudges every 3 days for members who have not paid.',
    defaultEnabled: true,
  },
  {
    id: 'auto-exports',
    label: 'Daily reconciliation export',
    description: 'Send a CSV digest to finance at 6AM daily.',
    defaultEnabled: true,
  },
  {
    id: 'auto-close',
    label: 'Auto-close on due date',
    description: 'Automatically pause collections after the due date.',
    defaultEnabled: false,
  },
];

const builderBlueprints = [
  {
    id: 'semester-dues',
    title: 'Semester Dues',
    description: 'Balanced for union or association dues that need strict verification.',
    accent: 'indigo',
    tags: ['Recurring', 'Verification-heavy'],
    sections: [
      {
        id: 'section-member-identity',
        title: 'Member Identity',
        description: 'Baseline details required for verification and receipting.',
        fields: defaultFieldSchema(),
      },
      {
        id: 'section-membership-meta',
        title: 'Membership Context',
        description: 'Capture additional tags that help treasurers reconcile faster.',
        fields: [
          {
            id: 'field-phone-number',
            label: 'WhatsApp Number',
            type: 'phone',
            required: true,
            helperText: 'Used to send payment confirmation and escalations.',
          },
          {
            id: 'field-program',
            label: 'Program of Study',
            type: 'text',
            required: false,
            helperText: 'Optional but helpful for reporting segments.',
          },
          {
            id: 'field-level',
            label: 'Level',
            type: 'select',
            required: true,
            options: [
              { id: 'level-100', label: 'Level 100', value: '100' },
              { id: 'level-200', label: 'Level 200', value: '200' },
              { id: 'level-300', label: 'Level 300', value: '300' },
              { id: 'level-400', label: 'Level 400', value: '400' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'event-ticketing',
    title: 'Event Ticketing',
    description: 'Designed for ticket sales where add-ons or merch options exist.',
    accent: 'rose',
    tags: ['Event', 'Tiered pricing'],
    sections: [
      {
        id: 'section-attendee',
        title: 'Attendee Details',
        description: 'Contact info for sending QR passes and receipts.',
        fields: [
          {
            id: 'field-attendee-name',
            label: 'Attendee Name',
            type: 'text',
            required: true,
            helperText: 'Name that should appear on your badge.',
          },
          {
            id: 'field-attendee-email',
            label: 'Email for Ticket',
            type: 'email',
            required: true,
            helperText: 'We will send a QR ticket to this email.',
          },
          {
            id: 'field-seat-type',
            label: 'Seat Type',
            type: 'select',
            required: true,
            options: [
              { id: 'seat-standard', label: 'Standard', value: 'standard' },
              { id: 'seat-premium', label: 'Premium', value: 'premium' },
              { id: 'seat-vip', label: 'VIP', value: 'vip' },
            ],
          },
        ],
      },
      {
        id: 'section-addons',
        title: 'Add-ons',
        description: 'Optional extras members might want to pre-pay.',
        fields: [
          {
            id: 'field-merch-pack',
            label: 'Merch Pack',
            type: 'checkbox',
            required: false,
            helperText: 'Limited edition hoodie + tote.',
          },
          {
            id: 'field-dietary',
            label: 'Dietary Notes',
            type: 'textarea',
            required: false,
            helperText: 'Share allergies for catering purposes.',
          },
        ],
      },
    ],
  },
];

function hydrateBlueprintSections(sections = []) {
  return sections.map((section) => ({
    ...section,
    fields: cloneFieldSchema(section.fields || []),
  }));
}

function buildStageProgress(overrides = []) {
  const overrideMap = new Map(overrides.map((stage) => [stage.id, stage]));
  return builderStageTemplates.map((stage, index) => {
    const override = overrideMap.get(stage.id);
    return {
      id: stage.id,
      title: stage.title,
      description: stage.description,
      bullets: stage.bullets,
      complete:
        typeof override?.complete === 'boolean'
          ? override.complete
          : stage.defaultComplete
          ? true
          : index === 0,
    };
  });
}

function createDefaultBuilderState({ paypoint, presetId, fieldSchema, accent, sections, stageProgress } = {}) {
  const blueprint =
    builderBlueprints.find((template) => template.id === presetId) || builderBlueprints[0] || null;

  const derivedSections = sections?.length
    ? hydrateBlueprintSections(sections)
    : fieldSchema?.length
    ? [
        {
          id: 'section-member-details',
          title: 'Member Details',
          description: 'Primary identifiers required before payment.',
          fields: cloneFieldSchema(fieldSchema),
        },
      ]
    : blueprint
    ? hydrateBlueprintSections(blueprint.sections)
    : [
        {
          id: 'section-member-details',
          title: 'Member Details',
          description: 'Primary identifiers required before payment.',
          fields: cloneFieldSchema(defaultFieldSchema()),
        },
      ];

  return {
    version: 1,
    presetId: blueprint?.id || presetId || 'custom',
    accent: accent || blueprint?.accent || 'indigo',
    hero: {
      heading: paypoint?.title || 'New PayPoint',
      subheading:
        paypoint?.description ||
        'Launch a branded payment page and collect the exact data finance teams expect.',
      primaryActionLabel: 'Continue to payment',
    },
    payment: {
      amount: paypoint?.amount ?? 0,
      allowCustomAmount: false,
      acceptedMethods: [...paymentMethods],
      dueDate: paypoint?.dueDate || null,
    },
    automation: builderAutomationOptions.map((option) => ({
      id: option.id,
      label: option.label,
      description: option.description,
      enabled: option.defaultEnabled,
    })),
    gating: {
      restriction: paypoint?.restriction || 'All members',
      requireStudentId: true,
      referenceField: 'field-student-id',
    },
    sections: derivedSections,
    stageProgress: buildStageProgress(stageProgress),
    updatedAt: new Date().toISOString(),
    updatedBy: paypoint?.updatedBy || 'system',
  };
}

function sanitizeBuilderSections(sections) {
  if (!Array.isArray(sections)) {
    return [];
  }

  return sections
    .map((section, sectionIndex) => {
      if (!section || typeof section !== 'object') {
        return null;
      }

      const fields = Array.isArray(section.fields)
        ? section.fields
            .map((field, fieldIndex) => {
              if (!field || typeof field !== 'object') {
                return null;
              }

              const id = field.id || `field-${sectionIndex}-${fieldIndex}-${Date.now()}`;
              const normalizedOptions = Array.isArray(field.options)
                ? field.options
                    .map((option, optionIndex) => {
                      if (!option || typeof option !== 'object') {
                        return null;
                      }
                      return {
                        id: option.id || `${id}-option-${optionIndex + 1}`,
                        label: option.label || `Option ${optionIndex + 1}`,
                        value: option.value ?? option.label ?? `value-${optionIndex + 1}`,
                      };
                    })
                    .filter(Boolean)
                : undefined;

              return {
                id,
                label: field.label || 'Untitled field',
                type: field.type || 'text',
                required: typeof field.required === 'boolean' ? field.required : false,
                helperText: field.helperText || '',
                placeholder: field.placeholder || '',
                width: field.width || 'full',
                options: normalizedOptions,
                validations: Array.isArray(field.validations) ? field.validations : undefined,
              };
            })
            .filter(Boolean)
        : [];

      return {
        id: section.id || `section-${sectionIndex + 1}`,
        title: section.title || 'Untitled section',
        description: section.description || '',
        fields,
      };
    })
    .filter(Boolean);
}

function summarizeBuilderState(state) {
  if (!state) {
    return {
      presetId: 'custom',
      progress: 0,
      sections: 0,
      lastEditedAt: null,
    };
  }

  const totalStages = state.stageProgress?.length || 0;
  const completedStages = state.stageProgress
    ? state.stageProgress.filter((stage) => stage.complete).length
    : 0;
  const progress = totalStages ? Math.round((completedStages / totalStages) * 100) : 0;

  return {
    presetId: state.presetId,
    accent: state.accent,
    sections: state.sections?.length || 0,
    lastEditedAt: state.updatedAt,
    progress,
  };
}

function seedPaypoint(data) {
  const { builderPresetId, builderSections, fieldSchema: providedSchema, ...rest } = data;
  const clonedFieldSchema = cloneFieldSchema(providedSchema || defaultFieldSchema());

  const paypoint = {
    ...rest,
    fieldSchema: clonedFieldSchema,
    transactions: data.transactions || [],
  };

  const relativeLink = paypoint.slug ? `/paypoint/${paypoint.slug}` : null;
  if (paypoint.link && paypoint.link.startsWith('http')) {
    paypoint.link = relativeLink || paypoint.link;
  } else if (!paypoint.link && relativeLink) {
    paypoint.link = relativeLink;
  }

  paypoint.builderState = createDefaultBuilderState({
    paypoint,
    fieldSchema: clonedFieldSchema,
    presetId: builderPresetId,
    sections: builderSections,
  });

  return paypoint;
}

function cloneBuilderSections(sections = []) {
  return sections.map((section) => ({
    ...section,
    fields: section.fields ? section.fields.map((field) => ({ ...field })) : [],
  }));
}

function toPublicBuilderPayload(builderState) {
  if (!builderState) {
    return null;
  }

  return {
    presetId: builderState.presetId,
    accent: builderState.accent,
    hero: { ...builderState.hero },
    payment: { ...builderState.payment },
    sections: cloneBuilderSections(builderState.sections),
    gating: { ...builderState.gating },
  };
}

function normalizeBuilderResponses(builderState, incoming = {}) {
  if (!builderState || !builderState.sections?.length) {
    return {
      responses: {},
      missing: [],
    };
  }

  const responses = {};
  const missing = [];

  builderState.sections.forEach((section) => {
    section.fields.forEach((field) => {
      const rawValue = incoming[field.id];
      let value = '';

      if (rawValue && typeof rawValue === 'object' && rawValue !== null && 'value' in rawValue) {
        value = String(rawValue.value ?? '');
      } else if (typeof rawValue === 'string' || typeof rawValue === 'number') {
        value = String(rawValue);
      } else {
        value = rawValue ? String(rawValue) : '';
      }

      if (field.required && !value.trim()) {
        missing.push(field.label);
      }

      responses[field.id] = {
        label: field.label,
        value,
      };
    });
  });

  return { responses, missing };
}

let paypoints = [
  seedPaypoint({
    id: 'pp-1',
    organizationId: 'org-1',
    title: 'Semester Dues 2025',
    description: 'Mandatory dues for all Engineering Society members for the 2024/2025 academic year.',
    amount: 150,
    restriction: 'All year groups',
    builderPresetId: 'semester-dues',
    slug: 'engineering-society/semester-dues-2025',
    link: '/paypoint/engineering-society/semester-dues-2025',
    status: 'published',
    totalCollected: 12600,
    unpaidMembers: 42,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    fieldSchema: defaultFieldSchema(),
    transactions: [
      {
        id: 'txn-1001',
        memberName: 'Kwesi Mensah',
        studentId: 'KNUST12345',
        department: 'Mechanical Engineering',
        yearGroup: '2025',
        amount: 150,
        status: 'paid',
        reference: 'PP1001',
        paidAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
        method: 'mobile-money',
        responses: {
          'field-full-name': { label: 'Full Name', value: 'Kwesi Mensah' },
          'field-student-id': { label: 'Student ID', value: 'KNUST12345' },
          'field-department': { label: 'Department', value: 'Mechanical Engineering' },
          'field-year-group': { label: 'Year Group', value: '2025' },
        },
      },
      {
        id: 'txn-1002',
        memberName: 'Akosua Sarpong',
        studentId: 'UG98765',
        department: 'Chemical Engineering',
        yearGroup: '2024',
        amount: 150,
        status: 'pending',
        reference: 'PP1002',
        paidAt: null,
        method: 'card',
        responses: {
          'field-full-name': { label: 'Full Name', value: 'Akosua Sarpong' },
          'field-student-id': { label: 'Student ID', value: 'UG98765' },
          'field-department': { label: 'Department', value: 'Chemical Engineering' },
          'field-year-group': { label: 'Year Group', value: '2024' },
        },
      },
      {
        id: 'txn-1003',
        memberName: 'Yaw Boateng',
        studentId: 'UG11223',
        department: 'Electrical Engineering',
        yearGroup: '2024',
        amount: 150,
        status: 'paid',
        reference: 'PP1003',
        paidAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        method: 'mobile-money',
        responses: {
          'field-full-name': { label: 'Full Name', value: 'Yaw Boateng' },
          'field-student-id': { label: 'Student ID', value: 'UG11223' },
          'field-department': { label: 'Department', value: 'Electrical Engineering' },
          'field-year-group': { label: 'Year Group', value: '2024' },
        },
      },
    ],
  }),
  seedPaypoint({
    id: 'pp-2',
    organizationId: 'org-1',
    title: 'Robotics Workshop Fee',
    description: 'Payment for the upcoming Robotics & AI weekend workshop.',
    amount: 250,
    restriction: 'Levels 200-400',
    builderPresetId: 'event-ticketing',
    slug: 'engineering-society/robotics-workshop',
    link: '/paypoint/engineering-society/robotics-workshop',
    status: 'draft',
    totalCollected: 2500,
    unpaidMembers: 18,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    fieldSchema: defaultFieldSchema(),
    transactions: [
      {
        id: 'txn-2001',
        memberName: 'Efua Bediako',
        studentId: 'KNUST11223',
        department: 'Computer Engineering',
        yearGroup: '2023',
        amount: 250,
        status: 'paid',
        reference: 'PP2001',
        paidAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        method: 'card',
        responses: {
          'field-full-name': { label: 'Full Name', value: 'Efua Bediako' },
          'field-student-id': { label: 'Student ID', value: 'KNUST11223' },
          'field-department': { label: 'Department', value: 'Computer Engineering' },
          'field-year-group': { label: 'Year Group', value: '2023' },
        },
      },
      {
        id: 'txn-2002',
        memberName: 'Kojo Owusu',
        studentId: 'UG55667',
        department: 'Mechanical Engineering',
        yearGroup: '2024',
        amount: 250,
        status: 'pending',
        reference: 'PP2002',
        paidAt: null,
        method: 'mobile-money',
        responses: {
          'field-full-name': { label: 'Full Name', value: 'Kojo Owusu' },
          'field-student-id': { label: 'Student ID', value: 'UG55667' },
          'field-department': { label: 'Department', value: 'Mechanical Engineering' },
          'field-year-group': { label: 'Year Group', value: '2024' },
        },
      },
    ],
  }),
];

let organizationTeams = {
  'org-1': [
    {
      id: 'team-1',
      name: 'Abena Mensah',
      email: 'abena.mensah@engsociety.edu',
      role: 'Assistant Treasurer',
      permissions: ['paypoints', 'reports', 'refunds'],
      addedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
    {
      id: 'team-2',
      name: 'Kofi Boadu',
      email: 'kofi.boadu@engsociety.edu',
      role: 'Communications Lead',
      permissions: ['announcements'],
      addedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    },
  ],
};

let organizationActivityLog = {
  'org-1': [
    {
      id: uuid(),
      type: 'paypoint.created',
      title: 'PayPoint drafted',
      description: 'Robotics Workshop Fee created by Engineering Society Treasurer.',
      actor: 'Engineering Society Treasurer',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: uuid(),
      type: 'team.added',
      title: 'Team member added',
      description: 'Abena Mensah invited as Assistant Treasurer.',
      actor: 'Engineering Society Treasurer',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ],
};
function addActivity(entry) {
  activityLog.unshift({
    id: uuid(),
    ...entry,
    timestamp: new Date().toISOString(),
  });

  if (activityLog.length > 50) {
    activityLog = activityLog.slice(0, 50);
  }
}

function addOrgActivity(organizationId, entry) {
  if (!organizationActivityLog[organizationId]) {
    organizationActivityLog[organizationId] = [];
  }

  organizationActivityLog[organizationId].unshift({
    id: uuid(),
    ...entry,
    timestamp: new Date().toISOString(),
  });

  if (organizationActivityLog[organizationId].length > 50) {
    organizationActivityLog[organizationId] = organizationActivityLog[organizationId].slice(0, 50);
  }
}

function getOrganizationIdForUser(userId) {
  return userOrganizationMap.get(userId) || null;
}

function findOrganizationById(id) {
  return organizations.find((org) => org.id === id) || null;
}

function findPaypointBySlug(slug) {
  return paypoints.find((paypoint) => paypoint.slug === slug) || null;
}

function recalcPaypointMetrics(paypoint) {
  const paidTransactions = paypoint.transactions.filter((transaction) => transaction.status === 'paid');
  paypoint.totalCollected = paidTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  paypoint.unpaidMembers = paypoint.transactions.filter((transaction) => transaction.status !== 'paid').length;
}

function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function createSession(user) {
  const token = uuid();
  const session = {
    user,
    createdAt: new Date().toISOString(),
  };

  sessions.set(token, session);

  analytics.totalLogins += 1;
  analytics.loginsByRole.set(user.role, (analytics.loginsByRole.get(user.role) || 0) + 1);

  return { token, session };
}

function destroySession(token) {
  sessions.delete(token);
}

function getSession(token) {
  if (!token) {
    return null;
  }

  return sessions.get(token) || null;
}

function recordFailedLogin() {
  analytics.failedLogins += 1;
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    recordFailedLogin();
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = users.find((candidate) => candidate.email.toLowerCase() === String(email).toLowerCase());

  if (!user) {
    recordFailedLogin();
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    recordFailedLogin();
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  try {
    const safeUser = sanitizeUser(user);
    const { token, session } = createSession(safeUser);

    res.json({
      token,
      user: session.user,
      expiresIn: 60 * 60 * 24,
    });
  } catch (error) {
    console.error('[auth/login] session failure:', error);
    res.status(500).json({ message: 'Unable to create session. Please try again.' });
  }
});

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: 'Missing authorization header.' });
  }

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Invalid authorization header.' });
  }

  try {
    const session = getSession(token);
    if (!session) {
      return res.status(401).json({ message: 'Session expired. Please sign in again.' });
    }

    req.session = session;
    req.token = token;
    return next();
  } catch (error) {
    console.error('[authMiddleware] failed to resolve session:', error);
    return res.status(500).json({ message: 'Unable to validate session.' });
  }
}

function requireSuperAdmin(req, res, next) {
  if (req.session.user.role !== 'super-admin') {
    return res.status(403).json({ message: 'Super Admin privileges required.' });
  }
  return next();
}

function requireOrgAdmin(req, res, next) {
  if (req.session.user.role !== 'organization-admin') {
    return res.status(403).json({ message: 'Organization Admin privileges required.' });
  }
  return next();
}

app.post('/auth/logout', authMiddleware, (req, res) => {
  try {
    destroySession(req.token);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Unable to logout.' });
  }
});

app.get('/auth/validate', authMiddleware, (req, res) => {
  res.json({
    user: req.session.user,
    issuedAt: req.session.createdAt,
  });
});

app.get('/admin/overview', authMiddleware, requireSuperAdmin, (_req, res) => {
  const totalRevenue = organizations.reduce((sum, org) => sum + org.totalRevenue, 0);
  const activeOrganizations = organizations.filter((org) => org.status === 'active').length;
  const pendingOrganizations = organizations.filter((org) => org.status === 'pending').length;
  const suspendedOrganizations = organizations.filter((org) => org.status === 'suspended').length;
  const openRefunds = refunds.filter((refund) => refund.status === 'pending').length;
  const degradedGateways = gatewayProviders.filter((gateway) => gateway.status !== 'healthy').length;
  const avgGatewayHealth =
    gatewayProviders.length > 0
      ? gatewayProviders.reduce((sum, gateway) => sum + gateway.uptime, 0) / gatewayProviders.length
      : 0;

  res.json({
    stats: {
      totalRevenue,
      activeOrganizations,
      openRefunds,
      gatewayHealth: Number(avgGatewayHealth.toFixed(2)),
      suspendedOrganizations,
      pendingOrganizations,
    },
    metrics: [
      {
        title: 'Revenue',
        value: totalRevenue,
        changeLabel: '+18.4% vs last month',
      },
      {
        title: 'Refund Rate',
        value: refunds.length === 0 ? 0 : Number(((openRefunds / refunds.length) * 100).toFixed(2)),
        changeLabel: '-0.4% improvement',
      },
      {
        title: 'Active PayPoints',
        value: 326,
        changeLabel: '+42 new launches',
      },
    ],
    topOrganizations: organizations
      .filter((org) => org.status === 'active')
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5),
    activity: activityLog.slice(0, 8),
    checklist: [
      {
        id: 'checklist-1',
        label: `Review ${pendingOrganizations} pending organization approvals`,
        complete: pendingOrganizations === 0,
      },
      {
        id: 'checklist-2',
        label: `Resolve ${openRefunds} refund requests approaching SLA`,
        complete: openRefunds === 0,
      },
      {
        id: 'checklist-3',
        label: 'Publish quarterly pricing updates to landing page',
        complete: false,
      },
      {
        id: 'checklist-4',
        label: `Audit ${degradedGateways} gateway failover alerts`,
        complete: degradedGateways === 0,
      },
    ],
  });
});

app.get('/admin/organizations', authMiddleware, requireSuperAdmin, (_req, res) => {
  res.json({
    items: organizations,
    summary: {
      total: organizations.length,
      active: organizations.filter((org) => org.status === 'active').length,
      pending: organizations.filter((org) => org.status === 'pending').length,
      suspended: organizations.filter((org) => org.status === 'suspended').length,
    },
  });
});

app.post('/admin/organizations', authMiddleware, requireSuperAdmin, (req, res) => {
  const { name, category, contactEmail } = req.body || {};

  if (!name || !category) {
    return res.status(400).json({ message: 'Organization name and category are required.' });
  }

  const newOrganization = {
    id: uuid(),
    name,
    category,
    status: 'pending',
    totalRevenue: 0,
    pendingApprovals: 0,
    contactEmail: contactEmail || null,
    lastActivity: new Date().toISOString(),
  };

  organizations = [newOrganization, ...organizations];

  addActivity({
    type: 'organization.created',
    title: 'Organization registered',
    description: `${name} submitted for approval.`,
    actor: req.session.user.name,
  });

  res.status(201).json(newOrganization);
});

app.post('/admin/organizations/:id/approve', authMiddleware, requireSuperAdmin, (req, res) => {
  const organization = organizations.find((org) => org.id === req.params.id);

  if (!organization) {
    return res.status(404).json({ message: 'Organization not found.' });
  }

  organization.status = 'active';
  organization.lastActivity = new Date().toISOString();

  addActivity({
    type: 'organization.approved',
    title: 'Organization approved',
    description: `${organization.name} is now active on PayPoint.`,
    actor: req.session.user.name,
  });

  res.json(organization);
});

app.post('/admin/organizations/:id/suspend', authMiddleware, requireSuperAdmin, (req, res) => {
  const organization = organizations.find((org) => org.id === req.params.id);

  if (!organization) {
    return res.status(404).json({ message: 'Organization not found.' });
  }

  organization.status = 'suspended';
  organization.lastActivity = new Date().toISOString();

  addActivity({
    type: 'organization.suspended',
    title: 'Organization suspended',
    description: `${organization.name} access has been temporarily revoked.`,
    actor: req.session.user.name,
  });

  res.json(organization);
});

app.post('/admin/organizations/:id/reactivate', authMiddleware, requireSuperAdmin, (req, res) => {
  const organization = organizations.find((org) => org.id === req.params.id);

  if (!organization) {
    return res.status(404).json({ message: 'Organization not found.' });
  }

  organization.status = 'active';
  organization.lastActivity = new Date().toISOString();

  addActivity({
    type: 'organization.reactivated',
    title: 'Organization reactivated',
    description: `${organization.name} has been restored.`,
    actor: req.session.user.name,
  });

  res.json(organization);
});

app.get('/admin/refunds', authMiddleware, requireSuperAdmin, (_req, res) => {
  res.json({
    items: refunds,
  });
});

app.post('/admin/refunds/:id/resolve', authMiddleware, requireSuperAdmin, (req, res) => {
  const { action, note } = req.body || {};
  const refund = refunds.find((item) => item.id === req.params.id);

  if (!refund) {
    return res.status(404).json({ message: 'Refund request not found.' });
  }

  if (!['approve', 'decline'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action. Use approve or decline.' });
  }

  refund.status = action === 'approve' ? 'approved' : 'declined';
  refund.resolvedAt = new Date().toISOString();
  refund.resolutionNote = note || null;

  addActivity({
    type: `refund.${refund.status}`,
    title: `Refund ${refund.status}`,
    description: `${refund.memberName}'s request (${refund.amount} GHS) ${refund.status} for ${refund.organizationName}.`,
    actor: req.session.user.name,
  });

  res.json(refund);
});

app.get('/admin/gateways', authMiddleware, requireSuperAdmin, (_req, res) => {
  res.json({
    items: gatewayProviders,
  });
});

app.post('/admin/gateways/:id/failover', authMiddleware, requireSuperAdmin, (req, res) => {
  const gateway = gatewayProviders.find((item) => item.id === req.params.id);

  if (!gateway) {
    return res.status(404).json({ message: 'Gateway not found.' });
  }

  gateway.status = 'degraded';
  gateway.fallbackActive = true;
  gateway.lastIncident = new Date().toISOString();

  addActivity({
    type: 'gateway.failover',
    title: 'Gateway failover triggered',
    description: `${gateway.name} routed to fallback.`,
    actor: req.session.user.name,
  });

  res.json(gateway);
});

app.post('/admin/gateways/:id/restore', authMiddleware, requireSuperAdmin, (req, res) => {
  const gateway = gatewayProviders.find((item) => item.id === req.params.id);

  if (!gateway) {
    return res.status(404).json({ message: 'Gateway not found.' });
  }

  gateway.status = 'healthy';
  gateway.fallbackActive = false;
  gateway.lastIncident = new Date().toISOString();

  addActivity({
    type: 'gateway.restore',
    title: 'Gateway restored',
    description: `${gateway.name} is operating normally.`,
    actor: req.session.user.name,
  });

  res.json(gateway);
});

app.get('/admin/settings/pricing', authMiddleware, requireSuperAdmin, (_req, res) => {
  res.json(pricingConfig);
});

app.post('/admin/settings/pricing', authMiddleware, requireSuperAdmin, (req, res) => {
  const { transactionFee, platformCommission } = req.body || {};

  if (typeof transactionFee !== 'number' || typeof platformCommission !== 'number') {
    return res.status(400).json({ message: 'transactionFee and platformCommission must be numeric.' });
  }

  pricingConfig = {
    transactionFee,
    platformCommission,
    updatedAt: new Date().toISOString(),
    updatedBy: req.session.user.name,
  };

  addActivity({
    type: 'pricing.updated',
    title: 'Pricing updated',
    description: `Transaction fee set to ${transactionFee}% and platform commission ${platformCommission}%.`,
    actor: req.session.user.name,
  });

  res.json(pricingConfig);
});

app.get('/admin/announcements', authMiddleware, requireSuperAdmin, (_req, res) => {
  res.json({
    items: announcements,
  });
});

app.post('/admin/announcements', authMiddleware, requireSuperAdmin, (req, res) => {
  const { title, content, scheduledFor } = req.body || {};

  if (!title || !content) {
    return res.status(400).json({ message: 'Announcement title and content are required.' });
  }

  const announcement = {
    id: uuid(),
    title,
    content,
    scheduledFor: scheduledFor || new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    status: scheduledFor ? 'scheduled' : 'published',
  };

  announcements = [announcement, ...announcements];

  addActivity({
    type: 'announcement.created',
    title: 'Announcement scheduled',
    description: `${title} scheduled for publication.`,
    actor: req.session.user.name,
  });

  res.status(201).json(announcement);
});

app.get('/org/overview', authMiddleware, requireOrgAdmin, (req, res) => {
  const organizationId = getOrganizationIdForUser(req.session.user.id);
  if (!organizationId) {
    return res.status(404).json({ message: 'Organization not assigned to this user.' });
  }

  const organization = organizations.find((org) => org.id === organizationId);
  if (!organization) {
    return res.status(404).json({ message: 'Organization not found.' });
  }

  const orgPaypoints = paypoints.filter((paypoint) => paypoint.organizationId === organizationId);
  const totalCollected = orgPaypoints.reduce((sum, paypoint) => sum + (paypoint.totalCollected || 0), 0);
  const unpaidMembers = orgPaypoints.reduce((sum, paypoint) => sum + (paypoint.unpaidMembers || 0), 0);
  const totalTransactions = orgPaypoints.reduce((sum, paypoint) => sum + paypoint.transactions.length, 0);
  const recentTransactions = orgPaypoints
    .flatMap((paypoint) =>
      paypoint.transactions.map((transaction) => ({
        ...transaction,
        paypointId: paypoint.id,
        paypointTitle: paypoint.title,
      }))
    )
    .sort((a, b) => {
      const aTime = a.paidAt ? new Date(a.paidAt).getTime() : 0;
      const bTime = b.paidAt ? new Date(b.paidAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 10);

  res.json({
    organization,
    stats: {
      totalCollected,
      activePaypoints: orgPaypoints.filter((paypoint) => paypoint.status === 'published').length,
      totalTransactions,
      unpaidMembers,
    },
    paypoints: orgPaypoints.map((paypoint) => ({
      id: paypoint.id,
      title: paypoint.title,
      amount: paypoint.amount,
      status: paypoint.status,
      totalCollected: paypoint.totalCollected,
      unpaidMembers: paypoint.unpaidMembers,
      link: paypoint.link,
      slug: paypoint.slug,
      createdAt: paypoint.createdAt,
      updatedAt: paypoint.updatedAt,
      restriction: paypoint.restriction,
      builderSummary: summarizeBuilderState(paypoint.builderState),
    })),
    recentTransactions,
    activity: organizationActivityLog[organizationId] || [],
    team: organizationTeams[organizationId] || [],
  });
});

app.get('/org/paypoints', authMiddleware, requireOrgAdmin, (req, res) => {
  const organizationId = getOrganizationIdForUser(req.session.user.id);
  if (!organizationId) {
    return res.status(404).json({ message: 'Organization not assigned to this user.' });
  }

  const orgPaypoints = paypoints.filter((paypoint) => paypoint.organizationId === organizationId);
  res.json({
    items: orgPaypoints,
  });
});

app.get('/org/paypoints/builder/metadata', authMiddleware, requireOrgAdmin, (_req, res) => {
  res.json({
    fieldLibrary: builderFieldLibrary.map((field) => ({
      ...field,
      optionTemplate: field.optionTemplate
        ? field.optionTemplate.map((option) => ({ ...option }))
        : undefined,
    })),
    stageTemplates: builderStageTemplates,
    blueprints: builderBlueprints.map((blueprint) => ({
      ...blueprint,
      sections: hydrateBlueprintSections(blueprint.sections),
    })),
    automationOptions: builderAutomationOptions.map((option) => ({ ...option })),
  });
});

app.get('/org/paypoints/:id/builder', authMiddleware, requireOrgAdmin, (req, res) => {
  const organizationId = getOrganizationIdForUser(req.session.user.id);
  if (!organizationId) {
    return res.status(404).json({ message: 'Organization not assigned to this user.' });
  }

  const paypoint = paypoints.find((item) => item.id === req.params.id && item.organizationId === organizationId);
  if (!paypoint) {
    return res.status(404).json({ message: 'PayPoint not found.' });
  }

  if (!paypoint.builderState) {
    paypoint.builderState = createDefaultBuilderState({
      paypoint,
      fieldSchema: paypoint.fieldSchema,
    });
  }

  res.json({
    paypoint: {
      id: paypoint.id,
      title: paypoint.title,
      status: paypoint.status,
      amount: paypoint.amount,
      restriction: paypoint.restriction,
      description: paypoint.description,
      link: paypoint.link,
      slug: paypoint.slug,
      updatedAt: paypoint.updatedAt,
      builderSummary: summarizeBuilderState(paypoint.builderState),
    },
    builder: paypoint.builderState,
  });
});

app.post('/org/paypoints/:id/builder', authMiddleware, requireOrgAdmin, (req, res) => {
  const organizationId = getOrganizationIdForUser(req.session.user.id);
  if (!organizationId) {
    return res.status(404).json({ message: 'Organization not assigned to this user.' });
  }

  const paypoint = paypoints.find((item) => item.id === req.params.id && item.organizationId === organizationId);
  if (!paypoint) {
    return res.status(404).json({ message: 'PayPoint not found.' });
  }

  if (!paypoint.builderState) {
    paypoint.builderState = createDefaultBuilderState({
      paypoint,
      fieldSchema: paypoint.fieldSchema,
    });
  }

  const payload = req.body || {};
  const incomingSections = Array.isArray(payload.sections) ? payload.sections : paypoint.builderState.sections;
  const sanitizedSections = sanitizeBuilderSections(incomingSections);

  if (sanitizedSections.length === 0 || sanitizedSections.every((section) => section.fields.length === 0)) {
    return res.status(400).json({ message: 'At least one section with one field is required.' });
  }

  const normalizedAutomation = Array.isArray(payload.automation)
    ? builderAutomationOptions.map((option) => {
        const match = payload.automation.find((item) => item?.id === option.id);
        return {
          id: option.id,
          label: option.label,
          description: option.description,
          enabled: typeof match?.enabled === 'boolean' ? match.enabled : option.defaultEnabled,
        };
      })
    : paypoint.builderState.automation || builderAutomationOptions.map((option) => ({
        id: option.id,
        label: option.label,
        description: option.description,
        enabled: option.defaultEnabled,
      }));

  const normalizedStageProgress = Array.isArray(payload.stageProgress)
    ? buildStageProgress(payload.stageProgress)
    : paypoint.builderState.stageProgress;

  const normalizedPayment = (() => {
    if (!payload.payment) {
      return paypoint.builderState.payment;
    }
    const merged = {
      ...paypoint.builderState.payment,
      ...payload.payment,
    };
    if (Array.isArray(payload.payment.acceptedMethods)) {
      const filtered = payload.payment.acceptedMethods.filter((method) => paymentMethods.includes(method));
      merged.acceptedMethods = filtered.length > 0 ? filtered : [...paymentMethods];
    }
    merged.amount =
      typeof merged.amount === 'number' && !Number.isNaN(merged.amount)
        ? merged.amount
        : paypoint.builderState.payment.amount;
    return merged;
  })();

  const normalizedGating = payload.gating
    ? {
        ...paypoint.builderState.gating,
        ...payload.gating,
      }
    : paypoint.builderState.gating;

  paypoint.builderState = {
    ...paypoint.builderState,
    presetId: payload.presetId || paypoint.builderState.presetId,
    accent: payload.accent || paypoint.builderState.accent,
    hero: payload.hero ? { ...paypoint.builderState.hero, ...payload.hero } : paypoint.builderState.hero,
    payment: normalizedPayment,
    gating: normalizedGating,
    sections: sanitizedSections,
    automation: normalizedAutomation,
    stageProgress: normalizedStageProgress,
    updatedAt: new Date().toISOString(),
    updatedBy: req.session.user.name,
  };

  paypoint.fieldSchema = sanitizedSections.flatMap((section) => section.fields);
  paypoint.amount = paypoint.builderState.payment.amount;
  paypoint.restriction = paypoint.builderState.gating.restriction;
  paypoint.updatedAt = paypoint.builderState.updatedAt;

  addOrgActivity(organizationId, {
    type: 'paypoint.builder.updated',
    title: 'PayPoint builder updated',
    description: `${paypoint.title} schema refined by ${req.session.user.name}.`,
    actor: req.session.user.name,
  });

  res.json({
    paypoint: {
      id: paypoint.id,
      title: paypoint.title,
      status: paypoint.status,
      amount: paypoint.amount,
      restriction: paypoint.restriction,
      link: paypoint.link,
      updatedAt: paypoint.updatedAt,
      builderSummary: summarizeBuilderState(paypoint.builderState),
    },
    builder: paypoint.builderState,
  });
});

function generatePaypointSlug(base, existingSlugs) {
  let slug = base;
  let counter = 1;
  while (existingSlugs.has(slug)) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

app.post('/org/paypoints', authMiddleware, requireOrgAdmin, (req, res) => {
  const organizationId = getOrganizationIdForUser(req.session.user.id);
  if (!organizationId) {
    return res.status(404).json({ message: 'Organization not assigned to this user.' });
  }

  const { title, description, amount, restriction } = req.body || {};
  if (!title || !description || typeof amount !== 'number') {
    return res.status(400).json({ message: 'Title, description, and numeric amount are required.' });
  }

  const organization = organizations.find((org) => org.id === organizationId);
  if (!organization) {
    return res.status(404).json({ message: 'Organization not found.' });
  }

  const baseSlug = `${slugify(organization.name)}/${slugify(title)}`;
  const existingSlugs = new Set(paypoints.map((paypoint) => paypoint.slug));
  const uniqueSlug = generatePaypointSlug(baseSlug, existingSlugs);

  const newPaypoint = seedPaypoint({
    id: uuid(),
    organizationId,
    title: title.trim(),
    description: description.trim(),
    amount,
    restriction: restriction || 'All members',
    builderPresetId: req.body?.builderPresetId,
    slug: uniqueSlug,
    link: `/paypoint/${uniqueSlug}`,
    status: 'draft',
    totalCollected: 0,
    unpaidMembers: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    transactions: [],
  });

  paypoints = [newPaypoint, ...paypoints];

  addOrgActivity(organizationId, {
    type: 'paypoint.created',
    title: 'PayPoint created',
    description: `${title} was created and saved as draft.`,
    actor: req.session.user.name,
  });

  organization.lastActivity = newPaypoint.createdAt;

  res.status(201).json(newPaypoint);
});

app.post('/org/paypoints/:id/status', authMiddleware, requireOrgAdmin, (req, res) => {
  const organizationId = getOrganizationIdForUser(req.session.user.id);
  if (!organizationId) {
    return res.status(404).json({ message: 'Organization not assigned to this user.' });
  }

  const { status } = req.body || {};
  if (!['draft', 'published', 'archived'].includes(status)) {
    return res.status(400).json({ message: 'Status must be draft, published, or archived.' });
  }

  const paypoint = paypoints.find((item) => item.id === req.params.id && item.organizationId === organizationId);
  if (!paypoint) {
    return res.status(404).json({ message: 'PayPoint not found.' });
  }

  paypoint.status = status;
  paypoint.updatedAt = new Date().toISOString();

  addOrgActivity(organizationId, {
    type: `paypoint.${status}`,
    title: `PayPoint ${status}`,
    description: `${paypoint.title} status updated to ${status}.`,
    actor: req.session.user.name,
  });

  res.json(paypoint);
});

app.get('/org/paypoints/:id/transactions', authMiddleware, requireOrgAdmin, (req, res) => {
  const organizationId = getOrganizationIdForUser(req.session.user.id);
  if (!organizationId) {
    return res.status(404).json({ message: 'Organization not assigned to this user.' });
  }

  const paypoint = paypoints.find((item) => item.id === req.params.id && item.organizationId === organizationId);
  if (!paypoint) {
    return res.status(404).json({ message: 'PayPoint not found.' });
  }

  res.json({
    paypoint: {
      id: paypoint.id,
      title: paypoint.title,
      amount: paypoint.amount,
      status: paypoint.status,
      restriction: paypoint.restriction,
      link: paypoint.link,
    },
    transactions: paypoint.transactions,
  });
});

app.get('/org/paypoints/:id/report', authMiddleware, requireOrgAdmin, (req, res) => {
  const organizationId = getOrganizationIdForUser(req.session.user.id);
  if (!organizationId) {
    return res.status(404).json({ message: 'Organization not assigned to this user.' });
  }

  const paypoint = paypoints.find((item) => item.id === req.params.id && item.organizationId === organizationId);
  if (!paypoint) {
    return res.status(404).json({ message: 'PayPoint not found.' });
  }

  const paidTransactions = paypoint.transactions.filter((transaction) => transaction.status === 'paid');
  const pendingTransactions = paypoint.transactions.filter((transaction) => transaction.status !== 'paid');

  res.json({
    summary: {
      totalCollected: paidTransactions.reduce((sum, transaction) => sum + transaction.amount, 0),
      totalTransactions: paypoint.transactions.length,
      unpaidMembers: pendingTransactions.length,
    },
    transactions: paypoint.transactions,
    generatedAt: new Date().toISOString(),
  });
});

app.get('/org/team', authMiddleware, requireOrgAdmin, (req, res) => {
  const organizationId = getOrganizationIdForUser(req.session.user.id);
  if (!organizationId) {
    return res.status(404).json({ message: 'Organization not assigned to this user.' });
  }

  res.json({
    items: organizationTeams[organizationId] || [],
  });
});

app.post('/org/team', authMiddleware, requireOrgAdmin, (req, res) => {
  const organizationId = getOrganizationIdForUser(req.session.user.id);
  if (!organizationId) {
    return res.status(404).json({ message: 'Organization not assigned to this user.' });
  }

  const { name, email, role, permissions } = req.body || {};
  if (!name || !email || !role) {
    return res.status(400).json({ message: 'Name, email, and role are required.' });
  }

  const teamMember = {
    id: uuid(),
    name,
    email,
    role,
    permissions: Array.isArray(permissions) ? permissions : [],
    addedAt: new Date().toISOString(),
  };

  if (!organizationTeams[organizationId]) {
    organizationTeams[organizationId] = [];
  }
  organizationTeams[organizationId] = [teamMember, ...organizationTeams[organizationId]];

  addOrgActivity(organizationId, {
    type: 'team.added',
    title: 'Team member added',
    description: `${name} joined as ${role}.`,
    actor: req.session.user.name,
  });

  res.status(201).json(teamMember);
});

app.patch('/org/team/:id', authMiddleware, requireOrgAdmin, (req, res) => {
  const organizationId = getOrganizationIdForUser(req.session.user.id);
  if (!organizationId) {
    return res.status(404).json({ message: 'Organization not assigned to this user.' });
  }

  const team = organizationTeams[organizationId] || [];
  const member = team.find((item) => item.id === req.params.id);
  if (!member) {
    return res.status(404).json({ message: 'Team member not found.' });
  }

  const { role, permissions } = req.body || {};
  if (role) {
    member.role = role;
  }
  if (permissions) {
    member.permissions = Array.isArray(permissions) ? permissions : member.permissions;
  }
  member.updatedAt = new Date().toISOString();

  addOrgActivity(organizationId, {
    type: 'team.updated',
    title: 'Team member updated',
    description: `${member.name}'s role or permissions were updated.`,
    actor: req.session.user.name,
  });

  res.json(member);
});

app.delete('/org/team/:id', authMiddleware, requireOrgAdmin, (req, res) => {
  const organizationId = getOrganizationIdForUser(req.session.user.id);
  if (!organizationId) {
    return res.status(404).json({ message: 'Organization not assigned to this user.' });
  }

  const team = organizationTeams[organizationId] || [];
  const memberIndex = team.findIndex((item) => item.id === req.params.id);
  if (memberIndex === -1) {
    return res.status(404).json({ message: 'Team member not found.' });
  }

  const [removedMember] = team.splice(memberIndex, 1);
  organizationTeams[organizationId] = team;

  addOrgActivity(organizationId, {
    type: 'team.removed',
    title: 'Team member removed',
    description: `${removedMember.name} was removed from the team.`,
    actor: req.session.user.name,
  });

  res.json({ success: true });
});

app.get('/paypoint/*', (req, res) => {
  const slug = req.params[0];
  const paypoint = findPaypointBySlug(slug);
  if (!paypoint) {
    return res.status(404).json({ message: 'PayPoint not found.' });
  }

  if (paypoint.status !== 'published') {
    return res.status(403).json({ message: 'This PayPoint is not currently accepting payments.' });
  }

  const organization = findOrganizationById(paypoint.organizationId);
  recalcPaypointMetrics(paypoint);

  const recentTransactions = paypoint.transactions
    .filter((transaction) => transaction.status === 'paid')
    .sort((a, b) => new Date(b.paidAt || 0) - new Date(a.paidAt || 0))
    .slice(0, 5);

  res.json({
    paypoint: {
      id: paypoint.id,
      title: paypoint.title,
      description: paypoint.description,
      amount: paypoint.amount,
      restriction: paypoint.restriction,
      link: paypoint.link,
      slug: paypoint.slug,
      status: paypoint.status,
      totalCollected: paypoint.totalCollected,
      unpaidMembers: paypoint.unpaidMembers,
      updatedAt: paypoint.updatedAt,
      createdAt: paypoint.createdAt,
      builder: toPublicBuilderPayload(paypoint.builderState),
    },
    organization: organization
      ? {
          id: organization.id,
          name: organization.name,
          category: organization.category,
        }
      : null,
    stats: {
      totalCollected: paypoint.totalCollected,
      unpaidMembers: paypoint.unpaidMembers,
      transactions: paypoint.transactions.length,
    },
    recentTransactions,
    paymentMethods,
  });
});

app.post('/paypoint/*/pay', (req, res) => {
  const slug = req.params[0];
  const paypoint = findPaypointBySlug(slug);
  if (!paypoint) {
    return res.status(404).json({ message: 'PayPoint not found.' });
  }

  if (paypoint.status !== 'published') {
    return res.status(403).json({ message: 'This PayPoint is not currently accepting payments.' });
  }

  const builderState = paypoint.builderState;
  const { fullName, studentId, department, yearGroup, method, responses: incomingResponses = {} } = req.body || {};

  if (!method) {
    return res.status(400).json({ message: 'Payment method is required.' });
  }

  if (!paymentMethods.includes(method)) {
    return res.status(400).json({ message: 'Unsupported payment method.' });
  }

  if ((!builderState || !builderState.sections?.length) && (!fullName || !studentId || !department || !yearGroup)) {
    return res.status(400).json({
      message: 'Full name, student ID, department, and year group are required for this PayPoint.',
    });
  }

  let normalizedResponses = {};
  if (builderState && builderState.sections?.length) {
    const { responses, missing } = normalizeBuilderResponses(builderState, incomingResponses);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}.` });
    }
    normalizedResponses = responses;
  } else if (incomingResponses && typeof incomingResponses === 'object') {
    normalizedResponses = incomingResponses;
  }

  const resolvedName =
    (normalizedResponses['field-full-name'] && normalizedResponses['field-full-name'].value?.trim()) || fullName?.trim();

  if (!resolvedName) {
    return res.status(400).json({ message: 'Full name is required to process this payment.' });
  }

  const resolvedStudentId =
    (normalizedResponses['field-student-id'] && normalizedResponses['field-student-id'].value?.trim()) ||
    studentId?.trim() ||
    null;
  const resolvedDepartment =
    (normalizedResponses['field-department'] && normalizedResponses['field-department'].value?.trim()) ||
    department?.trim() ||
    null;
  const resolvedYearGroup =
    (normalizedResponses['field-year-group'] && normalizedResponses['field-year-group'].value?.trim()) ||
    yearGroup?.trim() ||
    null;

  const reference = `PP-${paypoint.id}-${Date.now()}`;
  const transaction = {
    id: uuid(),
    memberName: resolvedName,
    studentId: resolvedStudentId,
    department: resolvedDepartment,
    yearGroup: resolvedYearGroup,
    amount: paypoint.amount,
    status: 'paid',
    reference,
    paidAt: new Date().toISOString(),
    method,
    responses: normalizedResponses,
  };

  paypoint.transactions.unshift(transaction);
  recalcPaypointMetrics(paypoint);
  paypoint.updatedAt = new Date().toISOString();

  const organization = findOrganizationById(paypoint.organizationId);
  if (organization) {
    organization.lastActivity = new Date().toISOString();
    addOrgActivity(organization.id, {
      type: 'payment.received',
      title: 'Payment received',
      description: `${resolvedName} paid ${paypoint.title}.`,
      actor: resolvedName,
    });
  }

  res.json({
    reference,
    amount: paypoint.amount,
    paypoint: {
      title: paypoint.title,
      link: paypoint.link,
    },
    method,
    processedAt: transaction.paidAt,
  });
});

app.get('/analytics/summary', authMiddleware, (_req, res) => {
  try {
    const loginsByRole = Array.from(analytics.loginsByRole.entries()).map(([role, count]) => ({
      role,
      count,
    }));

    res.json({
      totalLogins: analytics.totalLogins,
      failedLogins: analytics.failedLogins,
      loginsByRole,
      activeSessions: sessions.size,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[analytics/summary] failed:', error);
    res.status(500).json({ message: 'Unable to load analytics.' });
  }
});

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((error, _req, res, _next) => {
  console.error('[server] unhandled error:', error);
  res.status(500).json({ message: 'Unexpected server error.' });
});

app.listen(PORT, () => {
  console.log(`PayPoint API listening on port ${PORT}`);
});
