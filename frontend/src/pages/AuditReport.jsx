import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReportAgent from '../components/ReportAgent';
import { apiRequest, formatCurrency } from '../utils/api';

export default function AuditReport() {
  const { id } = useParams();
  const [audit, setAudit] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest(`/audits/${id}`)
      .then((data) => setAudit(data.audit))
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return <main className="container-page py-10"><p className="panel text-red-100">{error}</p></main>;
  }

  if (!audit) {
    return <main className="container-page py-10"><p className="panel">Loading report...</p></main>;
  }

  return (
    <main className="container-page py-10">
      <section className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="label text-yellow-300">Audit report</p>
          <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">{audit.companyName}</h1>
          <p className="mt-3 text-sm font-semibold text-zinc-500">{audit.businessType} | {audit.teamSize} team members</p>
        </div>
        <Link to="/audits/new" className="btn-secondary">Create another audit</Link>
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

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.55fr)]">
        <div className="panel">
          <p className="label text-sky-300">Cost lines checked</p>
          <div className="mt-5 grid gap-3">
            {audit.tools.map((tool, index) => (
              <div key={`${tool.name}-${index}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black text-white">{tool.name}</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-600">{tool.category || 'Cost line'} | {tool.usage} usage | {tool.seats} units</p>
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

      <div className="mt-8">
        <ReportAgent audit={audit} />
      </div>
    </main>
  );
}
