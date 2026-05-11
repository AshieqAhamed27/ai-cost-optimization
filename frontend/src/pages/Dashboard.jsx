import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { apiRequest, formatCurrency, getUser } from '../utils/api';

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

  return (
    <main className="container-page py-10">
      <section className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="label text-yellow-300">Dashboard</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">
            Good to see you, {user?.name || 'Founder'}
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-zinc-500">
            Create AI cost audits, estimate savings, and convert reports into paid services.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/audits/new" className="btn-primary">New Audit</Link>
          <Link to="/pricing" className="btn-secondary">Upgrade</Link>
        </div>
      </section>

      {error && <p className="mb-6 rounded-2xl border border-red-300/20 bg-red-300/10 p-4 text-sm font-bold text-red-100">{error}</p>}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Audits" value={loading ? '...' : stats.totalAudits || 0} detail="Reports created in your workspace" />
        <StatCard label="Monthly spend checked" value={loading ? '...' : formatCurrency(stats.monthlySpend)} detail="AI and software spend reviewed" />
        <StatCard label="Possible monthly savings" value={loading ? '...' : formatCurrency(stats.possibleMonthlySavings)} detail="Estimated waste you can help clients reduce" />
        <StatCard label="Possible yearly savings" value={loading ? '...' : formatCurrency(stats.yearlySavings)} detail="Annualized opportunity from audit reports" />
      </section>

      <section className="panel mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="label text-sky-300">Audit reports</p>
            <h2 className="mt-2 text-2xl font-black text-white">Recent audits</h2>
          </div>
          <Link to="/audits/new" className="btn-secondary">Create report</Link>
        </div>

        <div className="mt-6 grid gap-3">
          {!loading && data.audits.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center">
              <p className="text-lg font-black text-white">No audits yet.</p>
              <p className="mt-2 text-sm font-semibold text-zinc-500">Create a demo audit and use it to sell your first service.</p>
            </div>
          )}
          {data.audits.map((audit) => (
            <Link key={audit._id} to={`/audits/${audit._id}`} className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-yellow-300/30 hover:bg-white/[0.05]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-black text-white">{audit.companyName}</p>
                  <p className="text-sm font-semibold text-zinc-500">{audit.businessType} | {audit.tools?.length || 0} tools checked</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-black text-emerald-200">{formatCurrency(audit.possibleMonthlySavings)} possible monthly savings</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-600">{audit.status}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

