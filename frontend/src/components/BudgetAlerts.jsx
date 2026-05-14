import React from 'react';
import { formatCurrency } from '../utils/api';

export default function BudgetAlerts({ alerts = [] }) {
  if (!alerts.length) return null;

  return (
    <section className="panel border-red-300/20 bg-red-300/[0.06]">
      <p className="label text-red-100">Budget alerts</p>
      <div className="mt-4 grid gap-3">
        {alerts.map((alert) => (
          <article key={`${alert.title}-${alert.threshold}`} className="rounded-lg border border-white/10 bg-black/20 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-black text-white">{alert.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-400">{alert.detail}</p>
              </div>
              <span className="rounded-lg border border-red-300/20 bg-red-300/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-red-100">
                {alert.severity}
              </span>
            </div>
            <p className="mt-3 text-xs font-bold text-zinc-500">
              {formatCurrency(alert.currentSpend)} used / {formatCurrency(alert.threshold)} budget
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
