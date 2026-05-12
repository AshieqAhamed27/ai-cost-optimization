import React from 'react';
import { Link } from 'react-router-dom';

const footerLinks = [
  ['Company', '/company'],
  ['Security', '/security'],
  ['Plans and Payment', '/pricing'],
  ['Create Account', '/signup'],
  ['Login', '/login']
];

const legalLinks = [
  ['Privacy Policy', '/privacy'],
  ['Terms', '/terms'],
  ['Refund Policy', '/refunds']
];

const serviceLinks = [
  'Software subscription audit',
  'Unused seat review',
  'Duplicate tool analysis',
  'Savings recommendation reports'
];

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-white/10 bg-slate-950">
      <div className="container-page py-12">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(220px,0.55fr)_minmax(220px,0.65fr)_minmax(220px,0.55fr)_minmax(220px,0.55fr)]">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-sky-300 to-yellow-300 text-sm font-black text-slate-950">
                SG
              </span>
              <span>
                <span className="block text-base font-black text-white">SpendGuard Audit</span>
                <span className="block text-xs font-bold text-zinc-500">Paid software spend audits</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xl text-sm font-semibold leading-relaxed text-zinc-500">
              We help companies, consultants, and agencies review subscription waste, collect payment, and deliver clear savings recommendations.
            </p>
          </div>

          <div>
            <p className="label text-zinc-400">Product</p>
            <nav className="mt-4 grid gap-3">
              {footerLinks.map(([label, to]) => (
                <Link key={label} to={to} className="text-sm font-bold text-zinc-400 transition hover:text-white">
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="label text-zinc-400">Services</p>
            <div className="mt-4 grid gap-3 text-sm font-bold text-zinc-400">
              {serviceLinks.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>

          <div>
            <p className="label text-zinc-400">Business Model</p>
            <div className="mt-4 grid gap-3 text-sm font-bold text-zinc-400">
              <p>Secure checkout by Razorpay</p>
              <p>Paid plans unlock audit reports</p>
              <p>Built for repeat monthly monitoring</p>
            </div>
          </div>

          <div>
            <p className="label text-zinc-400">Trust</p>
            <nav className="mt-4 grid gap-3">
              {legalLinks.map(([label, to]) => (
                <Link key={label} to={to} className="text-sm font-bold text-zinc-400 transition hover:text-white">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs font-bold uppercase tracking-widest text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright 2026 SpendGuard Audit. All rights reserved.</p>
          <p>Built for businesses that want controlled software spend.</p>
        </div>
      </div>
    </footer>
  );
}
