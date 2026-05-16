import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BudgetAlerts from '../components/BudgetAlerts';
import CostLedger from '../components/CostLedger';
import LogoMark from '../components/LogoMark';
import UnitEconomicsPanel from '../components/UnitEconomicsPanel';
import { apiRequest, formatCurrency } from '../utils/api';

export default function PublicReport() {
  const { token } = useParams();
  const [audit, setAudit] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest(`/audits/shared/${token}`)
      .then((data) => setAudit(data.audit))
      .catch((err) => setError(err.message));
  }, [token]);

  if (error) {
    return (
      <main className="container-page py-10">
        <section className="panel">
          <p className="label text-red-100">Shared report</p>
          <h1 className="mt-3 text-3xl font-black text-white">Report unavailable</h1>
          <p className="mt-3 text-sm font-semibold text-zinc-500">{error}</p>
          <Link to="/" className="btn-secondary mt-5">Back Home</Link>
        </section>
      </main>
    );
  }

  if (!audit) {
    return <main className="container-page py-10"><p className="panel">Loading shared report...</p></main>;
  }

  const savingsRate = audit.monthlySpend
    ? Math.round((audit.possibleMonthlySavings / audit.monthlySpend) * 100)
    : 0;

  return (
    <main className="container-page py-10">
      <section className="mb-8 flex flex-col gap-5 rounded-lg border border-white/10 bg-white/[0.04] p-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark className="h-11 w-11 shrink-0 rounded-lg" />
            <div>
              <p className="label text-emerald-200">Shared SpendGuard governance report</p>
              <h1 className="text-4xl font-black text-white md:text-5xl">{audit.companyName}</h1>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm font-semibold leading-relaxed text-zinc-400">
            {audit.workspaceName || audit.businessType} cost governance review with {formatCurrency(audit.possibleMonthlySavings)} possible monthly savings and {audit.riskLevel || 'Medium'} risk profile.
          </p>
        </div>
        <button type="button" onClick={() => window.print()} className="btn-primary print:hidden">Export PDF</button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Monthly spend', audit.monthlySpend],
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

      <section className="panel mt-8 border-emerald-300/20 bg-emerald-300/[0.06]">
        <p className="label text-emerald-200">Executive summary</p>
        <h2 className="mt-3 text-3xl font-black text-white">
          {savingsRate}% possible reduction opportunity before validation.
        </h2>
        <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
          This report highlights AI API and infrastructure waste patterns, budget risks, unit economics, ownership gaps, and recommended cost-control actions. Editing access remains private to the report owner.
        </p>
      </section>

      <div className="mt-8 grid gap-6">
        <BudgetAlerts alerts={audit.budgetAlerts || []} />
        <UnitEconomicsPanel economics={audit.unitEconomics} monthlySpend={audit.monthlySpend} />
        <CostLedger tools={audit.tools || []} />
      </div>

      <section className="panel mt-8">
        <p className="label text-red-100">Cost waste findings</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {(audit.wasteFindings || []).map((finding) => (
            <article key={finding.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="font-black text-white">{finding.title}</p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-400">{finding.detail}</p>
              <p className="mt-3 text-sm font-black text-emerald-200">{formatCurrency(finding.estimatedSavings)} monthly opportunity</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel mt-8">
        <p className="label text-sky-200">30-day action plan</p>
        <div className="mt-5 grid gap-3">
          {(audit.actionPlan || []).map((item) => (
            <article key={`${item.phase}-${item.title}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="label text-sky-200">{item.phase}</p>
              <h3 className="mt-2 font-black text-white">{item.title}</h3>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-400">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
