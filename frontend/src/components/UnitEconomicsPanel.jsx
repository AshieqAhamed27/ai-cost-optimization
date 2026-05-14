import React from 'react';
import { formatCurrency } from '../utils/api';

const formatUnitMoney = (value) => {
  const number = Number(value || 0);
  if (number > 0 && number < 1) return `Rs ${number.toFixed(4)}`;
  if (number > 0 && number < 100) return `Rs ${number.toFixed(2)}`;
  return formatCurrency(number);
};

export default function UnitEconomicsPanel({ economics = {}, monthlySpend = 0 }) {
  const items = [
    ['Cost / active user', economics.costPerActiveUser],
    ['Cost / AI request', economics.costPerRequest],
    ['Top workflow', economics.topWorkflowCost, economics.topWorkflow],
    ['Top customer', economics.topCustomerCost, economics.topCustomer],
    ['Unattributed spend', economics.unattributedSpend]
  ];

  if (!monthlySpend) return null;

  return (
    <section className="panel border-sky-300/20 bg-sky-300/[0.05]">
      <p className="label text-sky-200">Unit economics</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {items.map(([label, value, detail]) => (
          <article key={label} className="rounded-lg border border-white/10 bg-black/20 p-4">
            <p className="label">{label}</p>
            <p className="mt-2 text-xl font-black text-white">{formatUnitMoney(value)}</p>
            {detail && <p className="mt-1 text-xs font-bold text-zinc-500">{detail}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
