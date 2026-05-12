import React from 'react';
import { Link } from 'react-router-dom';

const controls = [
  {
    title: 'Secure payment handling',
    text: 'Payments are created and verified through Razorpay. SpendGuard Audit does not collect or store card numbers.'
  },
  {
    title: 'Payment verification',
    text: 'The backend verifies Razorpay payment signatures before activating a paid plan after the free trial.'
  },
  {
    title: 'Protected report access',
    text: 'Audit reports are tied to authenticated user accounts, and report creation requires an active trial or paid plan.'
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
    title: 'Honest security posture',
    text: 'We do not claim enterprise certifications we have not earned. This page states the controls currently built into the product.'
  }
];

const dataPractices = [
  ['What you enter', 'Company name, business type, AI cost line names, monthly costs, usage levels, categories, and notes.'],
  ['What we use it for', 'Creating AI API and infrastructure cost audits, savings estimates, report recommendations, and account/payment status.'],
  ['What we avoid', 'We do not ask for card numbers, bank details, API keys, private model prompts, or internal passwords.']
];

export default function Security() {
  return (
    <main>
      <section className="container-page py-12 md:py-16">
        <div className="max-w-4xl">
          <p className="label text-emerald-200">Security And Trust</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-white md:text-6xl">
            Built to earn trust before a business pays for an audit.
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-semibold leading-relaxed text-zinc-400">
            Security is part of the product promise: customers should know how payment, account access, and report data are protected before they decide to buy.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/pricing" className="btn-primary">Buy Securely</Link>
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
    </main>
  );
}
