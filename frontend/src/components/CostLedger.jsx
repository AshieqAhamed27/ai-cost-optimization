import React from 'react';
import { formatCurrency } from '../utils/api';

const textOrDash = (value) => String(value || '').trim() || '-';

export default function CostLedger({ tools = [], compact = false }) {
  if (!tools.length) return null;

  return (
    <section className={compact ? '' : 'panel'}>
      {!compact && (
        <div className="mb-5">
          <p className="label text-sky-300">Cost ledger</p>
          <h2 className="mt-2 text-2xl font-black text-white">Provider, workflow, customer, and owner view</h2>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-[860px] w-full border-separate border-spacing-y-2 text-left">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <th className="px-3 py-2">Provider</th>
              <th className="px-3 py-2">Model / service</th>
              <th className="px-3 py-2">Feature / workflow</th>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Requests</th>
              <th className="px-3 py-2">Tokens</th>
              <th className="px-3 py-2">Owner</th>
              <th className="px-3 py-2 text-right">Monthly cost</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((tool, index) => (
              <tr key={`${tool.name}-${index}`} className="rounded-lg bg-black/20 text-sm font-bold text-zinc-300">
                <td className="rounded-l-lg px-3 py-3">{textOrDash(tool.provider)}</td>
                <td className="px-3 py-3">
                  <p className="font-black text-white">{tool.modelName || tool.name}</p>
                  <p className="mt-1 text-xs text-zinc-600">{tool.category || 'Cost line'}</p>
                </td>
                <td className="px-3 py-3">{textOrDash(tool.workflow)}</td>
                <td className="px-3 py-3">{textOrDash(tool.customer)}</td>
                <td className="px-3 py-3">{tool.monthlyRequests ? Number(tool.monthlyRequests).toLocaleString('en-IN') : '-'}</td>
                <td className="px-3 py-3">{tool.avgTokens ? Number(tool.avgTokens).toLocaleString('en-IN') : '-'}</td>
                <td className="px-3 py-3">{textOrDash(tool.owner)}</td>
                <td className="rounded-r-lg px-3 py-3 text-right font-black text-emerald-200">{formatCurrency(tool.monthlyCost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
