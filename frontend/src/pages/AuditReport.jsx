import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReportAgent from '../components/ReportAgent';
import { apiRequest, formatCurrency } from '../utils/api';

export default function AuditReport() {
  const { id } = useParams();
  const [audit, setAudit] = useState(null);
  const [error, setError] = useState('');
  const [progressForm, setProgressForm] = useState({
    confirmedMonthlySavings: '',
    implementationNotes: ''
  });
  const [savingProgress, setSavingProgress] = useState(false);

  useEffect(() => {
    apiRequest(`/audits/${id}`)
      .then((data) => {
        setAudit(data.audit);
        setProgressForm({
          confirmedMonthlySavings: data.audit.confirmedMonthlySavings || '',
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

  return (
    <main className="container-page py-10 print:py-0">
      <section className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="label text-yellow-300">Audit report</p>
          <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">{audit.companyName}</h1>
          <p className="mt-3 text-sm font-semibold text-zinc-500">
            {audit.businessType} | {audit.productType || 'AI product'} | {audit.teamSize} team members
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row print:hidden">
          <button type="button" onClick={exportPdf} className="btn-primary">Export PDF</button>
          <Link to="/audits/new" className="btn-secondary">Create another audit</Link>
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
          <p className="label text-sky-200">Audit intake</p>
          <div className="mt-4 grid gap-3">
            {[
              ['Product type', audit.productType || 'Not provided'],
              ['Monthly active users', audit.monthlyActiveUsers ? audit.monthlyActiveUsers.toLocaleString('en-IN') : 'Not provided'],
              ['Monthly AI requests', audit.monthlyRequests ? audit.monthlyRequests.toLocaleString('en-IN') : 'Not provided'],
              ['Data source', audit.dataSource || 'Not provided'],
              ['Cost concern', audit.costConcern || audit.notes || 'Not provided']
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-black/20 p-3">
                <p className="label">{label}</p>
                <p className="mt-1 text-sm font-bold leading-relaxed text-zinc-300">{value}</p>
              </div>
            ))}
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
              No waste findings were stored for this older report. Create a new audit to use the upgraded detector.
            </p>
          )}
        </div>
      </section>

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
                    <p className="mt-1 text-xs font-semibold text-zinc-500">
                      {tool.monthlyRequests ? `${tool.monthlyRequests.toLocaleString('en-IN')} requests` : 'Request volume unknown'}
                      {' | '}
                      {tool.avgTokens ? `${tool.avgTokens.toLocaleString('en-IN')} avg tokens` : 'Tokens unknown'}
                      {' | '}
                      {tool.modelTier || 'unknown'} tier
                      {' | '}
                      {tool.caching || 'unknown'} caching
                    </p>
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

        <form onSubmit={saveProgress} className="mt-5 grid gap-4 border-t border-white/10 pt-5 lg:grid-cols-[220px_minmax(0,1fr)_auto] lg:items-end print:hidden">
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
            <span className="label">Implementation notes</span>
            <input
              className="input"
              value={progressForm.implementationNotes}
              onChange={(event) => setProgressForm({ ...progressForm, implementationNotes: event.target.value })}
              placeholder="What changed after the audit?"
            />
          </label>
          <button type="submit" disabled={savingProgress} className="btn-primary">
            {savingProgress ? 'Saving...' : 'Save Progress'}
          </button>
        </form>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            ['Before cleanup', audit.monthlySpend],
            ['Estimated after fixes', audit.spendAfterCleanup],
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
  );
}
