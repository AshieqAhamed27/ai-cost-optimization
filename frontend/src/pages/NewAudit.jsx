import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuditAgent from '../components/AuditAgent';
import BudgetAlerts from '../components/BudgetAlerts';
import CostLedger from '../components/CostLedger';
import ToolEditor, { createBlankTool } from '../components/ToolEditor';
import UnitEconomicsPanel from '../components/UnitEconomicsPanel';
import UsageImport from '../components/UsageImport';
import { calculateAuditPreview } from '../utils/auditInsights';
import { apiRequest, formatCurrency, getUser, hasActivePlan } from '../utils/api';

export default function NewAudit() {
  const navigate = useNavigate();
  const user = getUser();
  const planActive = hasActivePlan(user);
  const [form, setForm] = useState({
    companyName: '',
    organizationName: user?.organizationName || user?.companyName || '',
    department: user?.department || '',
    region: user?.region || '',
    costCenter: '',
    businessType: '',
    workspaceName: '',
    productType: '',
    teamSize: 1,
    monthlyActiveUsers: '',
    monthlyRequests: '',
    monthlyBudget: '',
    targetSavingsRate: '',
    costConcern: '',
    dataSource: '',
    reviewCadence: 'monthly',
    hasCaching: 'unknown',
    hasModelRouting: 'unknown',
    hasUsageLimits: 'unknown',
    hasCostAttribution: 'unknown',
    notes: ''
  });
  const [tools, setTools] = useState([createBlankTool()]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const preview = useMemo(() => calculateAuditPreview({ tools, form }), [tools, form]);

  const importTools = (importedTools) => {
    setTools((current) => {
      const existing = current.filter((tool) => tool.name.trim());
      return [...existing, ...importedTools];
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (!planActive) {
      setError('Start the free pilot before creating governance reports.');
      return;
    }

    const filledTools = tools.filter((tool) => tool.name.trim());
    if (!filledTools.length) {
      setError('Add at least one AI cost line before creating a report.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest('/audits', {
        method: 'POST',
        body: { ...form, tools: filledTools }
      });
      navigate(`/audits/${data.audit._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!planActive) {
    return (
      <main className="container-page py-10">
        <section className="panel border-yellow-300/25 bg-yellow-300/[0.07]">
          <p className="label text-yellow-200">Pilot access required</p>
          <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">Unlock governance report creation.</h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-zinc-400">
            Start the free pilot to create reports now. Payment remains built in for future paid plans, but pilot users are free.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/pricing" className="btn-primary">Start Free Pilot</Link>
            <Link to="/dashboard" className="btn-secondary">Back to Dashboard</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="container-page py-10">
      <section className="mb-8">
        <p className="label text-yellow-300">New governance report</p>
        <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">Create AI cost control report</h1>
        <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-zinc-500">
          Enter real model API, vector database, cloud inference, observability, ownership, budget, or workflow cost lines to generate a leadership-ready report.
        </p>
      </section>

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.5fr)]">
        <section className="panel">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="label">Company name</span>
              <input className="input" value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} required />
            </label>
            <label className="grid gap-2">
              <span className="label">Organization</span>
              <input className="input" value={form.organizationName} onChange={(event) => setForm({ ...form, organizationName: event.target.value })} placeholder="Parent company or group" />
            </label>
            <label className="grid gap-2">
              <span className="label">Business type</span>
              <input className="input" value={form.businessType} onChange={(event) => setForm({ ...form, businessType: event.target.value })} required />
            </label>
            <label className="grid gap-2">
              <span className="label">Department</span>
              <input className="input" value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} placeholder="Finance, product, support" />
            </label>
            <label className="grid gap-2">
              <span className="label">Region</span>
              <input className="input" value={form.region} onChange={(event) => setForm({ ...form, region: event.target.value })} placeholder="Global, India, US, EMEA" />
            </label>
            <label className="grid gap-2">
              <span className="label">Cost center</span>
              <input className="input" value={form.costCenter} onChange={(event) => setForm({ ...form, costCenter: event.target.value })} placeholder="AI-OPS-01" />
            </label>
            <label className="grid gap-2">
              <span className="label">Workspace / client</span>
              <input className="input" value={form.workspaceName} onChange={(event) => setForm({ ...form, workspaceName: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <span className="label">Product type</span>
              <select className="input" value={form.productType} onChange={(event) => setForm({ ...form, productType: event.target.value })}>
                <option value="">Select product type</option>
                <option value="AI SaaS">AI SaaS</option>
                <option value="AI agent workflow">AI agent workflow</option>
                <option value="Internal automation">Internal automation</option>
                <option value="Customer support assistant">Customer support assistant</option>
                <option value="Developer tool">Developer tool</option>
                <option value="AI agency service">AI agency service</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="label">Team size</span>
              <input className="input" type="number" min="1" value={form.teamSize} onChange={(event) => setForm({ ...form, teamSize: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <span className="label">Monthly active users</span>
              <input className="input" type="number" min="0" value={form.monthlyActiveUsers} onChange={(event) => setForm({ ...form, monthlyActiveUsers: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <span className="label">Monthly AI requests</span>
              <input className="input" type="number" min="0" value={form.monthlyRequests} onChange={(event) => setForm({ ...form, monthlyRequests: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <span className="label">Monthly budget</span>
              <input className="input" type="number" min="0" value={form.monthlyBudget} onChange={(event) => setForm({ ...form, monthlyBudget: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <span className="label">Target savings %</span>
              <input className="input" type="number" min="0" max="90" value={form.targetSavingsRate} onChange={(event) => setForm({ ...form, targetSavingsRate: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <span className="label">Data source</span>
              <select className="input" value={form.dataSource} onChange={(event) => setForm({ ...form, dataSource: event.target.value })}>
                <option value="">Select source</option>
                <option value="Billing screenshot">Billing screenshot</option>
                <option value="Provider export">Provider export</option>
                <option value="Manual estimate">Manual estimate</option>
                <option value="Invoice">Invoice</option>
                <option value="Usage logs">Usage logs</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="label">Review cadence</span>
              <select className="input" value={form.reviewCadence} onChange={(event) => setForm({ ...form, reviewCadence: event.target.value })}>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="none">One-time</option>
              </select>
            </label>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="label">Biggest cost concern</span>
              <textarea className="input min-h-28 resize-y" value={form.costConcern} onChange={(event) => setForm({ ...form, costConcern: event.target.value })} placeholder="Describe the cost problem or billing concern" />
            </label>
            <label className="grid gap-2">
              <span className="label">Governance notes</span>
              <textarea className="input min-h-28 resize-y" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Workflow, traffic pattern, architecture detail, or billing context" />
            </label>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="label text-emerald-200">Cost control maturity</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['hasCaching', 'Caching'],
                ['hasModelRouting', 'Model routing'],
                ['hasUsageLimits', 'Usage limits'],
                ['hasCostAttribution', 'Cost attribution']
              ].map(([field, label]) => (
                <label key={field} className="grid gap-2">
                  <span className="label">{label}</span>
                  <select className="input" value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })}>
                    <option value="unknown">Unknown</option>
                    <option value="yes">Yes</option>
                    <option value="partial">Partial</option>
                    <option value="no">No</option>
                  </select>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="label text-sky-300">AI cost lines</p>
            <div className="mt-4">
              <UsageImport onImport={importTools} />
            </div>
            <div className="mt-4">
              <ToolEditor tools={tools} setTools={setTools} />
            </div>
          </div>
        </section>

        <div className="grid h-fit gap-6">
          <aside className="panel border-emerald-300/20 bg-emerald-300/[0.07]">
            <p className="label text-emerald-200">Live preview</p>
            <div className="mt-5 grid gap-3">
              {[
                ['Monthly AI and infra spend', preview.monthlySpend],
                ['Possible monthly savings', preview.savings],
                ['Spend after cleanup', preview.afterCleanup],
                ['Possible yearly savings', preview.yearlySavings]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="label">{label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{formatCurrency(value)}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="label text-yellow-200">Waste detector</p>
                <span className="rounded-lg border border-white/10 bg-white/[0.06] px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                  {preview.riskLevel} risk
                </span>
              </div>
              <div className="mt-3 grid gap-2">
                {preview.wasteFindings.length === 0 && (
                  <p className="text-sm font-semibold leading-relaxed text-zinc-500">
                    Add cost lines and control details to detect waste patterns.
                  </p>
                )}
                {preview.wasteFindings.slice(0, 4).map((finding) => (
                  <div key={finding.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-black text-white">{finding.title}</p>
                      <p className="text-xs font-black text-emerald-200">{formatCurrency(finding.estimatedSavings)}</p>
                    </div>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">{finding.category} | {finding.impact}</p>
                  </div>
                ))}
              </div>
            </div>
            {error && <p className="mt-4 rounded-2xl border border-red-300/20 bg-red-300/10 p-3 text-sm font-bold text-red-100">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary mt-5 w-full">
              {loading ? 'Creating...' : 'Create Governance Report'}
            </button>
          </aside>

          <AuditAgent form={form} tools={tools} preview={preview} />
        </div>
      </form>

      <div className="mt-8 grid gap-6">
        <BudgetAlerts alerts={preview.budgetAlerts} />
        <UnitEconomicsPanel economics={preview.unitEconomics} monthlySpend={preview.monthlySpend} />
        <CostLedger tools={tools.filter((tool) => tool.name.trim())} />
      </div>
    </main>
  );
}
