import React from 'react';
import { Link } from 'react-router-dom';

const policies = {
  privacy: {
    label: 'Privacy Policy',
    title: 'Privacy built around business governance data.',
    intro: 'SpendGuard collects only the account, access status, future payment status, and AI API or infrastructure spend details needed to create and manage governance reports.',
    sections: [
      ['Information we collect', 'Name, email, company name, access status, payment references when payments are enabled, governance inputs, and generated report information.'],
      ['How we use information', 'We use this data to authenticate accounts, manage pilot or paid plan access, create governance reports, and improve the service workflow.'],
      ['Payment data', 'Payments are not required for pilot users. When paid plans are enabled, card and bank payment details are handled by Razorpay, and SpendGuard stores payment references and status, not card numbers.'],
      ['Sensitive data', 'Customers should not enter API keys, private credentials, legal secrets, employee personal data, or confidential model prompts into report notes.'],
      ['Data access', 'Governance reports are tied to authenticated accounts. Users should keep their account password private and use a strong password.']
    ]
  },
  terms: {
    label: 'Terms',
    title: 'Clear terms for an early pilot governance service.',
    intro: 'These terms explain the basic service promise: pilot users can access AI API and infrastructure cost governance reports while paid plans remain available for a future launch.',
    sections: [
      ['Service scope', 'SpendGuard provides AI usage and infrastructure cost reviews, savings estimates, and recommendations based on user-entered data.'],
      ['Customer responsibility', 'Customers are responsible for entering accurate cost line names, monthly costs, categories, and usage levels.'],
      ['No guaranteed savings', 'Reports provide recommendations and estimates. Actual savings depend on vendor contracts, usage, negotiation, and customer decisions.'],
      ['Account access', 'Report creation requires an authenticated account with active pilot access or a paid plan.'],
      ['Acceptable use', 'Do not submit illegal content, stolen data, credentials, payment card numbers, or information you are not authorized to process.']
    ]
  },
  refunds: {
    label: 'Refund Policy',
    title: 'A simple refund policy builds buyer confidence.',
    intro: 'This policy gives customers clarity before paid plans are enabled and helps the business handle payment concerns professionally later.',
    sections: [
      ['Before report creation', 'When paid plans are enabled, if a customer pays by mistake and has not created a governance report, support can review the payment for a refund.'],
      ['After report creation', 'Once a report has been generated, refunds are reviewed case by case because the governance service has been delivered.'],
      ['Failed payments', 'If Razorpay shows a failed payment, the plan is not activated. Customers should retry checkout or contact support with the payment reference.'],
      ['Duplicate payments', 'Duplicate successful payments for the same account and plan should be reviewed and refunded where appropriate.'],
      ['Contact requirement', 'Refund requests should include the account email, payment date, plan, and Razorpay payment reference if available.']
    ]
  }
};

export default function PolicyPage({ type }) {
  const policy = policies[type] || policies.privacy;

  return (
    <main className="container-page py-12 md:py-16">
      <section className="max-w-4xl">
        <p className="label text-yellow-300">{policy.label}</p>
        <h1 className="mt-3 text-4xl font-black leading-tight text-white md:text-6xl">
          {policy.title}
        </h1>
        <p className="mt-5 max-w-3xl text-lg font-semibold leading-relaxed text-zinc-400">
          {policy.intro}
        </p>
      </section>

      <section className="mt-10 grid gap-4">
        {policy.sections.map(([title, text]) => (
          <article key={title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-xl font-black text-white">{title}</h2>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-500">{text}</p>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-lg border border-emerald-300/20 bg-emerald-300/[0.06] p-6">
        <h2 className="text-2xl font-black text-white">Ready to start?</h2>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-500">
          Start a free enterprise pilot now. Paid plan checkout can be enabled later when the business value is clear.
        </p>
        <Link to="/pricing" className="btn-primary mt-5">View Access</Link>
      </section>
    </main>
  );
}
