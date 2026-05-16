import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { apiRequest, formatCurrency, getPlanName, getUser, hasActivePlan, isEarlyAccessActive, isTrialActive } from '../utils/api';

export default function Dashboard() {
  const user = getUser();
  const [data, setData] = useState({ stats: null, audits: [], facets: {} });
  const [filters, setFilters] = useState({
    department: '',
    region: '',
    costCenter: '',
    owner: '',
    riskLevel: '',
    status: '',
    reviewCadence: '',
    search: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => String(value || '').trim())
    );
    setLoading(true);
    apiRequest(`/audits/stats${params.toString() ? `?${params}` : ''}`)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filters]);

  const stats = data.stats || {};
  const planActive = hasActivePlan(user);
  const earlyAccessActive = isEarlyAccessActive(user);
  const trialActive = isTrialActive(user);
  const facets = data.facets || {};
  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };
  const clearFilters = () => {
    setFilters({
      department: '',
      region: '',
      costCenter: '',
      owner: '',
      riskLevel: '',
      status: '',
      reviewCadence: '',
      search: ''
    });
  };

  return (
    <main className="container-page py-10">
      <section className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="label text-yellow-300">Dashboard</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">
            Good to see you, {user?.name || 'Operator'}
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-zinc-500">
            Manage AI cost governance reports, savings estimates, owners, and engineering-ready recommendations.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ['Role', user?.accessRole || 'admin'],
              ['Organization', user?.organizationName || user?.companyName || 'Default'],
              ['Department', user?.department || 'Unassigned'],
              ['Region', user?.region || 'Global']
            ].map(([label, value]) => (
              <span key={label} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black uppercase tracking-widest text-zinc-300">
                {label}: {value}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to={planActive ? '/audits/new' : '/pricing'} className="btn-primary">{planActive ? 'New Report' : 'Start Pilot'}</Link>
          <Link to="/pricing" className="btn-secondary">{planActive ? getPlanName(user.activePlan) : 'Pricing'}</Link>
        </div>
      </section>

      {error && <p className="mb-6 rounded-2xl border border-red-300/20 bg-red-300/10 p-4 text-sm font-bold text-red-100">{error}</p>}

      {earlyAccessActive && (
        <section className="panel mb-8 border-emerald-300/25 bg-emerald-300/[0.07]">
          <p className="label text-emerald-200">Early access active</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Governance reports are free for pilot users right now.</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-zinc-400">
                Use the product with real AI spend data. Payments remain built in for future paid plans, but they are not required for the pilot.
              </p>
            </div>
            <Link to="/audits/new" className="btn-primary shrink-0">Create Report</Link>
          </div>
        </section>
      )}

      {!earlyAccessActive && trialActive && (
        <section className="panel mb-8 border-emerald-300/25 bg-emerald-300/[0.07]">
          <p className="label text-emerald-200">Free access active</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">You can create reports during free pilot access.</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-zinc-400">
                Pilot access is available now, and paid plans can be enabled later without changing your workflow.
              </p>
            </div>
            <Link to="/audits/new" className="btn-primary shrink-0">Create Report</Link>
          </div>
        </section>
      )}

      {!planActive && (
        <section className="panel mb-8 border-yellow-300/25 bg-yellow-300/[0.07]">
          <p className="label text-yellow-200">Access required</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Start a free pilot to unlock report creation.</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-zinc-400">
                Pilot users can use the governance workflow for free. Payment stays in the product for future paid plans.
              </p>
            </div>
            <Link to="/pricing" className="btn-primary shrink-0">Start Pilot</Link>
          </div>
        </section>
      )}

      <section className="panel mb-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="label text-sky-200">Enterprise filters</p>
            <h2 className="mt-2 text-2xl font-black text-white">Slice reports by team, region, owner, status, or risk.</h2>
          </div>
          <button type="button" onClick={clearFilters} className="btn-secondary px-4 py-2">Clear Filters</button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-2">
            <span className="label">Search</span>
            <input className="input" value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Company, vendor, workflow" />
          </label>
          {[
            ['department', 'Department', facets.departments || []],
            ['region', 'Region', facets.regions || []],
            ['costCenter', 'Cost center', facets.costCenters || []],
            ['owner', 'Owner', facets.owners || []],
            ['riskLevel', 'Risk', facets.riskLevels || []],
            ['status', 'Status', facets.statuses || []],
            ['reviewCadence', 'Cadence', facets.reviewCadences || []]
          ].map(([field, label, options]) => (
            <label key={field} className="grid gap-2">
              <span className="label">{label}</span>
              <select className="input" value={filters[field]} onChange={(event) => updateFilter(field, event.target.value)}>
                <option value="">All</option>
                {options.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Reports" value={loading ? '...' : stats.totalAudits || 0} detail="Governance reports created in your workspace" />
        <StatCard label="Monthly spend checked" value={loading ? '...' : formatCurrency(stats.monthlySpend)} detail="AI API and infrastructure spend reviewed" />
        <StatCard label="Possible monthly savings" value={loading ? '...' : formatCurrency(stats.possibleMonthlySavings)} detail="Estimated waste the company can reduce" />
        <StatCard label="Possible yearly savings" value={loading ? '...' : formatCurrency(stats.yearlySavings)} detail="Annualized opportunity from governance reports" />
        <StatCard label="Confirmed savings" value={loading ? '...' : formatCurrency(stats.confirmedMonthlySavings)} detail="Monthly savings recorded after implementation" />
        <StatCard label="Actions done" value={loading ? '...' : `${stats.actionCompletionRate || 0}%`} detail="Before and after plan completion" />
        <StatCard label="Budget alerts" value={loading ? '...' : stats.activeAlerts || 0} detail="Reports with active spend warnings" />
        <StatCard label="Budget tracked" value={loading ? '...' : formatCurrency(stats.monthlyBudget)} detail="Monthly budget entered across workspaces" />
        <StatCard label="Pending approvals" value={loading ? '...' : stats.approvalSummary?.pending || 0} detail="Finance, engineering, or leadership approvals waiting" />
        <StatCard label="Due reviews" value={loading ? '...' : stats.dueReviews || 0} detail="Recurring governance reviews ready for follow-up" />
        <StatCard label="Verified proof" value={loading ? '...' : stats.proofSummary?.verifiedReports || 0} detail="Reports with savings evidence reviewed" />
        <StatCard label="Case studies" value={loading ? '...' : stats.proofSummary?.caseStudyApproved || 0} detail="Proof approved for public customer use" />
        <StatCard label="Imported evidence" value={loading ? '...' : stats.proofSummary?.importBatches || 0} detail="Billing or usage exports attached to reports" />
        <StatCard label="Pilot feedback" value={loading ? '...' : stats.proofSummary?.pilotFeedback || 0} detail="Customer reviews captured for market proof" />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <p className="label text-emerald-200">Departments</p>
          <div className="mt-4 grid gap-3">
            {(data.departments || []).slice(0, 5).map((item) => (
              <div key={item.name} className="rounded-lg border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black text-white">{item.name}</p>
                  <p className="text-sm font-black text-emerald-200">{formatCurrency(item.possibleMonthlySavings)} savings</p>
                </div>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-zinc-600">{item.reports} reports | {formatCurrency(item.monthlySpend)} spend</p>
              </div>
            ))}
            {!(data.departments || []).length && <p className="text-sm font-semibold text-zinc-500">No department data yet.</p>}
          </div>
        </div>

        <div className="panel">
          <p className="label text-sky-200">Regions</p>
          <div className="mt-4 grid gap-3">
            {(data.regions || []).slice(0, 5).map((item) => (
              <div key={item.name} className="rounded-lg border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black text-white">{item.name}</p>
                  <p className="text-sm font-black text-emerald-200">{formatCurrency(item.possibleMonthlySavings)} savings</p>
                </div>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-zinc-600">{item.reports} reports | {formatCurrency(item.monthlySpend)} spend</p>
              </div>
            ))}
            {!(data.regions || []).length && <p className="text-sm font-semibold text-zinc-500">No region data yet.</p>}
          </div>
        </div>
      </section>

      {data.workspaces?.length > 0 && (
        <section className="panel mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="label text-emerald-200">Client workspaces</p>
              <h2 className="mt-2 text-2xl font-black text-white">Spend by workspace or client</h2>
            </div>
            <Link to={planActive ? '/audits/new' : '/pricing'} className="btn-secondary">{planActive ? 'Add workspace report' : 'Unlock reports'}</Link>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.workspaces.map((workspace) => (
              <article key={workspace.name} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="font-black text-white">{workspace.name}</p>
                <p className="mt-2 text-sm font-semibold text-zinc-500">{workspace.audits} reports</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="label">Spend</p>
                    <p className="mt-1 font-black text-white">{formatCurrency(workspace.monthlySpend)}</p>
                  </div>
                  <div>
                    <p className="label">Savings</p>
                    <p className="mt-1 font-black text-emerald-200">{formatCurrency(workspace.possibleMonthlySavings)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="panel mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
              <p className="label text-sky-300">Governance reports</p>
            <h2 className="mt-2 text-2xl font-black text-white">Recent reports</h2>
          </div>
          <Link to={planActive ? '/audits/new' : '/pricing'} className="btn-secondary">{planActive ? 'Create report' : 'Unlock reports'}</Link>
        </div>

        <div className="mt-6 grid gap-3">
          {!loading && data.audits.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center">
              <p className="text-lg font-black text-white">No reports yet.</p>
              <p className="mt-2 text-sm font-semibold text-zinc-500">Create your first governance report and turn real spend data into decisions.</p>
            </div>
          )}
          {data.audits.map((audit) => (
            <Link key={audit._id} to={`/audits/${audit._id}`} className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-yellow-300/30 hover:bg-white/[0.05]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-black text-white">{audit.companyName}</p>
                  <p className="text-sm font-semibold text-zinc-500">
                    {[audit.workspaceName, audit.businessType, `${audit.riskLevel || 'Medium'} risk`, `${audit.tools?.length || 0} cost lines checked`].filter(Boolean).join(' | ')}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-black text-emerald-200">{formatCurrency(audit.possibleMonthlySavings)} possible monthly savings</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-600">
                    {audit.confirmedMonthlySavings ? `${formatCurrency(audit.confirmedMonthlySavings)} confirmed | ` : ''}{audit.importBatches?.length ? `${audit.importBatches.length} imports | ` : ''}{audit.proof?.status ? `${audit.proof.status.replace(/_/g, ' ')} proof | ` : ''}{audit.status}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
