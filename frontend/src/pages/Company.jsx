import React from 'react';
import { Link } from 'react-router-dom';

const companyPillars = [
  ['Sharp focus', 'We focus on AI API and infrastructure cost waste for startups building real AI product features.'],
  ['Engineering-ready reports', 'Recommendations name the model, token, cache, vector, logging, and infrastructure changes to review.'],
  ['Revenue workflow', 'Early access, checkout, account status, and report access are connected so the audit can become a paid service when ready.']
];

const outcomes = [
  'Model provider spend review',
  'Token and context-size waste findings',
  'Embedding and vector database checks',
  'Cloud inference and background job review',
  'Observability and log retention notes',
  'Before/after savings recommendations'
];

const buyers = [
  ['Founders', 'Understand why AI product costs are rising before they damage gross margin.'],
  ['Engineering teams', 'Prioritize cost fixes without turning the audit into a vague finance exercise.'],
  ['Consultants', 'Sell a practical AI usage audit service to startups that already have model and infrastructure bills.']
];

export default function Company() {
  return (
    <main>
      <section className="container-page py-12 md:py-16">
        <div className="max-w-4xl">
          <p className="label text-yellow-300">Company</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-white md:text-6xl">
            SpendGuard Audit helps startups reduce unnecessary AI API and infrastructure costs.
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-semibold leading-relaxed text-zinc-400">
            This is not another AI tool. It is an audit service for teams already shipping AI features and paying for model calls, embeddings, vector storage, cloud inference, logs, and usage-heavy workflows.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/pricing" className="btn-primary">Start Free Access</Link>
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
              The customer pays because AI usage cost can quietly break product margin.
            </h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
              A startup does not need a generic dashboard. It needs a practical report that points to waste in the AI stack and turns unclear usage into engineering decisions.
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
