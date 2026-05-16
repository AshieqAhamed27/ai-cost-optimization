import React from 'react';
import { Link } from 'react-router-dom';

const companyPillars = [
  ['Global operating focus', 'We focus on AI API and infrastructure spend control for teams scaling AI across products, departments, regions, and customers.'],
  ['Executive-ready reports', 'Recommendations name the owner, model, token, cache, vector, logging, budget, and infrastructure changes to review.'],
  ['Pilot-to-enterprise workflow', 'Early access, checkout, account status, and report access are connected so the product can become a serious paid governance platform when ready.']
];

const outcomes = [
  'Model provider spend review by product or team',
  'Token and context-size waste findings',
  'Embedding and vector database governance checks',
  'Cloud inference and background job review',
  'Observability and log retention controls',
  'Before and after savings recommendations',
  'Budget ownership and escalation notes',
  'Procurement evidence for vendor negotiations'
];

const buyers = [
  ['Finance leaders', 'Understand why AI product costs are rising before they damage gross margin or vendor leverage.'],
  ['Technology leaders', 'Prioritize cost fixes without turning AI governance into a vague finance exercise.'],
  ['Business units', 'Run assistants, agents, and copilots with clear ownership, budgets, and proof of savings.']
];

const operatingModel = [
  ['Stage 1', 'Capture invoices, exports, screenshots, and cost lines without asking for secret keys.'],
  ['Stage 2', 'Map costs to teams, products, customers, regions, owners, and budget thresholds.'],
  ['Stage 3', 'Approve actions for model routing, caching, context trimming, retention, and usage limits.'],
  ['Stage 4', 'Review savings monthly with executive summaries, PDF exports, and private report links.']
];

export default function Company() {
  return (
    <main>
      <section className="container-page py-12 md:py-16">
        <div className="max-w-4xl">
          <p className="label text-yellow-300">Company</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-white md:text-6xl">
            SpendGuard is becoming the AI cost governance company for global teams.
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-semibold leading-relaxed text-zinc-400">
            This is not another AI tool. It is an operating layer for companies already shipping AI features and paying for model calls, embeddings, vector storage, cloud inference, logs, and usage-heavy workflows across the organization.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/pricing" className="btn-primary">Start Enterprise Pilot</Link>
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
            <p className="label text-sky-200">Why Customers Will Pay</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
              Customers pay because AI usage cost can quietly break global product margin.
            </h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
              A growing company does not need another generic dashboard. It needs a practical governance system that points to waste in the AI stack and turns unclear usage into finance, engineering, and procurement decisions.
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
        <div className="mb-8 grid gap-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)]">
          <div>
            <p className="label text-emerald-200">Operating Model</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
              Build the company around a repeatable AI cost review rhythm.
            </h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
              A real multinational product needs more than good copy. It needs repeatable evidence collection, ownership, controls, and proof that leadership can review every month.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {operatingModel.map(([stage, text]) => (
              <article key={stage} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                <p className="label text-emerald-200">{stage}</p>
                <p className="mt-3 text-sm font-bold leading-relaxed text-zinc-300">{text}</p>
              </article>
            ))}
          </div>
        </div>

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
