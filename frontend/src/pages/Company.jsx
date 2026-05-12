import React from 'react';
import { Link } from 'react-router-dom';

const companyPillars = [
  ['Cost clarity', 'We turn scattered AI subscriptions and usage notes into a structured spend picture.'],
  ['Revenue workflow', 'Plans, checkout, account status, and report access are connected so every audit starts as paid work.'],
  ['Actionable delivery', 'Each report focuses on what a business can cancel, downgrade, consolidate, or monitor.']
];

const outcomes = [
  'A clear inventory of paid AI tools',
  'Monthly spend and possible yearly savings',
  'Low-usage and unused-seat findings',
  'Duplicate tool and plan-risk notes',
  'Client-ready recommendations',
  'A repeatable monitoring offer for ongoing revenue'
];

const buyers = [
  ['Consultants', 'Sell AI cost audits to clients without building the reporting workflow yourself.'],
  ['Agencies', 'Help clients understand which AI tools are worth keeping and which should be reduced.'],
  ['Businesses', 'Review internal AI software spend before subscription growth becomes hard to control.']
];

export default function Company() {
  return (
    <main>
      <section className="container-page py-12 md:py-16">
        <div className="max-w-4xl">
          <p className="label text-yellow-300">Company</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-white md:text-6xl">
            AI Cost Audit is a business service for controlling AI software spend.
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-semibold leading-relaxed text-zinc-400">
            This is not positioned as a generic AI app. It is a paid audit company that helps teams find waste, document savings opportunities, and turn AI cost control into a repeatable business process.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/pricing" className="btn-primary">Buy Audit Plan</Link>
            <Link to="/security" className="btn-secondary">Review Trust Controls</Link>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-black/15 py-12">
        <div className="container-page grid gap-4 md:grid-cols-3">
          {companyPillars.map(([title, text]) => (
            <article key={title} className="panel">
              <h2 className="text-xl font-black text-white">{title}</h2>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-500">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)]">
          <div>
            <p className="label text-sky-200">Why Customers Pay</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
              The customer pays because the audit can point to avoidable monthly cost.
            </h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
              A business does not need another dashboard for its own sake. It needs a practical report that helps reduce recurring spend and make better buying decisions.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {outcomes.map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm font-bold text-zinc-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page pb-14 md:pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {buyers.map(([title, text]) => (
            <article key={title} className="rounded-lg border border-yellow-300/20 bg-yellow-300/[0.06] p-5">
              <h2 className="text-xl font-black text-white">{title}</h2>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-500">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
