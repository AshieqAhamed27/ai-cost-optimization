import React from 'react';
import { Link } from 'react-router-dom';

const controls = [
  {
    title: 'No secret-key governance flow',
    text: 'SpendGuard is designed around billing exports, screenshots, invoices, usage summaries, and cost line items. Customers should not enter provider API keys or internal passwords.'
  },
  {
    title: 'Focused AI agent boundaries',
    text: 'The AI agent is limited to cost analysis, waste detection, governance questions, and implementation planning. It is instructed not to ask for credentials or invent guaranteed results.'
  },
  {
    title: 'Secure payment handling',
    text: 'When payments are enabled, orders are created and verified through Razorpay. SpendGuard does not collect or store card numbers.'
  },
  {
    title: 'Payment verification',
    text: 'The backend verifies Razorpay payment signatures before activating a paid plan when payments are enabled.'
  },
  {
    title: 'Protected report access',
    text: 'Governance reports are tied to authenticated user accounts, and report creation requires active pilot access or a paid plan.'
  },
  {
    title: 'Report export control',
    text: 'PDF export uses the browser print flow so users decide what to save, share, or keep inside their own workflow.'
  },
  {
    title: 'Password protection',
    text: 'Passwords are hashed with bcrypt before storage, and signup requires stronger passwords.'
  },
  {
    title: 'Request protection',
    text: 'The API uses security headers, CORS allowlisting, JSON size limits, and rate limits on API, auth, and payment routes.'
  },
  {
    title: 'Enterprise readiness without fake claims',
    text: 'We do not claim certifications or office footprints we have not earned. This page states the controls currently built into the product and the posture needed for serious buyers.'
  }
];

const dataPractices = [
  ['What you enter', 'Company name, product type, business type, AI cost lines, monthly costs, usage levels, request volume, token estimates, categories, owners, budgets, and notes.'],
  ['What we use it for', 'Creating AI API and infrastructure governance reports, savings estimates, waste findings, recommendations, progress tracking, and account or future payment status.'],
  ['What we avoid', 'We do not ask for card numbers, bank details, API keys, private model prompts, raw customer records, production credentials, or internal passwords.']
];

const safeInputs = [
  'Provider billing screenshots',
  'CSV or invoice exports',
  'Monthly spend totals',
  'Request and token summaries',
  'Tool names and plan names',
  'Owner and cost-center notes',
  'Budget thresholds and alerts',
  'Architecture notes without secrets'
];

const enterpriseRoadmap = [
  ['Policy controls', 'Document usage limits, approval rules, owner escalation, and monthly review cadence.'],
  ['Audit trail', 'Keep implementation notes, confirmed savings, and report exports available for leadership review.'],
  ['Procurement readiness', 'Use spend evidence and before/after savings to support vendor reviews and negotiation.'],
  ['Certification path', 'Prepare for formal controls over time without pretending certifications are already complete.']
];

export default function Security() {
  return (
    <main>
      <section className="container-page py-12 md:py-16">
        <div className="max-w-4xl">
          <p className="label text-emerald-200">Security And Trust</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-white md:text-6xl">
            Built to earn enterprise trust before paid plans are enabled.
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-semibold leading-relaxed text-zinc-400">
            Security is part of the product promise: customers should know what to share, what not to share, and how account access, future payment, AI agent, governance reports, and spend data are protected.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/pricing" className="btn-primary">Start Free Pilot</Link>
            <Link to="/privacy" className="btn-secondary">Read Privacy Policy</Link>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-black/15 py-12">
        <div className="container-page grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {controls.map((control) => (
            <article key={control.title} className="panel">
              <h2 className="text-xl font-black text-white">{control.title}</h2>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-500">{control.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page py-12 md:py-16">
        <div className="max-w-3xl">
            <p className="label text-yellow-300">Data Practices</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
            We ask for business spend data, not sensitive secrets.
            </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {dataPractices.map(([title, text]) => (
            <article key={title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <h3 className="text-lg font-black text-white">{title}</h3>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-500">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-black/15 py-12 md:py-16">
        <div className="container-page grid gap-8 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,1fr)]">
          <div>
            <p className="label text-emerald-200">Safe Governance Inputs</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
              Useful evidence without handing over operational control.
            </h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
              A serious governance review can start with spend evidence and workflow context. Secret credentials are not required for the first report.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {safeInputs.map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm font-bold text-zinc-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.68fr)_minmax(0,1fr)]">
          <div>
            <p className="label text-sky-200">Enterprise Roadmap</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
              Trust grows from controls that can be reviewed.
            </h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-zinc-400">
              The product is ready to be sold seriously because it names the next trust steps instead of pretending they are already complete.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {enterpriseRoadmap.map(([title, text]) => (
              <article key={title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                <h3 className="text-lg font-black text-white">{title}</h3>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-500">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
