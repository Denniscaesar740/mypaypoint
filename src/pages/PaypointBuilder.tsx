import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  CheckCircle2,
  LayoutPanelLeft,
  Loader2,
  Palette,
  Plus,
  Save,
  Shield,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react';
import type {
  BuilderField,
  BuilderFieldTemplate,
  BuilderMetadataResponse,
  BuilderSection,
  PaypointBuilderResponse,
  PaypointBuilderState,
  SavePaypointBuilderPayload,
} from '../lib/api';
import { getPaypointBuilder, getPaypointBuilderMetadata, savePaypointBuilder } from '../lib/api';

type SessionInfo = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
};

const accentOptions = [
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-100', dot: 'bg-indigo-500' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-100', dot: 'bg-emerald-500' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-100', dot: 'bg-rose-500' },
  { id: 'sky', label: 'Sky', bg: 'bg-sky-100', dot: 'bg-sky-500' },
];

const paymentMethodOptions = [
  { id: 'mobile-money', label: 'Mobile Money' },
  { id: 'card', label: 'Card Payment' },
];

const currencyFormatter = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  minimumFractionDigits: 2,
});

const builderPanel = 'rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_55px_rgba(15,23,42,0.45)] backdrop-blur';
const builderSubPanel = 'rounded-2xl border border-white/10 bg-white/5 p-4';
const builderInput =
  'rounded-2xl border border-white/15 bg-slate-900/40 px-3 py-2 text-sm text-white placeholder:text-white/40 caret-white focus:border-indigo-400/70 focus:outline-none focus:ring-0';

const PaypointBuilder: React.FC = () => {
  const { paypointId } = useParams<{ paypointId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [metadata, setMetadata] = useState<BuilderMetadataResponse | null>(null);
  const [builderData, setBuilderData] = useState<PaypointBuilderResponse | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [previewForm, setPreviewForm] = useState<Record<string, string | boolean>>({});

  useEffect(() => {
    const stored = localStorage.getItem('paypoint.session');
    if (!stored) {
      toast.error('Please sign in to access the builder.');
      navigate('/login');
      return;
    }

    try {
      const parsed: SessionInfo = JSON.parse(stored);
      if (parsed.user.role !== 'organization-admin') {
        toast.error('Only organization admins can access the builder.');
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

  const loadBuilder = useCallback(async () => {
    if (!token || !paypointId) return;
    setIsLoading(true);
    try {
      const [meta, builder] = await Promise.all([
        getPaypointBuilderMetadata(token),
        getPaypointBuilder(token, paypointId),
      ]);
      setMetadata(meta);
      setBuilderData(builder);
      setSelectedSectionId(builder.builder.sections[0]?.id || null);
      setIsDirty(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load builder.');
      navigate('/org-admin');
    } finally {
      setIsLoading(false);
    }
  }, [token, paypointId, navigate]);

  useEffect(() => {
    loadBuilder();
  }, [loadBuilder]);

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
    setPreviewForm(defaults);
  }, [builderData]);

  const selectedSection = useMemo(() => {
    if (!builderData) return null;
    const section =
      builderData.builder.sections.find((item) => item.id === selectedSectionId) ||
      builderData.builder.sections[0] ||
      null;
    return section || null;
  }, [builderData, selectedSectionId]);

  const markDirty = () => setIsDirty(true);

  const updateBuilderState = (updater: (state: PaypointBuilderState) => PaypointBuilderState) => {
    setBuilderData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        builder: updater(prev.builder),
      };
    });
    markDirty();
  };

  const handleHeroChange = (key: keyof PaypointBuilderState['hero'], value: string) => {
    updateBuilderState((state) => ({
      ...state,
      hero: {
        ...state.hero,
        [key]: value,
      },
    }));
  };

  const handleGatingRestriction = (value: string) => {
    updateBuilderState((state) => ({
      ...state,
      gating: {
        ...state.gating,
        restriction: value,
      },
    }));
  };

  const handleAccentChange = (accent: string) => {
    updateBuilderState((state) => ({
      ...state,
      accent,
    }));
  };

  const handleToggleAutomation = (id: string) => {
    updateBuilderState((state) => ({
      ...state,
      automation: state.automation.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      ),
    }));
  };

  const handleToggleStage = (id: string) => {
    updateBuilderState((state) => ({
      ...state,
      stageProgress: state.stageProgress.map((stage) =>
        stage.id === id ? { ...stage, complete: !stage.complete } : stage
      ),
    }));
  };

  const handleAddSection = () => {
    if (!builderData) return;
    const newSection: BuilderSection = {
      id: `section-${Date.now()}`,
      title: `Section ${builderData.builder.sections.length + 1}`,
      description: 'Describe what data you need to collect here.',
      fields: [],
    };

    updateBuilderState((state) => ({
      ...state,
      sections: [...state.sections, newSection],
    }));
    setSelectedSectionId(newSection.id);
  };

  const handleRemoveSection = (sectionId: string) => {
    if (!builderData) return;
    if (builderData.builder.sections.length === 1) {
      toast.warn('Keep at least one section in your builder.');
      return;
    }

    updateBuilderState((state) => ({
      ...state,
      sections: state.sections.filter((section) => section.id !== sectionId),
    }));

    if (selectedSectionId === sectionId) {
      const fallback =
        builderData.builder.sections.find((section) => section.id !== sectionId)?.id || null;
      setSelectedSectionId(fallback);
    }
  };

  const handleSectionDetails = (sectionId: string, updates: Partial<BuilderSection>) => {
    updateBuilderState((state) => ({
      ...state,
      sections: state.sections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section
      ),
    }));
  };

