import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BudgetAlerts from '../components/BudgetAlerts';
import CostLedger from '../components/CostLedger';
import ReportAgent from '../components/ReportAgent';
import UnitEconomicsPanel from '../components/UnitEconomicsPanel';
import { apiRequest, formatCurrency } from '../utils/api';

const formatNumber = (value) =>
  Number(value || 0).toLocaleString('en-IN');

const hasText = (value) =>
  Boolean(String(value || '').trim());

const hasMeaningfulValue = (value) =>
  hasText(value) && !['unknown', 'not provided'].includes(String(value).trim().toLowerCase());

const buildIntakeRows = (audit) => [
  ['Organization', audit.organizationName],
  ['Department', audit.department],
  ['Region', audit.region],
  ['Cost center', audit.costCenter],
  ['Business type', audit.businessType],
  ['Workspace / client', audit.workspaceName],
  ['Product type', audit.productType],
  ['Team size', audit.teamSize ? `${formatNumber(audit.teamSize)} team members` : ''],
  ['Monthly active users', audit.monthlyActiveUsers ? formatNumber(audit.monthlyActiveUsers) : ''],
  ['Monthly AI requests', audit.monthlyRequests ? formatNumber(audit.monthlyRequests) : ''],
  ['Monthly budget', audit.monthlyBudget ? formatCurrency(audit.monthlyBudget) : ''],
  ['Data source', audit.dataSource],
  ['Cost concern', audit.costConcern || audit.notes]
].filter(([, value]) => hasMeaningfulValue(value));

const buildToolSignals = (tool) => [
  hasMeaningfulValue(tool.provider) ? `Provider: ${tool.provider}` : '',
  hasMeaningfulValue(tool.workflow) ? `Workflow: ${tool.workflow}` : '',
  hasMeaningfulValue(tool.customer) ? `Customer: ${tool.customer}` : '',
  tool.monthlyRequests ? `${formatNumber(tool.monthlyRequests)} requests` : '',
  tool.avgTokens ? `${formatNumber(tool.avgTokens)} avg tokens` : '',
  hasMeaningfulValue(tool.modelTier) ? `${tool.modelTier} tier` : '',
  hasMeaningfulValue(tool.caching) ? `${tool.caching} caching` : '',
  hasMeaningfulValue(tool.owner) ? `Owner: ${tool.owner}` : '',
  hasMeaningfulValue(tool.department) ? `Department: ${tool.department}` : '',
  hasMeaningfulValue(tool.region) ? `Region: ${tool.region}` : '',
  hasMeaningfulValue(tool.costCenter) ? `Cost center: ${tool.costCenter}` : ''
].filter(Boolean);

const emptyProofForm = {
  status: 'not_started',
  baselinePeriod: '',
  comparisonPeriod: '',
  baselineSpend: '',
  verifiedSpendAfter: '',
  verifiedMonthlySavings: '',
  validationMethod: '',
  evidenceNotes: '',
  evidenceLink: '',
  verifiedBy: '',
  customerQuote: '',
  quoteAuthor: '',
  permissionToUse: false,
  caseStudyTitle: ''
};

const emptyImportForm = {
  provider: 'csv',
  periodType: 'baseline',
  periodLabel: '',
  notes: '',
  csvText: ''
};

const emptyPilotForm = {
  status: 'not_started',
  customerName: '',
  contactName: '',
  contactEmail: '',
  inviteMessage: '',
  feedbackRating: '',
  feedbackNotes: '',
  outcomeNotes: '',
  permissionStatus: 'not_requested',
  customerQuote: '',
  quoteAuthor: '',
  caseStudyTitle: ''
};

