import React from 'react';
import { Link } from 'react-router-dom';
import PricingCards from '../components/PricingCards';
import TrialCallout from '../components/TrialCallout';
import { formatCurrency } from '../utils/api';

const metrics = [
  ['Free trial', '7 days'],
  ['Entry plan', formatCurrency(999)],
  ['Checkout', 'Razorpay verified'],
  ['Reports', 'Trial plus paid']
];

const services = [
  {
    title: 'Subscription waste audit',
    text: 'Review the paid software, SaaS tools, seats, add-ons, and recurring subscriptions the business is already paying for.'
  },
  {
    title: 'Waste and risk analysis',
    text: 'Identify unused seats, duplicate tools, low-usage products, wrong plan tiers, and spending patterns that can scale too quickly.'
  },
  {
    title: 'Savings recommendation report',
    text: 'Turn the numbers into a clear action plan with monthly cost, yearly opportunity, and practical next steps for decision makers.'
  },
  {
    title: 'Ongoing cost monitoring',
    text: 'Use monthly follow-up to keep software spend controlled as more people, tools, and workflows enter the company.'
  }
];

const workflow = [
  ['Trial account', 'Customers start with 7 days of report creation before choosing a paid plan.'],
  ['Company intake', 'Add company details, software subscriptions, monthly spend, seats, and usage levels.'],
  ['Automated audit', 'The platform calculates waste signals, estimated savings, and yearly cost opportunity.'],
  ['Client delivery', 'Use the report to recommend cancellations, downgrades, consolidation, or monitoring.']
];

const audiences = [
  'Consultants selling cost audits',
  'Agencies managing client software spend',
  'Founders reviewing monthly software bills',
  'Operations teams standardizing tool usage',
  'Finance teams watching SaaS expansion',
  'IT teams consolidating duplicate products'
];

const payReasons = [
  {
    title: 'Recover recurring waste',
    text: 'The audit is priced so one cancelled duplicate tool, downgraded plan, or unused-seat cleanup can justify the purchase.'
  },
  {
    title: 'Get a decision-ready report',
    text: 'Customers pay for a clear business document, not a raw calculator. The report explains spend, savings, and action steps.'
  },
  {
    title: 'Create a repeatable savings process',
    text: 'Monthly monitoring turns one audit into an ongoing cost-control workflow as software usage expands.'
  }
];

const trustSignals = [
  ['Razorpay checkout', 'Payments are handled by Razorpay, and card details are not stored by SpendGuard Audit.'],
  ['Verified access', 'Paid plans unlock report creation only after payment verification.'],
  ['Account protection', 'Reports live inside authenticated accounts with API rate limits and security headers.'],
  ['Transparent policies', 'Privacy, terms, refund, and security pages explain how the service works before payment.']
];

export default function Home() {
  return (
    <main>
      <section className="container-page py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)] lg:items-center">
          <div>
            <p className="mb-5 inline-flex rounded-lg border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-sky-200">
              B2B software spend audit company
            </p>
            <h1 className="max-w-5xl text-5xl font-black leading-[0.98] text-white md:text-7xl">
              Stop paying for software your team does not use.
            </h1>
            <p className="mt-6 max-w-3xl text-lg font-semibold leading-relaxed text-zinc-400">
              SpendGuard Audit helps companies and consultants find unused subscriptions, wasted seats, duplicate tools, and wrong plan tiers, then turn the findings into client-ready savings reports.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="btn-primary">Start 7-Day Free Trial</Link>
              <a href="#plans" className="btn-secondary">View Paid Plans</a>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map(([label, value]) => (
                <div key={label} className="border-l border-white/10 pl-4">
                  <p className="label">{label}</p>
                  <p className="mt-1 text-xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30">
            <img
              src="/report-preview.svg"
              alt="Software spend audit report preview"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-black/15 py-8">
        <div className="container-page grid gap-4 md:grid-cols-3">
          {[
            ['Trial first', 'New accounts can test report creation for 7 days before paying.'],
            ['Business ready', 'Built around clients, companies, plans, reports, and spend data.'],
            ['Operational service', 'Clear workflow from checkout to audit delivery.']
          ].map(([title, text]) => (
            <div key={title} className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-lg font-black text-white">{title}</h2>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-12 md:py-16">
        <div className="max-w-3xl">
          <p className="label text-yellow-300">What The Product Provides</p>
          <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
            A complete software cost-control service with checkout and reports.
          </h2>
          <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
            The product gives a business a concrete reason to pay: audit subscriptions, calculate avoidable spend, and receive recommendations that can reduce monthly software costs.
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
      </section>

      <section className="border-y border-white/10 bg-black/15 py-12 md:py-16">
        <div className="container-page">
          <div className="max-w-3xl">
            <p className="label text-emerald-200">Why Businesses Pay</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
              The offer is simple: pay for an audit that can reveal avoidable recurring costs.
            </h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
              Buyers care about the return, the report, and whether the service feels trustworthy. The website now presents all three before checkout.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {payReasons.map((reason) => (
              <article key={reason.title} className="panel">
                <h3 className="text-xl font-black text-white">{reason.title}</h3>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-500">{reason.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.68fr)_minmax(0,1fr)]">
          <div>
            <p className="label text-sky-200">Trust Before Payment</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
              Security, policies, and payment controls make the company feel real.
            </h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
              Customers can review how checkout, account access, refunds, and audit data work before buying a plan.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/security" className="btn-secondary">Security Details</Link>
              <Link to="/privacy" className="btn-secondary">Privacy Policy</Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {trustSignals.map(([title, text]) => (
              <article key={title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                <h3 className="text-lg font-black text-white">{title}</h3>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-500">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="plans" className="border-y border-white/10 bg-slate-900/45 py-12 md:py-16">
        <div className="container-page">
          <TrialCallout />

          <div className="mb-8 mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(280px,0.4fr)] lg:items-end">
            <div>
              <p className="label text-emerald-200">Plans And Checkout</p>
              <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
                Start free, then choose a paid plan when the trial proves value.
              </h2>
              <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
                Trial users can create reports for 7 days. After that, secure Razorpay checkout keeps the report workflow active.
              </p>
            </div>
            <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/[0.06] p-5">
              <p className="label text-emerald-200">Revenue Control</p>
              <p className="mt-3 text-2xl font-black text-white">Trial converts to paid</p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-500">
                The trial removes purchase friction, then report creation requires payment after 7 days.
              </p>
            </div>
          </div>

          <PricingCards compact />
        </div>
      </section>

      <section className="container-page py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.68fr)_minmax(0,1fr)]">
          <div>
            <p className="label text-sky-200">Delivery Workflow</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
              From payment to client-ready audit report.
            </h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
              SpendGuard Audit supports the full operating model: sell the audit, collect payment, capture spend data, and deliver recommendations.
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
        <div className="grid gap-8 rounded-lg border border-yellow-300/20 bg-yellow-300/[0.06] p-6 md:p-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]">
          <div>
            <p className="label text-yellow-200">Who Can Use It</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
              Built for teams that want software cost control to become a paid service.
            </h2>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="btn-primary">Start Free Trial</Link>
              <Link to="/pricing" className="btn-secondary">Compare Plans</Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {audiences.map((item) => (
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
