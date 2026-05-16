import React, { useEffect, useState } from 'react';
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
  hasMeaningfulValue(tool.owner) ? `Owner: ${tool.owner}` : ''
].filter(Boolean);

function PrintableReport({ audit, actionPlan, actionCompletion, savingsRate }) {
  const intakeRows = buildIntakeRows(audit);
  const findings = audit.wasteFindings || [];
  const tools = audit.tools || [];
  const recommendations = audit.recommendations || [];
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

      <footer className="pdf-footer">
        <p>SpendGuard</p>
        <span>Estimates must be validated with billing exports, usage logs, architecture review, and implementation results.</span>
      </footer>
    </section>
  );
}

export default function AuditReport() {
  const { id } = useParams();
  const [audit, setAudit] = useState(null);
  const [error, setError] = useState('');
  const [progressForm, setProgressForm] = useState({
    confirmedMonthlySavings: '',
    confirmedSpendAfter: '',
    implementationNotes: ''
  });
  const [savingProgress, setSavingProgress] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareLoading, setShareLoading] = useState(false);

  useEffect(() => {
    apiRequest(`/audits/${id}`)
      .then((data) => {
        setAudit(data.audit);
        setProgressForm({
          confirmedMonthlySavings: data.audit.confirmedMonthlySavings || '',
          confirmedSpendAfter: data.audit.confirmedSpendAfter || '',
          implementationNotes: data.audit.implementationNotes || ''
        });
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const exportPdf = () => {
    window.print();
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

  return (
    <>
    <main className="container-page screen-report py-10">
      <section className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="label text-yellow-300">Governance report</p>
          <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">{audit.companyName}</h1>
          <p className="mt-3 text-sm font-semibold text-zinc-500">
            {[audit.workspaceName, audit.businessType, audit.productType, audit.teamSize ? `${audit.teamSize} team members` : ''].filter(hasMeaningfulValue).join(' | ')}
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
