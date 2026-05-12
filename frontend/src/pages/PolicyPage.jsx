import React from 'react';
import { Link } from 'react-router-dom';

const policies = {
  privacy: {
    label: 'Privacy Policy',
    title: 'Privacy built around business audit data.',
    intro: 'AI Cost Audit collects only the account, payment status, and AI spend details needed to create and manage audits.',
    sections: [
      ['Information we collect', 'Name, email, company name, plan status, payment references, audit inputs, and generated report information.'],
      ['How we use information', 'We use this data to authenticate accounts, manage trial and paid plan access, create audit reports, and improve the service workflow.'],
      ['Payment data', 'Card and bank payment details are handled by Razorpay. AI Cost Audit stores payment references and status, not card numbers.'],
      ['Sensitive data', 'Customers should not enter API keys, private credentials, legal secrets, employee personal data, or confidential model prompts into audit notes.'],
      ['Data access', 'Audit reports are tied to authenticated accounts. Users should keep their account password private and use a strong password.']
    ]
  },
  terms: {
    label: 'Terms',
    title: 'Clear terms for a paid audit service.',
    intro: 'These terms explain the basic service promise: users pay for access to AI spend audit reports and related recommendations.',
    sections: [
      ['Service scope', 'AI Cost Audit provides software-assisted AI spend reviews, savings estimates, and recommendations based on user-entered data.'],
      ['Customer responsibility', 'Customers are responsible for entering accurate tool names, costs, seats, and usage levels.'],
      ['No guaranteed savings', 'Reports provide recommendations and estimates. Actual savings depend on vendor contracts, usage, negotiation, and customer decisions.'],
      ['Account access', 'Report creation requires an authenticated account with an active 7-day trial or paid plan.'],
      ['Acceptable use', 'Do not submit illegal content, stolen data, credentials, payment card numbers, or information you are not authorized to process.']
    ]
  },
  refunds: {
    label: 'Refund Policy',
    title: 'A simple refund policy builds buyer confidence.',
    intro: 'This policy gives customers clarity before they pay and helps the business handle payment concerns professionally.',
    sections: [
      ['Before report creation', 'If a customer pays by mistake and has not created an audit report, support can review the payment for a refund.'],
      ['After report creation', 'Once a report has been generated, refunds are reviewed case by case because the audit service has been delivered.'],
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
          Review the plan options and complete checkout only when the business value is clear.
        </p>
        <Link to="/pricing" className="btn-primary mt-5">View Paid Plans</Link>
      </section>
    </main>
  );
}
