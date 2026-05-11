import React from 'react';
import { Link } from 'react-router-dom';

const problems = [
  ['Too many tools', 'Teams pay for many AI tools that solve the same job.'],
  ['Unused seats', 'Paid team seats stay active even when people stop using them.'],
  ['No ROI check', 'AI tools feel useful, but nobody checks money saved.'],
  ['API cost growth', 'Chatbots and AI features can become expensive without limits.']
];

export default function Home() {
  return (
    <main className="container-page py-10 md:py-16">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.55fr)] lg:items-end">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-sky-200">
            AI cost optimization SaaS
          </p>
          <h1 className="max-w-5xl text-5xl font-black leading-[0.98] tracking-tight text-white md:text-7xl">
            Help businesses reduce wasted AI spend.
          </h1>
          <p className="mt-6 max-w-3xl text-lg font-semibold leading-relaxed text-zinc-400">
            Run AI tool audits, find unused subscriptions, estimate savings, create reports, and collect payment through Razorpay.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/signup" className="btn-primary">Create Account</Link>
            <Link to="/pricing" className="btn-secondary">See Pricing</Link>
          </div>
        </div>

        <aside className="panel border-emerald-300/20 bg-emerald-300/[0.07]">
          <p className="label text-emerald-200">Audit workflow</p>
          <h2 className="mt-4 text-3xl font-black text-white">Turn client spend into a paid report.</h2>
          <div className="mt-5 grid gap-3">
            {['Collect billing inputs', 'Calculate savings', 'Deliver recommendations', 'Track paid plans'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-bold text-zinc-300">{item}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {problems.map(([title, text]) => (
          <article key={title} className="panel transition hover:-translate-y-1 hover:border-white/20">
            <h2 className="text-xl font-black text-white">{title}</h2>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-500">{text}</p>
          </article>
        ))}
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-3">
        {[
          ['1. Collect spend', 'Ask for tool names, billing screenshots, plan names, and seat counts.'],
          ['2. Find waste', 'Detect unused tools, duplicate tools, wrong plans, and unused seats.'],
          ['3. Sell report', 'Deliver a simple cost saving report and charge for monthly monitoring.']
        ].map(([title, text]) => (
          <article key={title} className="panel">
            <h2 className="text-2xl font-black text-white">{title}</h2>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-500">{text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
