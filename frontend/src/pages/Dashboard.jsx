import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { apiRequest, formatCurrency, getPlanName, getUser, hasActivePlan, isEarlyAccessActive, isTrialActive } from '../utils/api';

export default function Dashboard() {
  const user = getUser();
  const [data, setData] = useState({ stats: null, audits: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/audits/stats')
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = data.stats || {};
  const planActive = hasActivePlan(user);
  const earlyAccessActive = isEarlyAccessActive(user);
  const trialActive = isTrialActive(user);

  return (
    <main className="container-page py-10">
      <section className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="label text-yellow-300">Dashboard</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">
            Good to see you, {user?.name || 'Founder'}
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-zinc-500">
            Manage AI usage cost reports, savings estimates, and engineering-ready recommendations.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to={planActive ? '/audits/new' : '/pricing'} className="btn-primary">{planActive ? 'New Audit' : 'Start Free'}</Link>
          <Link to="/pricing" className="btn-secondary">{planActive ? getPlanName(user.activePlan) : 'Pricing'}</Link>
        </div>
      </section>

      {error && <p className="mb-6 rounded-2xl border border-red-300/20 bg-red-300/10 p-4 text-sm font-bold text-red-100">{error}</p>}

      {earlyAccessActive && (
        <section className="panel mb-8 border-emerald-300/25 bg-emerald-300/[0.07]">
          <p className="label text-emerald-200">Early access active</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Reports are free for early users right now.</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-zinc-400">
                Use the product with real AI spend data. Payments remain built in for future paid plans, but they are not required for early access.
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
              <h2 className="text-2xl font-black text-white">You can create reports during free access.</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-zinc-400">
                Early access is available now, and paid plans can be enabled later without changing your workflow.
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
              <h2 className="text-2xl font-black text-white">Start free early access to unlock report creation.</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-zinc-400">
                Early users can use the audit workflow for free. Payment stays in the product for future paid plans.
              </p>
            </div>
            <Link to="/pricing" className="btn-primary shrink-0">Start Free</Link>
          </div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Audits" value={loading ? '...' : stats.totalAudits || 0} detail="Reports created in your workspace" />
        <StatCard label="Monthly spend checked" value={loading ? '...' : formatCurrency(stats.monthlySpend)} detail="AI API and infrastructure spend reviewed" />
        <StatCard label="Possible monthly savings" value={loading ? '...' : formatCurrency(stats.possibleMonthlySavings)} detail="Estimated waste you can help clients reduce" />
        <StatCard label="Possible yearly savings" value={loading ? '...' : formatCurrency(stats.yearlySavings)} detail="Annualized opportunity from audit reports" />
        <StatCard label="Confirmed savings" value={loading ? '...' : formatCurrency(stats.confirmedMonthlySavings)} detail="Monthly savings recorded after implementation" />
        <StatCard label="Actions done" value={loading ? '...' : `${stats.actionCompletionRate || 0}%`} detail="Before and after plan completion" />
      </section>

      <section className="panel mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="label text-sky-300">Audit reports</p>
            <h2 className="mt-2 text-2xl font-black text-white">Recent audits</h2>
          </div>
          <Link to={planActive ? '/audits/new' : '/pricing'} className="btn-secondary">{planActive ? 'Create report' : 'Unlock reports'}</Link>
        </div>

        <div className="mt-6 grid gap-3">
          {!loading && data.audits.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center">
              <p className="text-lg font-black text-white">No audits yet.</p>
              <p className="mt-2 text-sm font-semibold text-zinc-500">Create your first client audit and turn real spend data into a report.</p>
            </div>
          )}
          {data.audits.map((audit) => (
            <Link key={audit._id} to={`/audits/${audit._id}`} className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-yellow-300/30 hover:bg-white/[0.05]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-black text-white">{audit.companyName}</p>
                  <p className="text-sm font-semibold text-zinc-500">
                    {audit.businessType} | {audit.riskLevel || 'Medium'} risk | {audit.tools?.length || 0} cost lines checked
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-black text-emerald-200">{formatCurrency(audit.possibleMonthlySavings)} possible monthly savings</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-600">
                    {audit.confirmedMonthlySavings ? `${formatCurrency(audit.confirmedMonthlySavings)} confirmed | ` : ''}{audit.status}
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