const handleFieldUpdate = (sectionId: string, fieldId: string, updates: Partial<BuilderField>) => {
    updateBuilderState((state) => ({
      ...state,
      sections: state.sections.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }
        return {
          ...section,
          fields: section.fields.map((field) =>
            field.id === fieldId ? { ...field, ...updates } : field
          ),
        };
      }),
    }));
  };

  const handleRemoveField = (sectionId: string, fieldId: string) => {
    updateBuilderState((state) => ({
      ...state,
      sections: state.sections.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }
        return {
          ...section,
          fields: section.fields.filter((field) => field.id !== fieldId),
        };
      }),
    }));
  };

  const handleAddField = (template: BuilderFieldTemplate) => {
    if (!selectedSection) {
      toast.info('Select a section before adding fields.');
      return;
    }

    const field: BuilderField = {
      id: `field-${template.type}-${Date.now()}`,
      label: template.label,
      type: template.type,
      required: true,
      helperText: template.description,
      placeholder: template.sampleValue,
      options: template.optionTemplate
        ? template.optionTemplate.map((option, index) => ({
            ...option,
            id: `${template.type}-option-${index}-${Date.now()}`,
          }))
        : undefined,
    };

    updateBuilderState((state) => ({
      ...state,
      sections: state.sections.map((section) => {
        if (section.id !== selectedSection.id) {
          return section;
        }
        return {
          ...section,
          fields: [...section.fields, field],
        };
      }),
    }));
  };

  const handleApplyBlueprint = (blueprintId: string) => {
    if (!metadata) return;
    const blueprint = metadata.blueprints.find((item) => item.id === blueprintId);
    if (!blueprint) return;

    updateBuilderState((state) => ({
      ...state,
      presetId: blueprint.id,
      accent: blueprint.accent,
      sections: blueprint.sections.map((section) => ({
        ...section,
        fields: section.fields.map((field) => ({ ...field })),
      })),
    }));
    setSelectedSectionId(blueprint.sections[0]?.id || null);
    toast.info(`Blueprint "${blueprint.title}" applied. Remember to save.`);
  };

  const openLivePreview = () => {
    if (!paypointId) return;
    navigate(`/org-admin/paypoints/${paypointId}/builder/live`);
  };

  const handlePreviewFieldChange = (field: BuilderField, value: string | boolean) => {
    setPreviewForm((prev) => ({
      ...prev,
      [field.id]: value,
    }));
  };

  const renderPreviewField = (field: BuilderField) => {
    const commonInputClasses =
      'mt-2 w-full rounded-2xl border border-white/15 bg-slate-900/40 px-3 py-2 text-sm text-white placeholder:text-white/40 caret-white focus:border-indigo-400/70 focus:outline-none focus:ring-0';

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={`preview-${field.id}`}
            value={(previewForm[field.id] as string) || ''}
            onChange={(event) => handlePreviewFieldChange(field, event.target.value)}
            placeholder={field.placeholder || ''}
            className={`${commonInputClasses} min-h-[96px]`}
          />
        );
      case 'select':
        return (
          <select
            id={`preview-${field.id}`}
            value={(previewForm[field.id] as string) || ''}
            onChange={(event) => handlePreviewFieldChange(field, event.target.value)}
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
          <label className="mt-2 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={Boolean(previewForm[field.id])}
              onChange={(event) => handlePreviewFieldChange(field, event.target.checked)}
              className="h-4 w-4 rounded border-white/40 text-indigo-300 focus:ring-indigo-400"
            />
            {field.helperText || 'I confirm the details above.'}
          </label>
        );
      default:
        return (
          <input
            id={`preview-${field.id}`}
            type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
            value={(previewForm[field.id] as string) || ''}
            onChange={(event) => handlePreviewFieldChange(field, event.target.value)}
            placeholder={field.placeholder || ''}
            className={commonInputClasses}
          />
        );
    }
  };

  const handleSaveBuilder = async () => {
    if (!token || !paypointId || !builderData) return;
    setIsSaving(true);
    try {
      const payload: SavePaypointBuilderPayload = {
        presetId: builderData.builder.presetId,
        accent: builderData.builder.accent,
        hero: builderData.builder.hero,
        payment: builderData.builder.payment,
        gating: builderData.builder.gating,
        sections: builderData.builder.sections,
        automation: builderData.builder.automation.map((item) => ({
          id: item.id,
          enabled: item.enabled,
        })),
        stageProgress: builderData.builder.stageProgress.map((stage) => ({
          id: stage.id,
          complete: stage.complete,
        })),
      };

      const response = await savePaypointBuilder(token, paypointId, payload);
      setBuilderData(response);
      setIsDirty(false);
      toast.success('Builder saved successfully.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save builder.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePaymentAmountChange = (value: string) => {
    const numeric = Number(value);
    updateBuilderState((state) => ({
      ...state,
      payment: {
        ...state.payment,
        amount: Number.isNaN(numeric) ? state.payment.amount : Math.max(0, numeric),
      },
    }));
  };

  const handlePaymentMethodToggle = (method: string) => {
    updateBuilderState((state) => {
      const hasMethod = state.payment.acceptedMethods.includes(method);
      const nextMethods = hasMethod
        ? state.payment.acceptedMethods.filter((item) => item !== method)
        : [...state.payment.acceptedMethods, method];
      return {
        ...state,
        payment: {
          ...state.payment,
          acceptedMethods: nextMethods.length === 0 ? state.payment.acceptedMethods : nextMethods,
        },
      };
    });
  };

  const handleDueDateChange = (value: string) => {
    updateBuilderState((state) => ({
      ...state,
      payment: {
        ...state.payment,
        dueDate: value || null,
      },
    }));
  };

  const handleAllowCustomAmountToggle = () => {
    updateBuilderState((state) => ({
      ...state,
      payment: {
        ...state.payment,
        allowCustomAmount: !state.payment.allowCustomAmount,
      },
    }));
  };

  if (isLoading || !builderData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-10 text-center shadow-[0_25px_55px_rgba(15,23,42,0.45)] backdrop-blur">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-indigo-300" />
          <p className="mt-3 text-sm font-medium text-white/70">Preparing your builder workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="paypoint-builder-shell relative min-h-screen bg-slate-950 pb-16 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,118,255,0.2),_transparent_60%)]" />
      <div className="relative">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/org-admin')}
          className="inline-flex items-center text-sm font-semibold text-white/70 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to dashboard
        </button>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div>
            <p className="text-sm uppercase tracking-wide text-white/60">Builder workspace</p>
            <h1 className="text-2xl font-semibold text-white">{builderData.paypoint.title}</h1>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              builderData.paypoint.status === 'published'
                ? 'bg-emerald-500/15 text-emerald-300'
                : builderData.paypoint.status === 'draft'
                ? 'bg-amber-500/15 text-amber-300'
                : 'bg-white/10 text-white'
            }`}
          >
            {builderData.paypoint.status}
          </span>
          <span className="text-sm text-white/60">
            Builder last updated {new Date(builderData.builder.updatedAt).toLocaleString()}
          </span>
          {isDirty && (
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-100">
              Unsaved changes
            </span>
          )}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[280px,1fr,340px]">
          <aside className="space-y-6">
            <div className={builderSubPanel}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Builder stages</h2>
                <Sparkles className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="mt-4 space-y-3">
                {builderData.builder.stageProgress.map((stage) => (
                  <button
                    key={stage.id}
                    onClick={() => handleToggleStage(stage.id)}
                    className={`w-full rounded-xl border px-3 py-2 text-left ${
                      stage.complete
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                        : 'border-white/15 text-white/70 hover:border-indigo-400/60 hover:bg-indigo-500/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className={`h-4 w-4 ${stage.complete ? 'text-emerald-300' : 'text-white/40'}`}
                      />
                      <p className="text-sm font-semibold">{stage.title}</p>
                    </div>
                    <p className="mt-1 text-xs leading-snug">{stage.description}</p>
                  </button>
                ))}
            </div>
          </div>

          <div className={builderPanel}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Payment settings</p>
                <h2 className="text-xl font-semibold text-white">Default amount & methods</h2>
              </div>
              <button
                onClick={openLivePreview}
                className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-indigo-400/60 hover:bg-indigo-500/10"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Open live builder form
              </button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-white/60">Default amount</label>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-900/40 px-3 py-2">
                  <span className="text-sm font-semibold text-white/60">GHS</span>
                  <input
                    type="number"
                    min={0}
                    value={builderData.builder.payment.amount}
                    onChange={(event) => handlePaymentAmountChange(event.target.value)}
                    className="w-full border-none text-sm font-semibold text-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-white/60">Due date</label>
                <input
                  type="date"
                  value={builderData.builder.payment.dueDate || ''}
                  onChange={(event) => handleDueDateChange(event.target.value)}
                  className={`mt-1 w-full ${builderInput}`}
                />
              </div>
              <label className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white/70">
                <input
                  type="checkbox"
                  checked={builderData.builder.payment.allowCustomAmount}
                  onChange={handleAllowCustomAmountToggle}
                  className="h-4 w-4 rounded border-white/40 text-indigo-300 focus:ring-indigo-400"
                />
                Allow members to enter custom amount
              </label>
            </div>
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Accepted methods</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {paymentMethodOptions.map((option) => {
                  const active = builderData.builder.payment.acceptedMethods.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => handlePaymentMethodToggle(option.id)}
                      className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
                        active
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-200'
                          : 'border-white/15 text-white/70 hover:border-indigo-400/60 hover:text-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

            <div className={builderSubPanel}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Automation</h2>
                <Wand2 className="h-4 w-4 text-amber-500" />
              </div>
              <div className="mt-4 space-y-4">
                {builderData.builder.automation.map((automation) => (
                  <label
                    key={automation.id}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:border-indigo-400/60"
                  >
                    <input
                      type="checkbox"
                      checked={automation.enabled}
                      onChange={() => handleToggleAutomation(automation.id)}
                      className="mt-1 h-4 w-4 rounded border-white/40 text-indigo-300 focus:ring-indigo-400"
                    />
                    <div>
                      <p className="text-sm font-semibold text-white/90">{automation.label}</p>
                      <p className="text-xs text-white/60">{automation.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className={builderSubPanel}>
              <h2 className="text-sm font-semibold text-white">Accent color</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {accentOptions.map((accent) => (
                  <button
                    key={accent.id}
                    onClick={() => handleAccentChange(accent.id)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-semibold ${
                      builderData.builder.accent === accent.id
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-200'
                        : 'border-white/15 text-white/70 hover:border-indigo-400/60 hover:text-white'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${accent.dot}`} />
                    {accent.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>
          <section className="space-y-6">
            <div className={builderPanel}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Hero & guardrails</p>
                  <h2 className="text-xl font-semibold text-white">Narrative + access control</h2>
                </div>
                <Palette className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-white/60">Hero headline</label>
                  <input
                    value={builderData.builder.hero.heading}
                    onChange={(event) => handleHeroChange('heading', event.target.value)}
                    className={`mt-1 w-full ${builderInput}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-white/60">Primary Action Label</label>
                  <input
                    value={builderData.builder.hero.primaryActionLabel}
                    onChange={(event) => handleHeroChange('primaryActionLabel', event.target.value)}
                    className={`mt-1 w-full ${builderInput}`}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-white/60">Subheading</label>
                  <textarea
                    value={builderData.builder.hero.subheading}
                    onChange={(event) => handleHeroChange('subheading', event.target.value)}
                    className={`mt-1 w-full ${builderInput}`}
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/60">
                    <Shield className="h-3.5 w-3.5" /> Restriction note
                  </label>
                  <textarea
                    value={builderData.builder.gating.restriction}
                    onChange={(event) => handleGatingRestriction(event.target.value)}
                    className={`mt-1 w-full ${builderInput}`}
                    rows={2}
                  />
                  <p className="mt-1 text-xs text-white/60">
                    Explain who can pay and what data will be reviewed before confirming payments.
                  </p>
                </div>
              </div>
            </div>

            <div className={builderPanel}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Sections</p>
                  <h2 className="text-xl font-semibold text-white">Order of data collection</h2>
                </div>
                <button
                  onClick={handleAddSection}
                  className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add section
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {builderData.builder.sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSectionId(section.id)}
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                      selectedSection && selectedSection.id === section.id
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-200'
                        : 'border-white/15 text-white/70 hover:border-indigo-400/60 hover:text-white'
                    }`}
                  >
                    {section.title} ({section.fields.length})
                  </button>
                ))}
              </div>

              {selectedSection && (
                <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">Editing {selectedSection.title}</p>
                      <p className="text-xs text-white/60">Adjust labels, helper text, and requirements.</p>
                    </div>
                    {builderData.builder.sections.length > 1 && (
                      <button
                        onClick={() => handleRemoveSection(selectedSection.id)}
                        className="inline-flex items-center rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-white/60">Section title</label>
                      <input
                        value={selectedSection.title}
                        onChange={(event) => handleSectionDetails(selectedSection.id, { title: event.target.value })}
                        className={`mt-1 w-full ${builderInput}`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-white/60">Description</label>
                      <input
                        value={selectedSection.description || ''}
                        onChange={(event) =>
                          handleSectionDetails(selectedSection.id, { description: event.target.value })
                        }
                        className={`mt-1 w-full ${builderInput}`}
                      />
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {selectedSection.fields.map((field) => (
                      <div key={field.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-white/90">
                            {field.label}{' '}
                            <span className="text-xs uppercase text-white/50">({field.type})</span>
                          </p>
                          <div className="flex items-center gap-2">
                            <label className="inline-flex items-center gap-1 text-xs font-semibold text-white/60">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={() =>
                                  handleFieldUpdate(selectedSection.id, field.id, { required: !field.required })
                                }
                                className="h-3.5 w-3.5 rounded border-white/40 text-indigo-300 focus:ring-indigo-400"
                              />
                              Required
                            </label>
                            <button
                              onClick={() => handleRemoveField(selectedSection.id, field.id)}
                              className="rounded-full border border-white/15 p-1 text-white/50 hover:border-rose-200 hover:text-rose-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-white/60">Field label</label>
                            <input
                              value={field.label}
                              onChange={(event) =>
                                handleFieldUpdate(selectedSection.id, field.id, { label: event.target.value })
                              }
                              className={`mt-1 w-full ${builderInput}`}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-white/60">Helper text</label>
                            <input
                              value={field.helperText || ''}
                              onChange={(event) =>
                                handleFieldUpdate(selectedSection.id, field.id, { helperText: event.target.value })
                              }
                              className={`mt-1 w-full ${builderInput}`}
                            />
                          </div>
                        </div>
                        {field.type === 'select' && (
                          <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Options</p>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = {
                                    id: `option-${Date.now()}`,
                                    label: 'New option',
                                    value: `value-${Date.now()}`,
                                  };
                                  handleFieldUpdate(selectedSection.id, field.id, {
                                    options: [...(field.options || []), next],
                                  });
                                }}
                              className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-indigo-500/10"
                              >
                                Add option
                              </button>
                            </div>
                            {(field.options || []).length === 0 && (
                              <p className="text-xs text-white/60">No options yet. Add at least one choice.</p>
                            )}
                            {(field.options || []).map((option, optionIndex) => (
                              <div
                                key={option.id}
                                className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3"
                              >
                                <input
                                  value={option.label}
                                  onChange={(event) => {
                                    const next = [...(field.options || [])];
                                    next[optionIndex] = { ...next[optionIndex], label: event.target.value };
                                    handleFieldUpdate(selectedSection.id, field.id, { options: next });
                                  }}
                                  className={`flex-1 ${builderInput}`}
                                  placeholder="Option label"
                                />
                                <input
                                  value={option.value}
                                  onChange={(event) => {
                                    const next = [...(field.options || [])];
                                    next[optionIndex] = { ...next[optionIndex], value: event.target.value };
                                    handleFieldUpdate(selectedSection.id, field.id, { options: next });
                                  }}
                                  className={`flex-1 ${builderInput}`}
                                  placeholder="Option value"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = (field.options || []).filter((_, idx) => idx !== optionIndex);
                                    handleFieldUpdate(selectedSection.id, field.id, { options: next });
                                  }}
                                  className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {selectedSection.fields.length === 0 && (
                      <p className="rounded-lg border border-dashed border-white/20 bg-white/10 px-4 py-6 text-center text-sm text-white/60">
                        No fields yet. Use the library to add inputs to this section.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {metadata && (
              <div className={builderPanel}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Blueprints</p>
                    <h2 className="text-xl font-semibold text-white">Start from a template</h2>
                  </div>
                  <LayoutPanelLeft className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {metadata.blueprints.map((blueprint) => (
                    <button
                      key={blueprint.id}
                      onClick={() => handleApplyBlueprint(blueprint.id)}
                      className="rounded-2xl border border-white/15 px-4 py-4 text-left hover:border-indigo-400/60 hover:bg-indigo-500/10"
                    >
                      <p className="text-sm font-semibold text-white">{blueprint.title}</p>
                      <p className="mt-1 text-xs text-white/60">{blueprint.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {blueprint.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/70"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-white/60">
                  Progress: {builderData.paypoint.builderSummary.progress || 0}% complete - {builderData.builder.sections.length} sections
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={loadBuilder}
                  disabled={isSaving}
                  className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/10 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
                <button
                  onClick={handleSaveBuilder}
                  disabled={isSaving || !isDirty}
                  className="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save builder
                </button>
              </div>
            </div>
          </section>
          <aside className="space-y-6">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Live preview</p>
                  <h2 className="text-lg font-semibold text-white">Member experience</h2>
                </div>
                <button
                  onClick={openLivePreview}
                  className="inline-flex items-center rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/80 hover:border-indigo-400/60 hover:bg-indigo-500/10"
                >
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  Full preview
                </button>
              </div>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-indigo-600 p-5 text-white shadow-lg">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wide text-indigo-100">
                    <span>Amount Breakdown</span>
                    <span>Preview</span>
                  </div>
                  <p className="mt-3 text-3xl font-semibold">
                    {currencyFormatter.format(builderData.builder.payment.amount)}
                  </p>
                  <p className="text-sm text-indigo-100">Default amount due</p>
                </div>

                {builderData.builder.sections.map((section) => (
                  <section key={`preview-section-${section.id}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">{section.title}</h3>
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Mandatory</span>
                    </div>
                    {section.description && <p className="mt-1 text-xs text-white/60">{section.description}</p>}
                    <div className="mt-3 space-y-3">
                      {section.fields.map((field) => (
                        <div key={`preview-field-${field.id}`}>
                          <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                            {field.label}
                            {field.required && <span className="text-rose-500"> *</span>}
                          </p>
                          {renderPreviewField(field)}
                        </div>
                      ))}
                    </div>
                  </section>
                ))}

                <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-sm font-semibold text-white">Payment Method</h3>
                  <div className="mt-3 space-y-2">
                    {builderData.builder.payment.acceptedMethods.map((method) => (
                      <div
                        key={`preview-method-${method}`}
                        className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white"
                      >
                        {method === 'mobile-money' ? 'Mobile Money' : 'Card Payment'}
                      </div>
                    ))}
                  </div>
                </section>

                <button className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white">
                  {builderData.builder.hero.primaryActionLabel}
                </button>
              </div>
            </div>

            {metadata && (
              <div className="rounded-2xl border border-white/15 bg-white/5 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Field library</p>
                    <h2 className="text-lg font-semibold text-white">Drag-and-drop ready</h2>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {metadata.fieldLibrary.map((field) => (
                    <button
                      key={field.type}
                      onClick={() => handleAddField(field)}
                      className="w-full rounded-xl border border-white/15 px-4 py-3 text-left hover:border-indigo-400/60 hover:bg-indigo-500/10"
                    >
                      <p className="text-sm font-semibold text-white">{field.label}</p>
                      <p className="text-xs text-white/60">{field.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
      </div>
    </div>
  );
};

export default PaypointBuilder;

