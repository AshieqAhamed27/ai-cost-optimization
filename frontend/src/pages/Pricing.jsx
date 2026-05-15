import React from 'react';
import PricingCards, { defaultPlans } from '../components/PricingCards';
import TrialCallout from '../components/TrialCallout';
import { formatCurrency } from '../utils/api';

const steps = [
  ['Add real spend lines', 'Enter provider bills, usage exports, model costs, vector storage, logs, cloud inference, and workflow details.'],
  ['Find the highest-value leaks', 'See ranked waste findings, estimated monthly savings, budget risk, unit economics, and recommended fixes.'],
  ['Prove the outcome', 'Track actions, record confirmed savings, export a PDF, and share a private report without giving account access.']
];

const worthPaying = [
  ['Monthly AI spend is rising', 'Useful when OpenAI, Anthropic, Gemini, vector DB, cloud inference, or observability spend is becoming hard to explain.'],
  ['You need engineering-ready fixes', 'Useful when founders, finance, and engineers need one ranked action plan instead of vague cost advice.'],
  ['You sell AI features to customers', 'Useful when gross margin matters and you need to know cost per user, request, workflow, or client.']
];

const notFor = [
  'You have no meaningful AI API or infrastructure spend yet.',
  'You only want generic finance bookkeeping instead of AI usage analysis.',
  'You cannot provide even rough spend lines, invoices, exports, or usage estimates.'
];

export default function Pricing() {
  const breakEvenRows = defaultPlans.map((plan) => [
    plan.name,
    formatCurrency(plan.amount),
    `Find at least ${formatCurrency(plan.amount)} avoidable monthly waste to cover the fee in one month.`
  ]);

  return (
    <main className="container-page py-10 md:py-16">
      <section className="mb-10 text-center">
        <p className="label text-yellow-300">Pricing</p>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-black text-white md:text-6xl">
          Pay for savings clarity, not another unused dashboard.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-relaxed text-zinc-400">
          Early access is free right now. Paid plans are designed to feel worth it only when SpendGuard helps identify avoidable AI spend, prioritize fixes, and prove what changed after implementation.
        </p>
      </section>

      <section className="mb-8">
        <TrialCallout />
      </section>

      <section className="mb-10 grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(300px,0.45fr)]">
        <div className="panel border-emerald-300/20 bg-emerald-300/[0.06]">
          <p className="label text-emerald-200">Worth Paying When</p>
          <h2 className="mt-3 text-3xl font-black text-white">
            The product pays for itself by finding a leak you can actually fix.
          </h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {worthPaying.map(([title, text]) => (
              <article key={title} className="rounded-lg border border-white/10 bg-black/20 p-4">
                <h3 className="text-base font-black text-white">{title}</h3>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-400">{text}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="panel">
          <p className="label text-red-100">Do Not Pay Yet If</p>
          <div className="mt-4 grid gap-3">
            {notFor.map((item) => (
              <p key={item} className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm font-bold leading-relaxed text-zinc-400">
                {item}
              </p>
            ))}
          </div>
        </aside>
      </section>

      <PricingCards />

      <section className="mt-12 grid gap-4 lg:grid-cols-3">
        {breakEvenRows.map(([plan, price, text]) => (
          <article key={plan} className="rounded-lg border border-yellow-300/20 bg-yellow-300/[0.06] p-5">
            <p className="label text-yellow-200">Break-even check</p>
            <h2 className="mt-2 text-lg font-black text-white">{plan}: {price}</h2>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-400">{text}</p>
          </article>
        ))}
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        {steps.map(([title, text]) => (
          <article key={title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-lg font-black text-white">{title}</h2>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-500">{text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