function PrintableReport({ audit, actionPlan, actionCompletion, savingsRate }) {
  const intakeRows = buildIntakeRows(audit);
  const findings = audit.wasteFindings || [];
  const tools = audit.tools || [];
  const recommendations = audit.recommendations || [];
  const proof = audit.proof || {};
  const reportDate = audit.createdAt
    ? new Date(audit.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <section className="pdf-report" aria-label="PDF governance report">
      <header className="pdf-cover">
        <div>
          <p className="pdf-kicker">SpendGuard</p>
          <h1>{audit.companyName}</h1>
          <p className="pdf-subtitle">AI API and infrastructure cost governance report</p>
        </div>
        <div className="pdf-meta">
          <p>Report date</p>
          <strong>{reportDate}</strong>
          <span>{audit.riskLevel || 'Medium'} risk profile</span>
        </div>
      </header>

      <section className="pdf-section">
        <p className="pdf-label">Executive Summary</p>
        <h2>{formatCurrency(audit.possibleMonthlySavings)} possible monthly savings across {tools.length} AI cost lines.</h2>
        <p>
          SpendGuard found a {audit.riskLevel || 'Medium'} risk cost profile and a possible {savingsRate}% reduction opportunity before validation. The report focuses on model overuse, repeated prompts, long context, missing cost attribution, budget guardrails, and infrastructure retention growth.
        </p>
      </section>

      <section className="pdf-metrics">
        {[
          ['Current monthly spend', audit.monthlySpend],
          ['Possible monthly savings', audit.possibleMonthlySavings],
          ['Spend after cleanup', audit.spendAfterCleanup],
          ['Possible yearly savings', audit.yearlySavings]
        ].map(([label, value]) => (
          <div key={label}>
            <p>{label}</p>
            <strong>{formatCurrency(value)}</strong>
          </div>
        ))}
      </section>

      {intakeRows.length > 0 && (
        <section className="pdf-section">
          <p className="pdf-label">Governance Intake</p>
          <div className="pdf-info-grid">
            {intakeRows.map(([label, value]) => (
              <div key={label}>
                <p>{label}</p>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </section>
      )}

      {findings.length > 0 && (
        <section className="pdf-section">
          <p className="pdf-label">Cost Waste Findings</p>
          <table className="pdf-table">
            <thead>
              <tr>
                <th>Finding</th>
                <th>Impact</th>
                <th>Estimated monthly saving</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((finding) => (
                <tr key={finding.title}>
                  <td>
                    <strong>{finding.title}</strong>
                    <span>{finding.detail}</span>
                  </td>
                  <td>{finding.category} / {finding.impact}</td>
                  <td>{formatCurrency(finding.estimatedSavings)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="pdf-section">
        <p className="pdf-label">Cost Lines Checked</p>
        <table className="pdf-table">
          <thead>
            <tr>
              <th>Cost line</th>
              <th>Usage signals</th>
              <th>Monthly cost</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((tool, index) => {
              const signals = buildToolSignals(tool);

              return (
                <tr key={`${tool.name}-${index}`}>
                  <td>
                    <strong>{tool.name}</strong>
                    <span>{tool.category || 'Cost line'} / {tool.usage} usage / {tool.seats} units</span>
                  </td>
                  <td>{signals.length ? signals.join(', ') : 'Baseline spend line'}</td>
                  <td>{formatCurrency(tool.monthlyCost)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {actionPlan.length > 0 && (
        <section className="pdf-section">
          <div className="pdf-section-heading">
            <div>
              <p className="pdf-label">30-Day Action Plan</p>
              <h2>Implementation progress: {actionCompletion}%</h2>
            </div>
          </div>
          <div className="pdf-action-list">
            {actionPlan.map((item) => (
              <article key={`${item.phase}-${item.title}`}>
                <p>{item.phase}</p>
                <h3>{item.title}</h3>
                <span>{item.detail}</span>
                {hasMeaningfulValue(item.owner) && <small>Owner: {item.owner}</small>}
              </article>
            ))}
          </div>
        </section>
      )}

      {recommendations.length > 0 && (
        <section className="pdf-section">
          <p className="pdf-label">Recommendations</p>
          <div className="pdf-recommendations">
            {recommendations.map((item, index) => (
              <article key={`${item.title}-${index}`}>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
                <span>Impact: {item.impact}</span>
              </article>
            ))}
          </div>
        </section>
      )}

      {hasMeaningfulValue(proof.status) && proof.status !== 'not_started' && (
        <section className="pdf-section">
          <p className="pdf-label">Savings Proof</p>
          <h2>{formatCurrency(proof.verifiedMonthlySavings || audit.confirmedMonthlySavings)} verified monthly savings.</h2>
          <p>
            Proof status: {String(proof.status).replace(/_/g, ' ')}. Baseline period: {proof.baselinePeriod || 'not set'}. Comparison period: {proof.comparisonPeriod || 'not set'}. Validation method: {proof.validationMethod || 'not recorded'}.
          </p>
        </section>
      )}

      <footer className="pdf-footer">
        <p>SpendGuard</p>
        <span>Estimates must be validated with billing exports, usage logs, architecture review, and implementation results.</span>
      </footer>
    </section>
  );
}

export default function AuditReport() {
  const { id } = useParams();
  const evidenceFileRef = useRef(null);
  const [audit, setAudit] = useState(null);
  const [error, setError] = useState('');
  const [progressForm, setProgressForm] = useState({
    confirmedMonthlySavings: '',
    confirmedSpendAfter: '',
    implementationNotes: ''
  });
  const [proofForm, setProofForm] = useState(emptyProofForm);
  const [importForm, setImportForm] = useState(emptyImportForm);
  const [pilotForm, setPilotForm] = useState(emptyPilotForm);
  const [savingProgress, setSavingProgress] = useState(false);
  const [savingProof, setSavingProof] = useState(false);
  const [importingEvidence, setImportingEvidence] = useState(false);
  const [savingPilot, setSavingPilot] = useState(false);
  const [proofReport, setProofReport] = useState(null);
  const [proofReportLoading, setProofReportLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [approvalForm, setApprovalForm] = useState({
    step: 'finance',
    status: 'pending',
    owner: '',
    notes: ''
  });
  const [savingApproval, setSavingApproval] = useState(false);
  const [enterprisePack, setEnterprisePack] = useState(null);
  const [packLoading, setPackLoading] = useState(false);
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  useEffect(() => {
    apiRequest(`/audits/${id}`)
      .then((data) => {
        const proof = data.audit.proof || {};
        const pilot = data.audit.pilot || {};
        setAudit(data.audit);
        setProgressForm({
          confirmedMonthlySavings: data.audit.confirmedMonthlySavings || '',
          confirmedSpendAfter: data.audit.confirmedSpendAfter || '',
          implementationNotes: data.audit.implementationNotes || ''
        });
        setProofForm({
          status: proof.status || 'not_started',
          baselinePeriod: proof.baselinePeriod || '',
          comparisonPeriod: proof.comparisonPeriod || '',
          baselineSpend: proof.baselineSpend || data.audit.monthlySpend || '',
          verifiedSpendAfter: proof.verifiedSpendAfter || data.audit.confirmedSpendAfter || '',
          verifiedMonthlySavings: proof.verifiedMonthlySavings || data.audit.confirmedMonthlySavings || '',
          validationMethod: proof.validationMethod || '',
          evidenceNotes: proof.evidenceNotes || '',
          evidenceLink: proof.evidenceLink || '',
          verifiedBy: proof.verifiedBy || '',
          customerQuote: proof.customerQuote || '',
          quoteAuthor: proof.quoteAuthor || '',
          permissionToUse: Boolean(proof.permissionToUse),
          caseStudyTitle: proof.caseStudyTitle || ''
        });
        setPilotForm({
          status: pilot.status || 'not_started',
          customerName: pilot.customerName || data.audit.companyName || '',
          contactName: pilot.contactName || '',
          contactEmail: pilot.contactEmail || '',
          inviteMessage: pilot.inviteMessage || '',
          feedbackRating: pilot.feedbackRating || '',
          feedbackNotes: pilot.feedbackNotes || '',
          outcomeNotes: pilot.outcomeNotes || '',
          permissionStatus: pilot.permissionStatus || 'not_requested',
          customerQuote: proof.customerQuote || '',
          quoteAuthor: proof.quoteAuthor || '',
          caseStudyTitle: proof.caseStudyTitle || ''
        });
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const exportPdf = () => {
    window.print();
  };

  const saveApproval = async (event) => {
    event.preventDefault();
    setSavingApproval(true);
    setError('');

    try {
      const data = await apiRequest(`/audits/${audit._id}/approval`, {
        method: 'PATCH',
        body: approvalForm
      });
      setAudit(data.audit);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingApproval(false);
    }
  };

  const loadEnterprisePack = async () => {
    setPackLoading(true);
    setError('');

    try {
      const data = await apiRequest(`/audits/${audit._id}/enterprise-pack`);
      setEnterprisePack(data.pack);
    } catch (err) {
      setError(err.message);
    } finally {
      setPackLoading(false);
    }
  };

  const createMonthlyReview = async () => {
    setMonthlyLoading(true);
    setError('');

    try {
      const data = await apiRequest(`/audits/${audit._id}/monthly-review`, {
        method: 'POST',
        body: {
          reviewCadence: audit.reviewCadence || 'monthly'
        }
      });
      setAudit(data.audit);
    } catch (err) {
      setError(err.message);
    } finally {
      setMonthlyLoading(false);
    }
  };

  const updateActionStatus = async (index, status) => {
    try {
      const data = await apiRequest(`/audits/${audit._id}/action-plan/${index}`, {
        method: 'PATCH',
        body: { status }
      });
      setAudit(data.audit);
    } catch (err) {
      setError(err.message);
    }
  };

  const saveProgress = async (event) => {
    event.preventDefault();
    setSavingProgress(true);
    setError('');

    try {
      const data = await apiRequest(`/audits/${audit._id}/progress`, {
        method: 'PATCH',
        body: progressForm
      });
      setAudit(data.audit);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProgress(false);
    }
  };

  const saveProof = async (event) => {
    event.preventDefault();
    setSavingProof(true);
    setError('');

    try {
      const data = await apiRequest(`/audits/${audit._id}/proof`, {
        method: 'PATCH',
        body: proofForm
      });
      setAudit(data.audit);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProof(false);
    }
  };

  const importEvidence = async ({ text, fileName = '' } = {}) => {
    const csvText = text ?? importForm.csvText;
    if (!String(csvText || '').trim()) {
      setError('Upload or paste a billing CSV before importing evidence.');
      return;
    }

    setImportingEvidence(true);
    setError('');

    try {
      const data = await apiRequest(`/audits/${audit._id}/import-batch`, {
        method: 'POST',
        body: {
          ...importForm,
          csvText,
          fileName
        }
      });
      setAudit(data.audit);
      setProofReport(data.proofReport);
      setImportForm({ ...emptyImportForm, periodType: importForm.periodType === 'baseline' ? 'comparison' : 'baseline' });
    } catch (err) {
      setError(err.message);
    } finally {
      setImportingEvidence(false);
    }
  };

  const handleEvidenceFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    await importEvidence({ text, fileName: file.name });
    event.target.value = '';
  };

  const loadProofReport = async () => {
    setProofReportLoading(true);
    setError('');

    try {
      const data = await apiRequest(`/audits/${audit._id}/proof-report`);
      setProofReport(data.proofReport);
    } catch (err) {
      setError(err.message);
    } finally {
      setProofReportLoading(false);
    }
  };

  const savePilot = async (event) => {
    event.preventDefault();
    setSavingPilot(true);
    setError('');

    try {
      const data = await apiRequest(`/audits/${audit._id}/pilot`, {
        method: 'PATCH',
        body: pilotForm
      });
      setAudit(data.audit);
      setProofReport(data.proofReport);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingPilot(false);
    }
  };

  const createShareLink = async () => {
    setShareLoading(true);
    setError('');

    try {
      const data = await apiRequest(`/audits/${audit._id}/share`, { method: 'POST' });
      setAudit(data.audit);
      setShareUrl(`${window.location.origin}${data.shareUrl}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setShareLoading(false);
    }
  };

  const disableShareLink = async () => {
    setShareLoading(true);
    setError('');

    try {
      const data = await apiRequest(`/audits/${audit._id}/share`, { method: 'DELETE' });
      setAudit(data.audit);
      setShareUrl('');
    } catch (err) {
      setError(err.message);
    } finally {
      setShareLoading(false);
    }
  };

  if (error) {
    return <main className="container-page py-10"><p className="panel text-red-100">{error}</p></main>;
  }

  if (!audit) {
    return <main className="container-page py-10"><p className="panel">Loading report...</p></main>;
  }

  const actionPlan = audit.actionPlan || [];
  const completedActions = actionPlan.filter((item) => item.status === 'done').length;
  const actionCompletion = actionPlan.length ? Math.round((completedActions / actionPlan.length) * 100) : 0;
  const savingsRate = audit.monthlySpend ? Math.round((audit.possibleMonthlySavings / audit.monthlySpend) * 100) : 0;
  const intakeRows = buildIntakeRows(audit);
  const approvalSteps = ['finance', 'engineering', 'leadership'];
  const auditLog = audit.auditLog || [];
  const proof = audit.proof || {};
  const importBatches = audit.importBatches || [];
  const pilot = audit.pilot || {};
  const proofStatus = String(proof.status || 'not_started').replace(/_/g, ' ');

  return (
    <>
    <main className="container-page screen-report py-10">
      <section className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="label text-yellow-300">Governance report</p>
          <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">{audit.companyName}</h1>
          <p className="mt-3 text-sm font-semibold text-zinc-500">
            {[audit.organizationName, audit.department, audit.region, audit.costCenter, audit.workspaceName, audit.businessType, audit.productType, audit.teamSize ? `${audit.teamSize} team members` : ''].filter(hasMeaningfulValue).join(' | ')}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row print:hidden">
          <button type="button" onClick={exportPdf} className="btn-primary">Export PDF</button>
          <Link to="/audits/new" className="btn-secondary">Create another report</Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Monthly AI and infra spend', audit.monthlySpend],
          ['Possible monthly savings', audit.possibleMonthlySavings],
          ['Spend after cleanup', audit.spendAfterCleanup],
          ['Possible yearly savings', audit.yearlySavings]
        ].map(([label, value]) => (
          <article key={label} className="panel">
            <p className="label">{label}</p>
            <p className="mt-3 text-3xl font-black text-white">{formatCurrency(value)}</p>
          </article>
        ))}
      </section>

      <section className="panel mt-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="label text-yellow-200">Approval workflow</p>
            <h2 className="mt-2 text-2xl font-black text-white">Finance, engineering, and leadership approval.</h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-500">
              Use this to move a report from analysis into controlled implementation.
            </p>
          </div>
          <button type="button" onClick={createMonthlyReview} disabled={monthlyLoading} className="btn-secondary px-4 py-2">
            {monthlyLoading ? 'Creating...' : 'Create Monthly Review'}
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {approvalSteps.map((step) => {
            const item = audit.approval?.[step] || {};
            return (
              <article key={step} className="rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="label text-sky-200">{step}</p>
                <h3 className="mt-2 text-xl font-black capitalize text-white">{item.status || 'not_requested'}</h3>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-500">
                  Owner: {item.owner || 'Unassigned'}
                </p>
                {item.notes && <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-400">{item.notes}</p>}
                {item.decidedBy && <p className="mt-2 text-xs font-bold uppercase tracking-widest text-zinc-600">By {item.decidedBy}</p>}
              </article>
            );
          })}
        </div>

        <form onSubmit={saveApproval} className="mt-5 grid gap-4 border-t border-white/10 pt-5 md:grid-cols-2 xl:grid-cols-[180px_220px_220px_minmax(0,1fr)_auto] xl:items-end print:hidden">
          <label className="grid gap-2">
            <span className="label">Step</span>
            <select className="input" value={approvalForm.step} onChange={(event) => setApprovalForm({ ...approvalForm, step: event.target.value })}>
              <option value="finance">Finance</option>
              <option value="engineering">Engineering</option>
              <option value="leadership">Leadership</option>
            </select>
          </label>
          <label className="grid gap-2">
            <span className="label">Status</span>
            <select className="input" value={approvalForm.status} onChange={(event) => setApprovalForm({ ...approvalForm, status: event.target.value })}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="changes_requested">Changes requested</option>
              <option value="not_requested">Not requested</option>
            </select>
          </label>
          <label className="grid gap-2">
            <span className="label">Owner</span>
            <input className="input" value={approvalForm.owner} onChange={(event) => setApprovalForm({ ...approvalForm, owner: event.target.value })} />
          </label>
          <label className="grid gap-2">
            <span className="label">Notes</span>
            <input className="input" value={approvalForm.notes} onChange={(event) => setApprovalForm({ ...approvalForm, notes: event.target.value })} placeholder="Approval condition or requested change" />
          </label>
          <button type="submit" disabled={savingApproval} className="btn-primary">
            {savingApproval ? 'Saving...' : 'Save Approval'}
          </button>
        </form>
      </section>

      <section className="panel mt-8 print:hidden">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="label text-emerald-200">Private governance report link</p>
            <h2 className="mt-2 text-2xl font-black text-white">Share this report without giving account access.</h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-500">
              The public link shows the report only. Editing, progress updates, and AI actions stay inside your account.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={createShareLink} disabled={shareLoading} className="btn-primary">
              {audit.reportShared ? 'Refresh Link' : 'Create Link'}
            </button>
            {audit.reportShared && (
              <button type="button" onClick={disableShareLink} disabled={shareLoading} className="btn-secondary">
                Disable Link
              </button>
            )}
          </div>
        </div>
        {(shareUrl || audit.reportShared) && (
          <p className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3 text-sm font-bold text-emerald-100">
            {shareUrl || `${window.location.origin}/reports/public/${audit.reportToken}`}
          </p>
        )}
      </section>

      <section className="panel mt-8 print:hidden">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="label text-emerald-200">Enterprise export pack</p>
            <h2 className="mt-2 text-2xl font-black text-white">Board summary, procurement brief, risk register, and executive actions.</h2>
          </div>
          <button type="button" onClick={loadEnterprisePack} disabled={packLoading} className="btn-primary">
            {packLoading ? 'Generating...' : 'Generate Enterprise Pack'}
          </button>
        </div>

        {enterprisePack && (
          <div className="mt-6 grid gap-5">
            <article className="rounded-lg border border-white/10 bg-black/20 p-5">
              <p className="label text-yellow-200">Board summary</p>
              <h3 className="mt-2 text-xl font-black text-white">{enterprisePack.boardSummary.title}</h3>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-400">{enterprisePack.boardSummary.narrative}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                {enterprisePack.boardSummary.metrics.map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                    <p className="label">{label}</p>
                    <p className="mt-1 font-black text-white">{formatCurrency(value)}</p>
                  </div>
                ))}
              </div>
            </article>

            {enterprisePack.proof && (
              <article className="rounded-lg border border-emerald-300/20 bg-emerald-300/[0.06] p-5">
                <p className="label text-emerald-200">Proof for leadership</p>
                <div className="mt-3 grid gap-3 md:grid-cols-4">
                  {[
                    ['Status', String(enterprisePack.proof.status || 'not_started').replace(/_/g, ' ')],
                    ['Verified savings', formatCurrency(enterprisePack.proof.verifiedMonthlySavings)],
                    ['Baseline', enterprisePack.proof.baselinePeriod || 'Not set'],
                    ['Comparison', enterprisePack.proof.comparisonPeriod || 'Not set']
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-white/10 bg-black/20 p-3">
                      <p className="label">{label}</p>
                      <p className="mt-1 font-black capitalize text-white">{value}</p>
                    </div>
                  ))}
                </div>
                {enterprisePack.proof.validationMethod && (
                  <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-300">{enterprisePack.proof.validationMethod}</p>
                )}
                {enterprisePack.proof.customerQuote && (
                  <p className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3 text-sm font-semibold leading-relaxed text-emerald-100">
                    "{enterprisePack.proof.customerQuote}"
                  </p>
                )}
              </article>
            )}

            <div className="grid gap-5 lg:grid-cols-2">
              <article className="rounded-lg border border-white/10 bg-black/20 p-5">
                <p className="label text-sky-200">Procurement brief</p>
                <div className="mt-3 grid gap-3">
                  {enterprisePack.procurementBrief.map((vendor) => (
                    <div key={vendor.vendor} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                      <p className="font-black text-white">{vendor.vendor} | {formatCurrency(vendor.spend)}</p>
                      <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-400">{vendor.negotiationAngle}</p>
                      <p className="mt-2 text-xs font-bold uppercase tracking-widest text-zinc-600">Owners: {vendor.owners}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-lg border border-white/10 bg-black/20 p-5">
                <p className="label text-red-100">Risk register</p>
                <div className="mt-3 grid gap-3">
                  {enterprisePack.riskRegister.map((risk) => (
                    <div key={`${risk.risk}-${risk.owner}`} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                      <p className="font-black text-white">{risk.risk}</p>
                      <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-400">{risk.mitigation}</p>
                      <p className="mt-2 text-xs font-bold uppercase tracking-widest text-yellow-200">{risk.severity} | {risk.owner}</p>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        )}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.55fr)]">
        <article className="panel border-emerald-300/20 bg-emerald-300/[0.06]">
          <p className="label text-emerald-200">Executive summary</p>
          <h2 className="mt-3 text-3xl font-black text-white">
            {formatCurrency(audit.possibleMonthlySavings)} possible monthly savings across {audit.tools?.length || 0} AI cost lines.
          </h2>
          <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
            SpendGuard found a {audit.riskLevel || 'Medium'} risk cost profile and a possible {savingsRate}% reduction opportunity before validation. The report focuses on waste patterns that real AI teams face: model overuse, repeated prompts, long context, missing cost attribution, no budget guardrails, and infrastructure retention growth.
          </p>
        </article>

        <aside className="panel">
          <p className="label text-sky-200">Governance intake</p>
          <div className="mt-4 grid gap-3">
            {intakeRows.map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-black/20 p-3">
                <p className="label">{label}</p>
                <p className="mt-1 text-sm font-bold leading-relaxed text-zinc-300">{value}</p>
              </div>
            ))}
            {intakeRows.length === 0 && (
              <p className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm font-semibold text-zinc-500">
                Add intake details in the next report to include this section.
              </p>
            )}
          </div>
        </aside>
      </section>

      <section className="mt-8 panel">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label text-red-100">Cost waste detector</p>
            <h2 className="mt-2 text-2xl font-black text-white">Highest-value waste findings</h2>
          </div>
          <span className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white">
            {audit.riskLevel || 'Medium'} risk
          </span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {(audit.wasteFindings || []).map((finding) => (
            <article key={finding.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-black text-white">{finding.title}</p>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-400">{finding.detail}</p>
                </div>
                <p className="shrink-0 text-sm font-black text-emerald-200">{formatCurrency(finding.estimatedSavings)}</p>
              </div>
              <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-yellow-200">{finding.category} | {finding.impact} impact</p>
            </article>
          ))}
          {(!audit.wasteFindings || audit.wasteFindings.length === 0) && (
            <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm font-semibold text-zinc-400">
              No waste findings were stored for this older report. Create a new report to use the upgraded detector.
            </p>
          )}
        </div>
      </section>

      <div className="mt-8 grid gap-6">
        <BudgetAlerts alerts={audit.budgetAlerts || []} />
        <UnitEconomicsPanel economics={audit.unitEconomics} monthlySpend={audit.monthlySpend} />
        <CostLedger tools={audit.tools || []} />
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.55fr)]">
        <div className="panel">
          <p className="label text-sky-300">Cost lines checked</p>
          <div className="mt-5 grid gap-3">
            {audit.tools.map((tool, index) => (
              <div key={`${tool.name}-${index}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black text-white">{tool.name}</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-600">
                      {tool.category || 'Cost line'} | {tool.usage} usage | {tool.seats} units
                    </p>
                    {buildToolSignals(tool).length > 0 && (
                      <p className="mt-1 text-xs font-semibold text-zinc-500">
                        {buildToolSignals(tool).join(' | ')}
                      </p>
                    )}
                  </div>
                  <p className="text-lg font-black text-white">{formatCurrency(tool.monthlyCost)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="panel border-yellow-300/20 bg-yellow-300/[0.06]">
          <p className="label text-yellow-200">Recommendations</p>
          <div className="mt-5 grid gap-3">
            {audit.recommendations.map((item, index) => (
              <article key={`${item.title}-${index}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="font-black text-white">{item.title}</p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-400">{item.detail}</p>
                <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-yellow-200">Impact: {item.impact}</p>
              </article>
            ))}
          </div>
        </aside>
      </section>

      <section className="panel mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label text-emerald-200">Before / after tracking</p>
            <h2 className="mt-2 text-2xl font-black text-white">Implementation progress</h2>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-right">
            <p className="label">Actions completed</p>
            <p className="mt-1 text-2xl font-black text-white">{actionCompletion}%</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {actionPlan.map((item, index) => (
            <article key={`${item.phase}-${item.title}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="grid gap-3 lg:grid-cols-[120px_minmax(0,1fr)_150px] lg:items-start">
                <p className="label text-sky-200">{item.phase}</p>
                <div>
                  <h3 className="font-black text-white">{item.title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-400">{item.detail}</p>
                  <p className="mt-2 text-xs font-bold text-zinc-600">Owner: {item.owner || 'Team'}</p>
                </div>
                <select
                  className="input print:hidden"
                  value={item.status || 'todo'}
                  onChange={(event) => updateActionStatus(index, event.target.value)}
                >
                  <option value="todo">To do</option>
                  <option value="doing">Doing</option>
                  <option value="done">Done</option>
                </select>
                <p className="hidden text-xs font-black uppercase tracking-widest text-zinc-500 print:block">
                  Status: {item.status || 'todo'}
                </p>
              </div>
            </article>
          ))}
        </div>

        <form onSubmit={saveProgress} className="mt-5 grid gap-4 border-t border-white/10 pt-5 md:grid-cols-2 xl:grid-cols-[220px_220px_minmax(0,1fr)_auto] xl:items-end print:hidden">
          <label className="grid gap-2">
            <span className="label">Confirmed monthly savings</span>
            <input
              className="input"
              type="number"
              min="0"
              value={progressForm.confirmedMonthlySavings}
              onChange={(event) => setProgressForm({ ...progressForm, confirmedMonthlySavings: event.target.value })}
            />
          </label>
          <label className="grid gap-2">
            <span className="label">Actual monthly spend after</span>
            <input
              className="input"
              type="number"
              min="0"
              value={progressForm.confirmedSpendAfter}
              onChange={(event) => setProgressForm({ ...progressForm, confirmedSpendAfter: event.target.value })}
            />
          </label>
          <label className="grid gap-2">
            <span className="label">Implementation notes</span>
            <input
              className="input"
              value={progressForm.implementationNotes}
              onChange={(event) => setProgressForm({ ...progressForm, implementationNotes: event.target.value })}
              placeholder="What changed after the governance review?"
            />
          </label>
          <button type="submit" disabled={savingProgress} className="btn-primary">
            {savingProgress ? 'Saving...' : 'Save Progress'}
          </button>
        </form>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {[
            ['Before cleanup', audit.monthlySpend],
            ['Estimated after fixes', audit.spendAfterCleanup],
            ['Actual spend after', audit.confirmedSpendAfter || 0],
            ['Confirmed monthly savings', audit.confirmedMonthlySavings || 0]
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <p className="label">{label}</p>
              <p className="mt-2 text-2xl font-black text-white">{formatCurrency(value)}</p>
            </div>
          ))}
        </div>
        {audit.implementationNotes && (
          <p className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4 text-sm font-semibold leading-relaxed text-zinc-300">
            {audit.implementationNotes}
          </p>
        )}
      </section>

      <section className="panel mt-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="label text-emerald-200">Proof Center</p>
            <h2 className="mt-2 text-2xl font-black text-white">Record the evidence that makes savings believable.</h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-500">
              Use this after implementation to separate estimated savings from verified proof.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-left lg:text-right">
            <p className="label">Proof status</p>
            <p className="mt-1 text-2xl font-black capitalize text-white">{proofStatus}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {[
            ['Baseline spend', proof.baselineSpend || audit.monthlySpend],
            ['Verified spend after', proof.verifiedSpendAfter || audit.confirmedSpendAfter || 0],
            ['Verified monthly savings', proof.verifiedMonthlySavings || audit.confirmedMonthlySavings || 0],
            ['Case study permission', proof.permissionToUse ? 'Approved' : 'Private']
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <p className="label">{label}</p>
              <p className="mt-2 text-2xl font-black text-white">
                {typeof value === 'number' ? formatCurrency(value) : value}
              </p>
            </div>
          ))}
        </div>

        {proof.evidenceLink && (
          <a
            href={proof.evidenceLink}
            target="_blank"
            rel="noreferrer"
            className="mt-4 block rounded-lg border border-white/10 bg-black/20 p-4 text-sm font-bold text-emerald-100"
          >
            Evidence link: {proof.evidenceLink}
          </a>
        )}

        <div className="mt-5 rounded-lg border border-sky-300/20 bg-sky-300/[0.06] p-4 print:hidden">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="label text-sky-200">Real data evidence</p>
              <h3 className="mt-2 text-xl font-black text-white">Import baseline and after-period billing exports.</h3>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-500">
                OpenAI, Anthropic, AWS, Azure, GCP, invoice, and generic CSV rows are normalized into proof.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => evidenceFileRef.current?.click()} disabled={importingEvidence} className="btn-secondary">
                Upload Evidence CSV
              </button>
              <button type="button" onClick={loadProofReport} disabled={proofReportLoading} className="btn-primary">
                {proofReportLoading ? 'Generating...' : 'Generate Proof Report'}
              </button>
              <input ref={evidenceFileRef} type="file" accept=".csv,text/csv" onChange={handleEvidenceFile} className="hidden" />
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="grid gap-2">
              <span className="label">Source</span>
              <select className="input" value={importForm.provider} onChange={(event) => setImportForm({ ...importForm, provider: event.target.value })}>
                <option value="csv">Auto / CSV</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="aws">AWS</option>
                <option value="azure">Azure</option>
                <option value="gcp">GCP</option>
                <option value="invoice">Invoice</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="label">Period type</span>
              <select className="input" value={importForm.periodType} onChange={(event) => setImportForm({ ...importForm, periodType: event.target.value })}>
                <option value="baseline">Baseline before fixes</option>
                <option value="comparison">After implementation</option>
                <option value="current">Current reference</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="label">Period label</span>
              <input className="input" value={importForm.periodLabel} onChange={(event) => setImportForm({ ...importForm, periodLabel: event.target.value })} placeholder="Apr 2026" />
            </label>
            <label className="grid gap-2">
              <span className="label">Evidence notes</span>
              <input className="input" value={importForm.notes} onChange={(event) => setImportForm({ ...importForm, notes: event.target.value })} placeholder="Billing export from finance" />
            </label>
          </div>

          <textarea
            className="input mt-4 min-h-28"
            value={importForm.csvText}
            onChange={(event) => setImportForm({ ...importForm, csvText: event.target.value })}
            placeholder="Paste CSV evidence here, or use Upload Evidence CSV"
          />

          <div className="mt-3 flex justify-end">
            <button type="button" onClick={() => importEvidence()} disabled={importingEvidence} className="btn-primary">
              {importingEvidence ? 'Importing...' : 'Import Evidence'}
            </button>
          </div>

          {importBatches.length > 0 && (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {importBatches.slice(0, 6).map((batch, index) => (
                <article key={`${batch.provider}-${batch.periodType}-${batch.importedAt}-${index}`} className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="label text-sky-200">{batch.periodType}</p>
                      <h4 className="mt-1 font-black text-white">{batch.provider?.toUpperCase()} {batch.periodLabel || 'import'}</h4>
                    </div>
                    <p className="text-sm font-black text-emerald-200">{formatCurrency(batch.totalSpend)}</p>
                  </div>
                  <p className="mt-2 text-xs font-bold uppercase tracking-widest text-zinc-600">
                    {batch.rowCount} rows | {formatNumber(batch.totalRequests)} usage units
                  </p>
                  {batch.notes && <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-400">{batch.notes}</p>}
                </article>
              ))}
            </div>
          )}
        </div>

        {proofReport && (
          <div className="mt-5 rounded-lg border border-emerald-300/20 bg-emerald-300/[0.06] p-4">
            <p className="label text-emerald-200">Generated proof report</p>
            <h3 className="mt-2 text-xl font-black text-white">{proofReport.title}</h3>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-400">{proofReport.summary}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {[
                ['Baseline', proofReport.metrics?.baselineSpend],
                ['Spend after', proofReport.metrics?.verifiedSpendAfter],
                ['Monthly proof', proofReport.metrics?.verifiedMonthlySavings],
                ['Annualized proof', proofReport.metrics?.annualizedVerifiedSavings]
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <p className="label">{label}</p>
                  <p className="mt-1 font-black text-white">{formatCurrency(value)}</p>
                </div>
              ))}
            </div>
            {proofReport.caseStudy?.ready && (
              <p className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3 text-sm font-semibold leading-relaxed text-emerald-100">
                Case study ready: {proofReport.caseStudy.title || 'Approved customer proof'}
              </p>
            )}
          </div>
        )}

        <form onSubmit={saveProof} className="mt-5 grid gap-4 border-t border-white/10 pt-5 print:hidden">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="grid gap-2">
              <span className="label">Proof status</span>
              <select className="input" value={proofForm.status} onChange={(event) => setProofForm({ ...proofForm, status: event.target.value })}>
                <option value="not_started">Not started</option>
                <option value="collecting">Collecting</option>
                <option value="verified">Verified</option>
                <option value="case_study_ready">Case study ready</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="label">Baseline period</span>
              <input className="input" value={proofForm.baselinePeriod} onChange={(event) => setProofForm({ ...proofForm, baselinePeriod: event.target.value })} placeholder="Apr 2026" />
            </label>
            <label className="grid gap-2">
              <span className="label">Comparison period</span>
              <input className="input" value={proofForm.comparisonPeriod} onChange={(event) => setProofForm({ ...proofForm, comparisonPeriod: event.target.value })} placeholder="May 2026" />
            </label>
            <label className="grid gap-2">
              <span className="label">Verified by</span>
              <input className="input" value={proofForm.verifiedBy} onChange={(event) => setProofForm({ ...proofForm, verifiedBy: event.target.value })} placeholder="Finance reviewer" />
            </label>
            <label className="grid gap-2">
              <span className="label">Baseline spend</span>
              <input className="input" type="number" min="0" value={proofForm.baselineSpend} onChange={(event) => setProofForm({ ...proofForm, baselineSpend: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <span className="label">Verified spend after</span>
              <input className="input" type="number" min="0" value={proofForm.verifiedSpendAfter} onChange={(event) => setProofForm({ ...proofForm, verifiedSpendAfter: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <span className="label">Verified monthly savings</span>
              <input className="input" type="number" min="0" value={proofForm.verifiedMonthlySavings} onChange={(event) => setProofForm({ ...proofForm, verifiedMonthlySavings: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <span className="label">Evidence link</span>
              <input className="input" value={proofForm.evidenceLink} onChange={(event) => setProofForm({ ...proofForm, evidenceLink: event.target.value })} placeholder="Billing export or dashboard URL" />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="label">Validation method</span>
            <textarea
              className="input min-h-24"
              value={proofForm.validationMethod}
              onChange={(event) => setProofForm({ ...proofForm, validationMethod: event.target.value })}
              placeholder="How the savings were verified: billing export, usage logs, invoice comparison, finance review."
            />
          </label>

          <label className="grid gap-2">
            <span className="label">Evidence notes</span>
            <textarea
              className="input min-h-24"
              value={proofForm.evidenceNotes}
              onChange={(event) => setProofForm({ ...proofForm, evidenceNotes: event.target.value })}
              placeholder="What changed, which controls were shipped, and what data proves the result."
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="label">Customer quote</span>
              <textarea
                className="input min-h-24"
                value={proofForm.customerQuote}
                onChange={(event) => setProofForm({ ...proofForm, customerQuote: event.target.value })}
                placeholder="Only add a quote the customer has approved."
              />
            </label>
            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="label">Quote author</span>
                <input className="input" value={proofForm.quoteAuthor} onChange={(event) => setProofForm({ ...proofForm, quoteAuthor: event.target.value })} placeholder="Name, title, company" />
              </label>
              <label className="grid gap-2">
                <span className="label">Case study title</span>
                <input className="input" value={proofForm.caseStudyTitle} onChange={(event) => setProofForm({ ...proofForm, caseStudyTitle: event.target.value })} placeholder="Approved customer story title" />
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-4">
                <input
                  type="checkbox"
                  checked={proofForm.permissionToUse}
                  onChange={(event) => setProofForm({ ...proofForm, permissionToUse: event.target.checked })}
                />
                <span className="text-sm font-bold text-zinc-300">Customer approved public use of quote and proof.</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={savingProof} className="btn-primary">
              {savingProof ? 'Saving...' : 'Save Proof'}
            </button>
          </div>
        </form>
      </section>

      <section className="panel mt-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="label text-yellow-200">Pilot proof workflow</p>
            <h2 className="mt-2 text-2xl font-black text-white">Invite a pilot customer, collect feedback, and request case-study permission.</h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-500">
              This turns a useful internal report into believable market proof.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-left lg:text-right">
            <p className="label">Pilot status</p>
            <p className="mt-1 text-2xl font-black capitalize text-white">{String(pilot.status || 'not_started').replace(/_/g, ' ')}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {[
            ['Customer', pilot.customerName || audit.companyName],
            ['Contact', pilot.contactName || 'Not set'],
            ['Feedback', pilot.feedbackRating ? `${pilot.feedbackRating}/10` : 'Waiting'],
            ['Permission', pilot.permissionStatus || 'not_requested']
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <p className="label">{label}</p>
              <p className="mt-2 text-lg font-black capitalize text-white">{value}</p>
            </div>
          ))}
        </div>

        <form onSubmit={savePilot} className="mt-5 grid gap-4 border-t border-white/10 pt-5 print:hidden">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="grid gap-2">
              <span className="label">Pilot status</span>
              <select className="input" value={pilotForm.status} onChange={(event) => setPilotForm({ ...pilotForm, status: event.target.value })}>
                <option value="not_started">Not started</option>
                <option value="invited">Invited</option>
                <option value="in_review">In review</option>
                <option value="feedback_received">Feedback received</option>
                <option value="case_study_requested">Case study requested</option>
                <option value="case_study_approved">Case study approved</option>
                <option value="case_study_declined">Case study declined</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="label">Customer</span>
              <input className="input" value={pilotForm.customerName} onChange={(event) => setPilotForm({ ...pilotForm, customerName: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <span className="label">Contact name</span>
              <input className="input" value={pilotForm.contactName} onChange={(event) => setPilotForm({ ...pilotForm, contactName: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <span className="label">Contact email</span>
              <input className="input" type="email" value={pilotForm.contactEmail} onChange={(event) => setPilotForm({ ...pilotForm, contactEmail: event.target.value })} />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="label">Invite message</span>
            <textarea
              className="input min-h-24"
              value={pilotForm.inviteMessage}
              onChange={(event) => setPilotForm({ ...pilotForm, inviteMessage: event.target.value })}
              placeholder="Short message asking the pilot customer to review the proof report."
            />
          </label>

          <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
            <label className="grid gap-2">
              <span className="label">Feedback score</span>
              <input className="input" type="number" min="0" max="10" value={pilotForm.feedbackRating} onChange={(event) => setPilotForm({ ...pilotForm, feedbackRating: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <span className="label">Feedback notes</span>
              <input className="input" value={pilotForm.feedbackNotes} onChange={(event) => setPilotForm({ ...pilotForm, feedbackNotes: event.target.value })} placeholder="What did the customer say was useful or missing?" />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="label">Outcome notes</span>
            <textarea
              className="input min-h-24"
              value={pilotForm.outcomeNotes}
              onChange={(event) => setPilotForm({ ...pilotForm, outcomeNotes: event.target.value })}
              placeholder="Decision, next step, renewal chance, expansion opportunity, or proof gap."
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="grid gap-2">
              <span className="label">Permission</span>
              <select className="input" value={pilotForm.permissionStatus} onChange={(event) => setPilotForm({ ...pilotForm, permissionStatus: event.target.value })}>
                <option value="not_requested">Not requested</option>
                <option value="requested">Requested</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
              </select>
            </label>
            <label className="grid gap-2 xl:col-span-2">
              <span className="label">Approved quote</span>
              <input className="input" value={pilotForm.customerQuote} onChange={(event) => setPilotForm({ ...pilotForm, customerQuote: event.target.value })} placeholder="Only use a quote the customer approved." />
            </label>
            <label className="grid gap-2">
              <span className="label">Quote author</span>
              <input className="input" value={pilotForm.quoteAuthor} onChange={(event) => setPilotForm({ ...pilotForm, quoteAuthor: event.target.value })} placeholder="Name, title" />
            </label>
            <label className="grid gap-2 md:col-span-2 xl:col-span-4">
              <span className="label">Case study title</span>
              <input className="input" value={pilotForm.caseStudyTitle} onChange={(event) => setPilotForm({ ...pilotForm, caseStudyTitle: event.target.value })} placeholder="How the customer reduced AI spend with verified evidence" />
            </label>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={savingPilot} className="btn-primary">
              {savingPilot ? 'Saving...' : 'Save Pilot Proof'}
            </button>
          </div>
        </form>
      </section>

      <section className="panel mt-8">
        <p className="label text-sky-200">Activity log</p>
        <h2 className="mt-2 text-2xl font-black text-white">Governance audit trail</h2>
        <div className="mt-5 grid gap-3">
          {auditLog.map((entry, index) => (
            <article key={`${entry.event}-${entry.createdAt}-${index}`} className="rounded-lg border border-white/10 bg-black/20 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-black text-white">{entry.event}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-600">
                  {entry.createdAt ? new Date(entry.createdAt).toLocaleString('en-IN') : ''}
                </p>
              </div>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-400">{entry.detail}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-zinc-600">
                {entry.actorName || 'System'} | {entry.actorRole || 'role'}
              </p>
            </article>
          ))}
          {!auditLog.length && <p className="rounded-lg border border-white/10 bg-black/20 p-4 text-sm font-semibold text-zinc-500">No activity recorded yet.</p>}
        </div>
      </section>

      <div className="mt-8 print:hidden">
        <ReportAgent audit={audit} />
      </div>
    </main>
    <PrintableReport
      audit={audit}
      actionPlan={actionPlan}
      actionCompletion={actionCompletion}
      savingsRate={savingsRate}
    />
    </>
  );
}
