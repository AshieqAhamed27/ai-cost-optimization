import React from 'react';
import { Link } from 'react-router-dom';

const footerLinks = [
  ['Company', '/company'],
  ['Security', '/security'],
  ['Early Access and Plans', '/pricing'],
  ['Create Account', '/signup'],
  ['Login', '/login']
];

const legalLinks = [
  ['Privacy Policy', '/privacy'],
  ['Terms', '/terms'],
  ['Refund Policy', '/refunds']
];

const serviceLinks = [
  'AI API usage audit',
  'Infrastructure cost review',
  'Model routing recommendations',
  'Before and after savings report'
];

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-white/10 bg-slate-950">
      <div className="container-page py-12">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(220px,0.55fr)_minmax(220px,0.65fr)_minmax(220px,0.55fr)_minmax(220px,0.55fr)]">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/spendguard-logo.png"
                alt="SpendGuard Audit logo"
                className="h-11 w-11 rounded-lg object-cover"
              />
              <span>
                <span className="block text-base font-black text-white">SpendGuard Audit</span>
                <span className="block text-xs font-bold text-zinc-500">AI API and infrastructure audits</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xl text-sm font-semibold leading-relaxed text-zinc-500">
              We help startups review AI API and infrastructure costs, find waste, and deliver clear savings recommendations.
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
              <p>Free early access now</p>
              <p>Razorpay checkout ready for later</p>
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
          <p>Built for startups that want controlled AI usage costs.</p>
        </div>
      </div>
    </footer>
  );
}
