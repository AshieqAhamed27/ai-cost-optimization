import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/api';

const services = [
  {
    title: 'AI spend audit',
    text: 'Review every AI subscription, chatbot, automation tool, and seat your team is paying for.'
  },
  {
    title: 'Waste detection',
    text: 'Find unused seats, duplicate tools, low-usage products, wrong plans, and fast-growing API costs.'
  },
  {
    title: 'Savings report',
    text: 'Generate a client-ready report with monthly spend, possible savings, and a clear action plan.'
  },
  {
    title: 'Monthly monitoring',
    text: 'Track spending over time so AI costs stay controlled as the team adopts more tools.'
  }
];

const workflow = [
  ['1. Choose a paid plan', 'Payment unlocks report creation so every audit starts as revenue.'],
  ['2. Add real client data', 'Enter company details, tool names, monthly cost, seats, and usage level.'],
  ['3. Review savings', 'The system calculates possible monthly and yearly savings from the submitted spend.'],
  ['4. Deliver the report', 'Use the recommendations to help the client cancel, downgrade, or consolidate tools.']
];

const inclusions = [
  'Tool and subscription inventory',
  'Monthly spend and yearly opportunity',
  'Low-usage and unused tool review',
  'Seat waste estimate',
  'Duplicate tool risk review',
  'Client-ready recommendations'
];

export default function Home() {
  return (
    <main>
      <section className="container-page py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.78fr)] lg:items-center">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-sky-200">
              AI cost optimization service
            </p>
            <h1 className="max-w-5xl text-5xl font-black leading-[0.98] text-white md:text-7xl">
              Find wasted AI spend and turn it into measurable savings.
            </h1>
            <p className="mt-6 max-w-3xl text-lg font-semibold leading-relaxed text-zinc-400">
              AI Cost Audit helps businesses review AI tools, calculate savings, and receive a practical report before costs grow out of control.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/pricing" className="btn-primary">View Paid Plans</Link>
              <Link to="/signup" className="btn-secondary">Create Account</Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ['Plans from', formatCurrency(999)],
                ['Report flow', 'Paid first'],
                ['Checkout', 'Razorpay']
              ].map(([label, value]) => (
                <div key={label} className="border-l border-white/10 pl-4">
                  <p className="label">{label}</p>
                  <p className="mt-1 text-xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30">
            <img
              src="/report-preview.svg"
              alt="AI cost audit report preview"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-black/15 py-12">
        <div className="container-page">
          <div className="max-w-3xl">
            <p className="label text-yellow-300">What We Provide</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
              A complete AI cost audit service for teams using paid AI tools.
            </h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
              The product is built for founders, agencies, consultants, and businesses that need a clear view of AI software spend and a practical plan to reduce waste.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {services.map((service) => (
              <article key={service.title} className="panel transition hover:-translate-y-1 hover:border-white/20">
                <h3 className="text-xl font-black text-white">{service.title}</h3>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-500">{service.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]">
          <div>
            <p className="label text-emerald-200">How It Works</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
              A paid workflow from checkout to client-ready report.
            </h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
              Report creation stays locked until payment is active, so the product supports real revenue instead of unpaid report generation.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {workflow.map(([title, text]) => (
              <article key={title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                <h3 className="text-lg font-black text-white">{title}</h3>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-500">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page pb-14 md:pb-20">
        <div className="grid gap-8 rounded-3xl border border-yellow-300/20 bg-yellow-300/[0.06] p-6 md:p-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]">
          <div>
            <p className="label text-yellow-200">Included In Each Audit</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
              Clear numbers, specific waste signals, and recommendations a client can act on.
            </h2>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/pricing" className="btn-primary">Buy Audit Plan</Link>
              <Link to="/signup" className="btn-secondary">Create Account</Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {inclusions.map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-sm font-bold text-zinc-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
